import { api } from '../lib/api';

export interface Finish {
  id: string;
  name: string;
  description?: string;
  price: number;
  price_type: 'FIXED' | 'PER_METER' | 'PERCENTAGE';
  is_active: boolean;
}

export const FinishService = {
  getFinishes: async (): Promise<Finish[]> => {
    const { data } = await api.get('/finishes');
    return data;
  },

  createFinish: async (finishData: Partial<Finish>): Promise<Finish> => {
    const { data } = await api.post('/finishes', finishData);
    return data;
  },

  updateFinish: async (id: string, finishData: Partial<Finish>): Promise<Finish> => {
    const { data } = await api.put(`/finishes/${id}`, finishData);
    return data;
  },

  deleteFinish: async (id: string): Promise<void> => {
    await api.delete(`/finishes/${id}`);
  }
};
