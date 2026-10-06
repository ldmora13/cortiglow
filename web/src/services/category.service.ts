import { apiFetch } from '../lib/api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  image_url: string | null;
  is_active: boolean;
  order_index: number;
}

export const CategoryService = {
  getCategories: async (): Promise<Category[]> => {
    return (await apiFetch('/categories')) || [];
  },
};
