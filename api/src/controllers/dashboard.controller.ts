import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';

export class DashboardController {
  private parseDateFilters(req: Request) {
    const { date_from, date_to } = req.query;
    const filters: any = {};
    if (date_from || date_to) {
      filters.created_at = {};
      if (date_from) filters.created_at.gte = new Date(date_from as string);
      if (date_to) filters.created_at.lte = new Date(date_to as string);
    }
    return filters;
  }

  async getSummary(req: Request, res: Response) {
    try {
      const summary = await dashboardService.getSummary();
      res.json(summary);
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      res.status(500).json({ error: 'Error al obtener resumen' });
    }
  }

  async getSales(req: Request, res: Response) {
    try {
      const filters = new DashboardController().parseDateFilters(req);
      if (!req.query.date_from && !req.query.date_to) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filters.created_at = { gte: thirtyDaysAgo };
      }

      const sales = await dashboardService.getSalesByPeriod(filters);
      res.json(sales);
    } catch (error) {
      console.error('Error fetching sales:', error);
      res.status(500).json({ error: 'Error al obtener ventas' });
    }
  }

  async getTopProducts(req: Request, res: Response) {
    try {
      const limit = parseInt((req.query.limit as string) || '10');
      const filters = new DashboardController().parseDateFilters(req);
      const products = await dashboardService.getTopProducts(filters, limit);
      res.json(products);
    } catch (error) {
      console.error('Error fetching top products:', error);
      res.status(500).json({ error: 'Error al obtener productos más vendidos' });
    }
  }

  async getLowStock(req: Request, res: Response) {
    try {
      const lowStock = await dashboardService.getLowStockProducts();
      res.json(lowStock);
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      res.status(500).json({ error: 'Error al obtener productos con stock bajo' });
    }
  }

  async getSalesByPayment(req: Request, res: Response) {
    try {
      const filters = new DashboardController().parseDateFilters(req);
      const sales = await dashboardService.getSalesByPaymentMethod(filters);
      res.json(sales);
    } catch (error) {
      console.error('Error fetching sales by payment:', error);
      res.status(500).json({ error: 'Error al obtener ventas por método de pago' });
    }
  }

  async getOrdersByStatus(req: Request, res: Response) {
    try {
      const filters = new DashboardController().parseDateFilters(req);
      const orders = await dashboardService.getOrdersByStatus(filters);
      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders by status:', error);
      res.status(500).json({ error: 'Error al obtener órdenes por estado' });
    }
  }

  async getRecentActivity(req: Request, res: Response) {
    try {
      const limit = parseInt((req.query.limit as string) || '10');
      const activity = await dashboardService.getRecentActivity(limit);
      res.json(activity);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      res.status(500).json({ error: 'Error al obtener actividad reciente' });
    }
  }

  async exportData(req: Request, res: Response) {
    try {
      const type = (req.query.type as string) || 'sales';
      const filters = new DashboardController().parseDateFilters(req);
      const data = await dashboardService.exportData(type, filters);
      res.json(data);
    } catch (error: any) {
      if (error.message === 'Tipo de exportación inválido') {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Error exporting data:', error);
        res.status(500).json({ error: 'Error al exportar datos' });
      }
    }
  }
}

export const dashboardController = new DashboardController();
