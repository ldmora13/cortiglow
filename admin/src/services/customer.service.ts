import { api } from '../lib/api';
import type { Customer } from '../types/customer.types';

export const CustomerService = {
  getCustomers: async (filters?: { search?: string; limit?: number; sort?: 'sales' }): Promise<Customer[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.set('search', filters.search);
    if (filters?.limit) params.set('limit', String(filters.limit));
    if (filters?.sort) params.set('sort', filters.sort);
    const { data } = await api.get(`/customers?${params.toString()}`);
    return data;
  },

  getCustomer: async (id: string): Promise<Customer> => {
    const { data } = await api.get(`/customers/${id}`);
    return data;
  },

  createCustomer: async (customerData: Partial<Customer>): Promise<Customer> => {
    const { data } = await api.post('/customers', customerData);
    return data;
  },

  updateCustomer: async (id: string, customerData: Partial<Customer>): Promise<Customer> => {
    const { data } = await api.put(`/customers/${id}`, customerData);
    return data;
  },

  deleteCustomer: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
  }
};
