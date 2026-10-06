import { api } from '../lib/api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  is_active?: boolean;
  order_index?: number;
  parent_id?: string | null;
  children?: Category[];
  product_count?: number;
}

export const CategoryService = {
  getCategories: async (): Promise<Category[]> => {
    const { data } = await api.get('/categories');
    return data;
  },

  getCategory: async (id: string): Promise<Category> => {
    const { data } = await api.get(`/categories/${id}`);
    return data;
  },

  createCategory: async (categoryData: Partial<Category>): Promise<Category> => {
    const { data } = await api.post('/categories', categoryData);
    return data;
  },

  updateCategory: async (id: string, categoryData: Partial<Category>): Promise<Category> => {
    const { data } = await api.put(`/categories/${id}`, categoryData);
    return data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },

  updateCategoryOrder: async (categories: { id: string; order_index: number }[]): Promise<void> => {
    await api.put('/categories/reorder', { categories });
  }
};
