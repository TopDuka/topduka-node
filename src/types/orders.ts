export interface OrderItem {
  id: string;
  product_id: string;
  product_name?: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  sku?: string;
}

export interface Order {
  id: string;
  order_number?: string;
  status: string;
  payment_status?: string;
  payment_method?: string;
  subtotal: number;
  discount_amount?: number;
  tax_amount?: number;
  total: number;
  currency?: string;
  full_name?: string;
  email?: string;
  phone_number?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country?: string;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}
