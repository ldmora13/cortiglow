import prisma from '../prisma';

export class QuoteRepository {
  async findAll(filters: any) {
    filters.is_active = true;
    return prisma.quote.findMany({
      where: filters,
      include: {
        customer: true,
        items: {
          include: {
            product: true,
            finish: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async findById(id: string) {
    return prisma.quote.findFirst({
      where: { id, is_active: true },
      include: {
        customer: true,
        items: {
          include: {
            product: { include: { category: true, inventory: true } },
            finish: true
          }
        },
        converted_order: true
      }
    });
  }

  async createQuoteWithItems(data: any, calculatedItems: any[]) {
    return prisma.quote.create({
      data: {
        ...data,
        items: {
          create: calculatedItems
        }
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
            finish: true
          }
        }
      }
    });
  }

  async updateQuote(id: string, updateData: any) {
    return prisma.quote.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        items: {
          include: {
            product: true,
            finish: true
          }
        }
      }
    });
  }

  async updateQuoteWithItems(id: string, updateData: any, calculatedItems: any[]) {
    return prisma.$transaction(async (tx) => {
      await tx.quoteItem.deleteMany({ where: { quote_id: id } });

      return tx.quote.update({
        where: { id },
        data: {
          ...updateData,
          items: {
            create: calculatedItems
          }
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
              finish: true
            }
          }
        }
      });
    });
  }

  async updateStatus(id: string, status: string) {
    return prisma.quote.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        items: { include: { product: true, finish: true } }
      }
    });
  }

  async delete(id: string) {
    return prisma.quote.update({ 
      where: { id },
      data: { is_active: false }
    });
  }

  async findProduct(productId: string) {
    return prisma.product.findFirst({ where: { id: productId, is_active: true } });
  }

  async findFinish(finishId: string) {
    return prisma.finish.findFirst({ where: { id: finishId, is_active: true } });
  }

  async convertToOrderTransaction(quote: any, orderData: any, createdBy: string) {
    return prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          ...orderData,
          items: {
            create: quote.items
              .filter((item: any) => item.item_type === 'unit')
              .map((item: any) => ({
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                subtotal: item.subtotal
              }))
          }
        },
        include: {
          customer: true,
          items: { include: { product: true } }
        }
      });

      for (const item of quote.items) {
        if (item.item_type === 'unit' && item.product.inventory) {
          await tx.inventory.update({
            where: { id: item.product.inventory.id },
            data: { quantity: { decrement: item.quantity } }
          });

          await tx.inventoryMovement.create({
            data: {
              inventory_id: item.product.inventory.id,
              type: 'OUT',
              quantity: -item.quantity,
              reason: 'Venta',
              reference_id: newOrder.id,
              notes: `Venta - Orden ${orderData.order_number} (Convertida de cotización ${quote.quote_number})`,
              performed_by: createdBy
            }
          });
        }
      }

      await tx.quote.update({
        where: { id: quote.id },
        data: {
          status: 'converted',
          converted_order_id: newOrder.id
        }
      });

      return newOrder;
    });
  }

  async getLastOrderNumber(year: number) {
    return prisma.order.findFirst({
      where: { order_number: { startsWith: `ORD-${year}` } },
      orderBy: { order_number: 'desc' }
    });
  }
}

export const quoteRepository = new QuoteRepository();
