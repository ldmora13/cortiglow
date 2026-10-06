import { dashboardRepository } from '../repositories/dashboard.repository';

export class DashboardService {
  async getSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [salesToday, salesThisMonth, pendingOrders, inventory, totalCustomers, totalProducts] = await Promise.all([
      dashboardRepository.getSalesAggregates(today),
      dashboardRepository.getSalesAggregates(firstDayOfMonth),
      dashboardRepository.getPendingOrdersCount(),
      dashboardRepository.getInventoryList(),
      dashboardRepository.getCustomerCount(),
      dashboardRepository.getProductCount()
    ]);

    const lowStockProducts = inventory.filter(inv => inv.quantity <= inv.min_stock).length;

    return {
      sales_today: {
        total: Number(salesToday._sum.total || 0),
        count: salesToday._count
      },
      sales_this_month: {
        total: Number(salesThisMonth._sum.total || 0),
        count: salesThisMonth._count
      },
      pending_orders: pendingOrders,
      low_stock_products: lowStockProducts,
      total_customers: totalCustomers,
      total_products: totalProducts
    };
  }

  async getSalesByPeriod(filters: any) {
    const orders = await dashboardRepository.getCompletedOrders(filters, { total: true, created_at: true });

    const salesByDay: Record<string, { date: string; total: number; count: number }> = {};
    orders.forEach((order: any) => {
      const date = order.created_at.toISOString().split('T')[0];
      if (!salesByDay[date]) {
        salesByDay[date] = { date, total: 0, count: 0 };
      }
      salesByDay[date].total += Number(order.total);
      salesByDay[date].count += 1;
    });

    return Object.values(salesByDay).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getTopProducts(filters: any, limit: number) {
    const orderItems = await dashboardRepository.getOrderItemsForTopProducts({ order: { ...filters, status: 'completed' } });

    const productSales: Record<string, any> = {};
    orderItems.forEach((item: any) => {
      if (!productSales[item.product_id]) {
        productSales[item.product_id] = {
          product_id: item.product_id,
          product_name: item.product.name,
          product_image: item.product.images[0] || null,
          total_quantity: 0,
          total_revenue: 0
        };
      }
      productSales[item.product_id].total_quantity += item.quantity;
      productSales[item.product_id].total_revenue += Number(item.subtotal);
    });

    return Object.values(productSales)
      .sort((a: any, b: any) => b.total_quantity - a.total_quantity)
      .slice(0, limit);
  }

  async getLowStockProducts() {
    const inventory = await dashboardRepository.getInventoryWithProducts();
    
    return inventory
      .filter((inv: any) => inv.quantity <= inv.min_stock)
      .map((inv: any) => ({
        ...inv,
        alert_level: inv.quantity === 0 ? 'critical' : 'warning',
        stock_percentage: inv.min_stock > 0 ? Math.round((inv.quantity / inv.min_stock) * 100) : 0
      }));
  }

  async getSalesByPaymentMethod(filters: any) {
    const orders = await dashboardRepository.getCompletedOrders(filters, { payment_method: true, total: true });

    const paymentStats: Record<string, { method: string; total: number; count: number }> = {};
    orders.forEach((order: any) => {
      const method = order.payment_method;
      if (!paymentStats[method]) paymentStats[method] = { method, total: 0, count: 0 };
      paymentStats[method].total += Number(order.total);
      paymentStats[method].count += 1;
    });

    return Object.values(paymentStats).sort((a: any, b: any) => b.total - a.total);
  }

  async getOrdersByStatus(filters: any) {
    const statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    return await dashboardRepository.getOrdersByStatusCounts(filters, statuses);
  }

  async getRecentActivity(limit: number) {
    const [recentOrders, recentMovements] = await Promise.all([
      dashboardRepository.getRecentOrders(limit),
      dashboardRepository.getRecentMovements(limit)
    ]);

    return {
      recent_orders: recentOrders,
      recent_movements: recentMovements
    };
  }

  async exportData(type: string, filters: any) {
    if (type === 'sales') {
      return await dashboardRepository.exportSales(filters);
    } else if (type === 'inventory') {
      return await dashboardRepository.exportInventory();
    } else if (type === 'customers') {
      const customers = await dashboardRepository.exportCustomers();
      return customers.map((c: any) => ({
        ...c,
        total_spent: c.orders.reduce((sum: number, o: any) => sum + Number(o.total), 0)
      }));
    } else {
      throw new Error('Tipo de exportación inválido');
    }
  }
}

export const dashboardService = new DashboardService();
