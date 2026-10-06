import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class OrderRepository {
  async findAll(filters: any, limit: number = 50) {
    filters.is_active = true;
    return prisma.order.findMany({
      where: filters,
      include: {
        customer: {
          select: { id: true, name: true, phone: true, email: true }
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true }
            }
          }
        },
        payments: true
      },
      orderBy: { created_at: 'desc' },
      take: limit
    });
  }

  async findById(id: string) {
    return prisma.order.findFirst({
      where: { id, is_active: true },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              include: { category: true }
            }
          }
        },
        payments: true
      }
    });
  }

  async findByOrderNumber(orderNumber: string) {
    return prisma.order.findFirst({
      where: { order_number: orderNumber, is_active: true }
    });
  }

  async checkInventory(productIds: string[]) {
    return prisma.inventory.findMany({
      where: { product_id: { in: productIds } },
      include: { product: true }
    });
  }

  async getOrderWithInventory(id: string) {
    return prisma.order.findFirst({
      where: { id, is_active: true },
      include: {
        items: {
          include: {
            product: {
              include: { inventory: true }
            }
          }
        }
      }
    });
  }

  async createOrderTransaction(orderData: any, items: any[], paymentStatus: string, paymentMethod: string) {
    return prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({ data: orderData });

      // Process items and inventory
      const createdItems = [];
      for (const item of items) {
        const orderItem = await tx.orderItem.create({
          data: {
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: Number(item.unit_price),
            subtotal: item.quantity * Number(item.unit_price)
          }
        });
        createdItems.push(orderItem);

        const inventory = await tx.inventory.findUnique({
          where: { product_id: item.product_id }
        });

        if (!inventory) {
          throw new Error(`Inventario no encontrado para producto ${item.product_id}`);
        }

        await tx.inventory.update({
          where: { id: inventory.id },
          data: { quantity: inventory.quantity - item.quantity }
        });

        await tx.inventoryMovement.create({
          data: {
            inventory_id: inventory.id,
            type: 'OUT',
            quantity: -item.quantity,
            reason: 'Venta',
            reference_id: order.id,
            notes: `Orden ${order.order_number}`,
            performed_by: orderData.created_by
          }
        });
      }

      if (paymentStatus === 'paid') {
        await tx.payment.create({
          data: {
            order_id: order.id,
            amount: orderData.total,
            method: paymentMethod,
            status: 'completed',
            created_by: orderData.created_by
          }
        });
      }

      return { order, items: createdItems };
    });
  }

  async update(id: string, data: any) {
    return prisma.order.update({
      where: { id },
      data,
      include: {
        customer: true,
        items: { include: { product: true } },
        payments: true
      }
    });
  }

  async cancelOrderTransaction(order: any, newStatus: string, createdBy: string) {
    return prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        if (item.product.inventory) {
          await tx.inventory.update({
            where: { id: item.product.inventory.id },
            data: {
              quantity: item.product.inventory.quantity + item.quantity
            }
          });

          await tx.inventoryMovement.create({
            data: {
              inventory_id: item.product.inventory.id,
              type: 'IN',
              quantity: item.quantity,
              reason: 'Cancelación de orden',
              reference_id: order.id,
              notes: `Orden ${order.order_number} cancelada`,
              performed_by: createdBy
            }
          });
        }
      }

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date() : null
        }
      });
    });
  }

  async updateStatus(id: string, status: string) {
    return prisma.order.update({
      where: { id },
      data: {
        status,
        completed_at: status === 'completed' ? new Date() : null
      }
    });
  }

  async deleteOrderTransaction(order: any) {
    return prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        if (item.product.inventory) {
          await tx.inventory.update({
            where: { id: item.product.inventory.id },
            data: { quantity: item.product.inventory.quantity + item.quantity }
          });

          await tx.inventoryMovement.create({
            data: {
              inventory_id: item.product.inventory.id,
              type: 'IN',
              quantity: item.quantity,
              reason: 'Eliminación de orden',
              reference_id: order.id,
              notes: `Orden ${order.order_number} eliminada`
            }
          });
        }
      }

      await tx.order.update({ 
        where: { id: order.id },
        data: { is_active: false }
      });
    });
  }

  async delete(id: string) {
    return prisma.order.update({ 
      where: { id },
      data: { is_active: false }
    });
  }

  async createPayment(orderId: string, data: any) {
    return prisma.payment.create({
      data: {
        order_id: orderId,
        amount: Number(data.amount),
        method: data.method,
        reference: data.reference,
        notes: data.notes,
        created_by: data.created_by,
        status: 'completed'
      }
    });
  }
}

export const orderRepository = new OrderRepository();
