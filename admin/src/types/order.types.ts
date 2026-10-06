import type { Customer } from './customer.types';
import type { Product } from './product.types';

export type OrderStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product?: Product;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer?: Customer;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  tax: number;
  delivery_cost: number;
  total: number;
  payment_method: string;
  payment_status: string;
  delivery_method?: string;
  delivery_address?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  items?: OrderItem[];
}

export interface CartItem {
  product_id: string;
  name: string;
  unit_price: number;
  quantity: number;
  max_stock: number;
  image?: string;
}
