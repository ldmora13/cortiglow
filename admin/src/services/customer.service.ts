import { api } from '../lib/api';
import type { Customer } from '../types/customer.types';

export const CustomerService = {
  getCustomers: async (): Promise<Customer[]> => {
    const { data } = await api.get('/customers');
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
