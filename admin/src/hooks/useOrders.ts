import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderService } from '../services/order.service';
import type { Order, OrderStatus } from '../types/order.types';

export const useOrders = (filters?: any) => {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery<Order[]>({
    queryKey: ['orders', filters],
    queryFn: () => OrderService.getOrders(filters),
  });

  const getOrderQuery = (id: string) => useQuery<Order>({
    queryKey: ['orders', id],
    queryFn: () => OrderService.getOrder(id),
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: OrderService.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      // Invalidate inventory since order creation reduces stock
      queryClient.invalidateQueries({ queryKey: ['inventory'] }); 
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => OrderService.updateOrderStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: OrderService.cancelOrder,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', id] });
      // Cancelling order restocks inventory
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    orders: ordersQuery.data || [],
    isLoadingOrders: ordersQuery.isLoading,
    isErrorOrders: ordersQuery.isError,
    refetchOrders: ordersQuery.refetch,
    
    getOrderQuery,
    createOrder: createMutation.mutateAsync,
    updateOrderStatus: updateStatusMutation.mutateAsync,
    cancelOrder: cancelMutation.mutateAsync,
    
    isCreating: createMutation.isPending,
    isUpdating: updateStatusMutation.isPending,
  };
};
