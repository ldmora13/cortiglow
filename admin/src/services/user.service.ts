import { api } from '../lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  is_active: boolean;
  created_at?: string;
  password?: string;
}

export const UserService = {
  getUsers: async (): Promise<User[]> => {
    const { data } = await api.get('/users');
    return data;
  },

  createUser: async (userData: Partial<User>): Promise<User> => {
    const { data } = await api.post('/users', userData);
    return data;
  },

  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    const { data } = await api.put(`/users/${id}`, userData);
    return data;
  },

  updateUserPassword: async (id: string, password: string): Promise<void> => {
    await api.patch(`/users/${id}/password`, { password });
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  }
};
