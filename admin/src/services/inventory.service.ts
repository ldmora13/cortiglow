import { api } from '../lib/api';

export const InventoryService = {
  getInventory: async (): Promise<any[]> => {
    const { data } = await api.get('/inventory');
    return data;
  },

  updateInventory: async (id: string, updateData: any): Promise<any> => {
    const { data } = await api.put(`/inventory/${id}`, updateData);
    return data;
  },

  getMovements: async (filters?: any): Promise<any[]> => {
    const params = new URLSearchParams(filters).toString();
    const { data } = await api.get(`/inventory-movements?${params}`);
    return data;
  },

  addMovement: async (movementData: any): Promise<any> => {
    const { data } = await api.post('/inventory-movements', movementData);
    return data;
  }
};
