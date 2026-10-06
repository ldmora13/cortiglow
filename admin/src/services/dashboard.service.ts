import { api } from '../lib/api';

export interface DashboardStats {
  sales_today: { total: number; count: number };
  sales_this_month: { total: number; count: number };
  pending_orders: number;
  low_stock_products: number;
  total_customers: number;
  total_products: number;
}

export const DashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get('/dashboard/summary');
    return data;
  }
};
