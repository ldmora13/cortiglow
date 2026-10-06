import { api } from '../lib/api';
import type { Order, OrderStatus } from '../types/order.types';

export const OrderService = {
  getOrders: async (filters?: any): Promise<Order[]> => {
    const params = new URLSearchParams(filters).toString();
    const { data } = await api.get(`/orders?${params}`);
    return data;
  },

  getOrder: async (id: string): Promise<Order> => {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  },

  createOrder: async (orderData: Partial<Order>): Promise<Order> => {
    const { data } = await api.post('/orders', orderData);
    return data;
  },

  updateOrderStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    const { data } = await api.put(`/orders/${id}/status`, { status });
    return data;
  },

  cancelOrder: async (id: string): Promise<Order> => {
    const { data } = await api.post(`/orders/${id}/cancel`);
    return data;
  }
};
