import { orderRepository } from '../repositories/order.repository';
import { customerRepository } from '../repositories/customer.repository';
import { auditService } from './audit.service';

export class OrderService {
  generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${year}-${random}`;
  }

  async getAllOrders(filters: any, limit: number) {
    return await orderRepository.findAll(filters, limit);
  }

  async getOrderById(id: string) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new Error('Orden no encontrada');
    }
    return order;
  }

  async createOrder(data: any, userId: string = 'SYSTEM') {
    const {
      customer_id, items, discount = 0, tax = 0, payment_method, payment_status = 'pending',
      delivery_method, delivery_address, delivery_cost = 0, notes, created_by
    } = data;

    if (!customer_id || !items || items.length === 0 || !payment_method) {
      throw new Error('Faltan campos requeridos');
    }

    const customer = await customerRepository.findById(customer_id);
    if (!customer) {
      throw new Error('Cliente no encontrado');
    }

    // Verify stock
    const productIds = items.map((i: any) => i.product_id);
    const inventories = await orderRepository.checkInventory(productIds);
    
    const invalidItems = [];
    for (const item of items) {
      const inventory = inventories.find(inv => inv.product_id === item.product_id);
      if (!inventory) {
        invalidItems.push({ valid: false, product_id: item.product_id, message: 'Producto no tiene inventario' });
      } else if (inventory.quantity < item.quantity) {
        invalidItems.push({
          valid: false,
          product_id: item.product_id,
          product_name: inventory.product.name,
          available: inventory.quantity,
          requested: item.quantity,
          message: `Stock insuficiente. Disponible: ${inventory.quantity}, Solicitado: ${item.quantity}`
        });
      }
    }

    if (invalidItems.length > 0) {
      const error: any = new Error('Stock insuficiente');
      error.invalid_items = invalidItems;
      throw error;
    }

    const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * Number(item.unit_price)), 0);
    const total = subtotal - Number(discount) + Number(tax) + Number(delivery_cost);

    let orderNumber = this.generateOrderNumber();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await orderRepository.findByOrderNumber(orderNumber);
      if (!existing) break;
      orderNumber = this.generateOrderNumber();
      attempts++;
    }

    const orderData = {
      order_number: orderNumber,
      customer_id,
      status: 'pending',
      subtotal,
      discount: Number(discount),
      tax: Number(tax),
      total,
      payment_method,
      payment_status,
      delivery_method,
      delivery_address,
      delivery_cost: Number(delivery_cost),
      notes,
      created_by
    };

    const result = await orderRepository.createOrderTransaction(orderData, items, payment_status, payment_method);
    await auditService.logAction('ORDER', result.order.id, 'CREATE', userId, null, result.order);
    return result;
  }

  async updateOrder(id: string, data: any, userId: string = 'SYSTEM') {
    const existing = await orderRepository.findById(id);
    const updateData = {
      ...data,
      discount: data.discount !== undefined ? Number(data.discount) : undefined,
      tax: data.tax !== undefined ? Number(data.tax) : undefined,
      delivery_cost: data.delivery_cost !== undefined ? Number(data.delivery_cost) : undefined,
    };
    const updated = await orderRepository.update(id, updateData);
    await auditService.logAction('ORDER', id, 'UPDATE', userId, existing, updated);
    return updated;
  }

  async updateOrderStatus(id: string, status: string, userId: string = 'SYSTEM') {
    if (!status) throw new Error('Estado requerido');
    
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) throw new Error('Estado inválido');

    const existingOrder = await orderRepository.getOrderWithInventory(id);
    if (!existingOrder) throw new Error('Orden no encontrada');

    if (status === 'cancelled' && existingOrder.status !== 'cancelled') {
      await orderRepository.cancelOrderTransaction(existingOrder, status, userId);
    } else {
      await orderRepository.updateStatus(id, status);
    }

    const updated = await orderRepository.findById(id);
    await auditService.logAction('ORDER', id, 'UPDATE_STATUS', userId, existingOrder, updated);
    return updated;
  }

  async deleteOrder(id: string, userId: string = 'SYSTEM') {
    const order = await orderRepository.getOrderWithInventory(id);
    if (!order) throw new Error('Orden no encontrada');

    if (order.status === 'completed') {
      throw new Error('No se pueden eliminar órdenes completadas por temas contables. Si necesitas anularla, cambia su estado a cancelada primero si tienes los permisos.');
    }

    if (order.status !== 'cancelled') {
      await orderRepository.deleteOrderTransaction(order);
    } else {
      await orderRepository.delete(id);
    }
    
    await auditService.logAction('ORDER', id, 'DELETE', userId, order, { is_active: false });
    return { message: 'Orden eliminada correctamente' };
  }

  async registerPayment(id: string, paymentData: any, userId: string = 'SYSTEM') {
    if (!paymentData.amount || !paymentData.method) {
      throw new Error('Monto y método de pago requeridos');
    }

    const order = await orderRepository.findById(id);
    if (!order) throw new Error('Orden no encontrada');

    const payment = await orderRepository.createPayment(id, paymentData);

    const totalPaid = order.payments.reduce((sum, p) => sum + Number(p.amount), 0) + Number(paymentData.amount);
    let paymentStatus = 'pending';
    if (totalPaid >= Number(order.total)) paymentStatus = 'paid';
    else if (totalPaid > 0) paymentStatus = 'partial';

    await orderRepository.updateStatus(id, order.status); // This is just to trigger the update on the DB
    await orderRepository.update(id, { payment_status: paymentStatus });
    
    await auditService.logAction('ORDER', id, 'REGISTER_PAYMENT', userId, null, payment);
    return payment;
  }
}

export const orderService = new OrderService();
