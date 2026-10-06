export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active?: boolean;
  order_index?: number;
  parent_id?: string | null;
  children?: Category[];
  product_count?: number;
}

export interface Provider {
  id: string;
  name: string;
  nit?: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  delivery_time?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
}

export interface Inventory {
  id: string;
  quantity: number;
  min_stock: number;
  location?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  category_id?: string;
  category?: Category;
  provider_id?: string;
  provider?: Provider;
  images: string[];
  is_active: boolean;
  inventory?: Inventory;
  created_at: string;
  updated_at: string;
}

export interface Finish {
  id: string;
  name: string;
  description?: string;
  price: number;
  price_type: 'FIXED' | 'PER_METER' | 'PERCENTAGE';
  is_active: boolean;
}
