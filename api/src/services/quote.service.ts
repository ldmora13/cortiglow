import { quoteRepository } from '../repositories/quote.repository';
import { generateQuoteNumber, calculateQuoteItem, calculateQuoteTotals } from '../utils/quoteHelpers';
import { auditService } from './audit.service';

export class QuoteService {
  async getAllQuotes(filters: any) {
    return await quoteRepository.findAll(filters);
  }

  async getQuoteById(id: string) {
    const quote = await quoteRepository.findById(id);
    if (!quote) throw new Error('Quote not found');
    return quote;
  }

  private async prepareCalculatedItems(items: any[]) {
    let itemsSubtotal = 0;
    const calculatedItems = [];

    for (const item of items) {
      const product = await quoteRepository.findProduct(item.product_id);
      if (!product) throw new Error(`Product not found: ${item.product_id}`);

      let finish = null;
      if (item.finish_id) {
        finish = await quoteRepository.findFinish(item.finish_id);
        if (!finish) throw new Error(`Finish not found: ${item.finish_id}`);
      }

      const calculation = calculateQuoteItem(item, product, finish);

      calculatedItems.push({
        product_id: item.product_id,
        item_type: item.item_type,
        quantity: item.quantity || 1,
        unit_price: calculation.unit_price,
        width_meters: item.width_meters,
        height_meters: item.height_meters,
        square_meters: calculation.square_meters,
        fabric_type: item.fabric_type,
        finish_id: item.finish_id,
        finish_price: calculation.finish_price,
        subtotal: calculation.subtotal
      });

      itemsSubtotal += calculation.subtotal;
    }

    return { calculatedItems, itemsSubtotal };
  }

  async createQuote(data: any, userId: string = 'SYSTEM') {
    const { customer_id, items, discount = 0, notes, valid_until, created_by } = data;

    if (!customer_id || !items || items.length === 0) {
      throw new Error('Missing required fields: customer_id, items');
    }
    if (!valid_until) throw new Error('valid_until date is required');

    const quote_number = await generateQuoteNumber();
    const { calculatedItems, itemsSubtotal } = await this.prepareCalculatedItems(items);
    const totals = calculateQuoteTotals(itemsSubtotal, discount);

    const quoteData = {
      quote_number,
      customer_id,
      status: 'draft',
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total,
      notes,
      valid_until: new Date(valid_until),
      created_by
    };

    const quote = await quoteRepository.createQuoteWithItems(quoteData, calculatedItems);
    await auditService.logAction('QUOTE', quote.id, 'CREATE', userId, null, quote);
    return quote;
  }

  async updateQuote(id: string, data: any, userId: string = 'SYSTEM') {
    const existingQuote = await quoteRepository.findById(id);
    if (!existingQuote) throw new Error('Quote not found');

    if (existingQuote.status !== 'draft' && existingQuote.status !== data.status) {
      throw new Error('Only draft quotes can be fully edited');
    }

    if (data.items && data.items.length > 0) {
      const { calculatedItems, itemsSubtotal } = await this.prepareCalculatedItems(data.items);
      const discountNum = data.discount !== undefined ? data.discount : Number(existingQuote.discount);
      const totals = calculateQuoteTotals(itemsSubtotal, discountNum);

      const updateData = {
        ...(data.customer_id && { customer_id: data.customer_id }),
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        total: totals.total,
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.valid_until && { valid_until: new Date(data.valid_until) }),
        ...(data.status && { status: data.status }),
      };

      const updated = await quoteRepository.updateQuoteWithItems(id, updateData, calculatedItems);
      await auditService.logAction('QUOTE', id, 'UPDATE', userId, existingQuote, updated);
      return updated;
    }

    // Update without items
    const updateData: any = {};
    if (data.customer_id) updateData.customer_id = data.customer_id;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.valid_until) updateData.valid_until = new Date(data.valid_until);
    if (data.status) updateData.status = data.status;

    if (data.discount !== undefined) {
      const totals = calculateQuoteTotals(Number(existingQuote.subtotal), data.discount);
      updateData.discount = totals.discount;
      updateData.tax = totals.tax;
      updateData.total = totals.total;
    }

    const updated = await quoteRepository.updateQuote(id, updateData);
    await auditService.logAction('QUOTE', id, 'UPDATE', userId, existingQuote, updated);
    return updated;
  }

  async deleteQuote(id: string, userId: string = 'SYSTEM') {
    const quote = await quoteRepository.findById(id);
    if (!quote) throw new Error('Quote not found');

    if (quote.status === 'converted') {
      throw new Error('Cannot delete converted quotes');
    }

    await quoteRepository.delete(id);
    await auditService.logAction('QUOTE', id, 'DELETE', userId, quote, { is_active: false });
    return { message: 'Quote deleted successfully' };
  }

  async updateQuoteStatus(id: string, status: string, userId: string = 'SYSTEM') {
    if (!status) throw new Error('Status is required');

    const validStatuses = ['draft', 'sent', 'accepted', 'rejected', 'converted', 'expired'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const existing = await quoteRepository.findById(id);
    const updated = await quoteRepository.updateStatus(id, status);
    await auditService.logAction('QUOTE', id, 'UPDATE_STATUS', userId, existing, updated);
    return updated;
  }

  async convertToOrder(id: string, data: any, userId: string = 'SYSTEM') {
    const { payment_method = 'efectivo', delivery_cost = 0, created_by } = data;
    const quote = await quoteRepository.findById(id);

    if (!quote) throw new Error('Quote not found');
    if (quote.status !== 'accepted') throw new Error('Only accepted quotes can be converted to orders');
    if (quote.converted_order_id) throw new Error('Quote already converted to order');

    const invalidItems = [];
    for (const item of quote.items) {
      if (item.item_type === 'unit') {
        const availableStock = item.product.inventory?.quantity || 0;
        if (availableStock < item.quantity) {
          invalidItems.push({
            product_name: item.product.name,
            requested: item.quantity,
            available: availableStock,
            message: `Solo hay ${availableStock} unidades disponibles`
          });
        }
      }
    }

    if (invalidItems.length > 0) {
      const error: any = new Error('Insufficient stock for some items');
      error.invalid_items = invalidItems;
      throw error;
    }

    const year = new Date().getFullYear();
    const lastOrder = await quoteRepository.getLastOrderNumber(year);
    let nextNumber = 1;
    if (lastOrder) {
      const lastNumberStr = lastOrder.order_number.split('-')[2];
      nextNumber = parseInt(lastNumberStr, 10) + 1;
    }
    const order_number = `ORD-${year}-${String(nextNumber).padStart(4, '0')}`;

    const orderData = {
      order_number,
      customer_id: quote.customer_id,
      status: 'pending',
      subtotal: quote.subtotal,
      discount: quote.discount,
      tax: quote.tax,
      total: Number(quote.total) + Number(delivery_cost),
      payment_method,
      delivery_cost: Number(delivery_cost),
      notes: quote.notes,
      created_by
    };

    const newOrder = await quoteRepository.convertToOrderTransaction(quote, orderData, created_by);
    await auditService.logAction('QUOTE', id, 'CONVERT_TO_ORDER', userId, quote, { order_id: newOrder.id });
    await auditService.logAction('ORDER', newOrder.id, 'CREATE', userId, null, newOrder);

    return {
      message: 'Quote converted to order successfully',
      order: newOrder,
      quote_number: quote.quote_number
    };
  }
}

export const quoteService = new QuoteService();
