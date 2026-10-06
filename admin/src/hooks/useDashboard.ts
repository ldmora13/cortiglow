import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '../services/dashboard.service';
import type { DashboardStats } from '../services/dashboard.service';

export const useDashboard = () => {
  const { data, isLoading, isError, refetch } = useQuery<DashboardStats>({
    queryKey: ['dashboard'],
    queryFn: DashboardService.getStats,
  });

  return {
    stats: data || {
      sales_today: { total: 0, count: 0 },
      sales_this_month: { total: 0, count: 0 },
      pending_orders: 0,
      low_stock_products: 0,
      total_customers: 0,
      total_products: 0
    } as DashboardStats,
    isLoading,
    isError,
    refetch
  };
};
