import { api } from '../lib/api';
import type { Product, Category, Finish } from '../types/product.types';

export const ProductService = {
  getProducts: async (): Promise<Product[]> => {
    const { data } = await api.get('/products');
    return data;
  },

  getProduct: async (id: string): Promise<Product> => {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  createProduct: async (productData: any): Promise<Product> => {
    const { data } = await api.post('/products', productData);
    return data;
  },

  updateProduct: async (id: string, productData: any): Promise<Product> => {
    const { data } = await api.put(`/products/${id}`, productData);
    return data;
  },

  setProductActive: async (id: string, isActive: boolean): Promise<Product> => {
    const { data } = await api.patch(`/products/${id}/status`, { is_active: isActive });
    return data;
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    const { data } = await api.get('/categories');
    return data;
  },

  // Finishes
  getFinishes: async (): Promise<Finish[]> => {
    const { data } = await api.get('/finishes');
    return data;
  }
};
