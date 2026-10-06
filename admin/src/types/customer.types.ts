export interface Customer {
  id: string;
  document_type: string;
  document_number: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  notes?: string;
  total_spent?: number; // Optional for dashboard/reports
  created_at?: string;
  updated_at?: string;
}
