import { apiFetch } from '../lib/api';

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  price: number;
  stock: number;
  min_stock: number;
  category_id: string | null;
  images: string[];
  video_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  features: string | null;
  specifications: string | null;
  warranty_days: number;
  created_at?: string;
  updated_at?: string;
  category?: { name: string; slug: string; parent_id: string | null };
}

export const ProductService = {
  getProducts: async (): Promise<Product[]> => {
    return (await apiFetch('/products')) || [];
  },

  getProductById: async (id: string): Promise<Product | null> => {
    const products = await ProductService.getProducts();
    return products.find((p) => p.id === id) || null;
  },
};
