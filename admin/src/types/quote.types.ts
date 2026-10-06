import type { Customer } from './customer.types';
import type { Product, Finish } from './product.types';

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted' | 'expired';

export interface QuoteItem {
  id?: string;
  quote_id?: string;
  product_id: string;
  product?: Product;
  item_type: 'unit' | 'custom_measure';
  quantity: number;
  width_meters?: number;
  height_meters?: number;
  square_meters?: number;
  fabric_type?: 'blackout' | 'screen' | 'traslucida';
  finish_id?: string;
  finish?: Finish;
  unit_price: number;
  finish_price: number;
  subtotal: number;
}

export interface Quote {
  id: string;
  quote_number: string;
  customer_id: string;
  customer?: Customer;
  status: QuoteStatus;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string;
  valid_until: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  converted_order_id?: string;
  converted_order?: any;
  customer_name?: string;
  number?: string;
  items?: QuoteItem[];
}

export interface CustomMeasureCalculation {
  unit_price: number;
  square_meters: number;
  finish_price: number;
  subtotal: number;
}
