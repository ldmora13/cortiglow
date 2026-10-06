import prisma from '../prisma';

export class DashboardRepository {
  async getSalesAggregates(startDate: Date) {
    return prisma.order.aggregate({
      where: {
        status: 'completed',
        created_at: { gte: startDate }
      },
      _sum: { total: true },
      _count: true
    });
  }

  async getPendingOrdersCount() {
    return prisma.order.count({
      where: {
        status: { in: ['pending', 'confirmed', 'in_progress'] }
      }
    });
  }

  async getInventoryList() {
    return prisma.inventory.findMany({
      where: { product: { is_active: true } },
      select: { quantity: true, min_stock: true }
    });
  }

  async getCustomerCount() {
    return prisma.customer.count({ where: { is_active: true } });
  }

  async getProductCount() {
    return prisma.product.count({ where: { is_active: true } });
  }

  async getCompletedOrders(filters: any, selectOptions: any) {
    return prisma.order.findMany({
      where: { ...filters, status: 'completed' },
      select: selectOptions,
      orderBy: { created_at: 'asc' }
    });
  }

  async getOrderItemsForTopProducts(where: any) {
    return prisma.orderItem.findMany({
      where,
      include: {
        product: {
          select: { id: true, name: true, images: true, price: true }
        }
      }
    });
  }

  async getInventoryWithProducts() {
    return prisma.inventory.findMany({
      where: { product: { is_active: true } },
      include: {
        product: {
          select: {
            id: true, name: true, images: true, price: true,
            category: { select: { name: true } }
          }
        }
      },
      orderBy: { quantity: 'asc' }
    });
  }

  async getOrdersByStatusCounts(where: any, statuses: string[]) {
    return Promise.all(
      statuses.map(async (status) => {
        const count = await prisma.order.count({ where: { ...where, status } });
        const total = await prisma.order.aggregate({
          where: { ...where, status },
          _sum: { total: true }
        });
        return { status, count, total: Number(total._sum.total || 0) };
      })
    );
  }

  async getRecentOrders(limit: number) {
    return prisma.order.findMany({
      take: limit,
      orderBy: { created_at: 'desc' },
      include: { customer: { select: { name: true } } }
    });
  }

  async getRecentMovements(limit: number) {
    return prisma.inventoryMovement.findMany({
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        inventory: {
          include: { product: { select: { name: true } } }
        }
      }
    });
  }

  async exportSales(where: any) {
    return prisma.order.findMany({
      where: { ...where, status: 'completed' },
      include: {
        customer: true,
        items: { include: { product: true } }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async exportInventory() {
    return prisma.inventory.findMany({
      where: { product: { is_active: true } },
      include: {
        product: { include: { category: true } }
      }
    });
  }

  async exportCustomers() {
    return prisma.customer.findMany({
      where: { is_active: true },
      include: {
        orders: {
          where: { status: 'completed' },
          select: { total: true }
        }
      }
    });
  }
}

export const dashboardRepository = new DashboardRepository();
