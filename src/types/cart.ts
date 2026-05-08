import { PaymentMethod } from "./payments";

export interface CartItem {
  id: string;
  product_id: string;
  product_name?: string;
  product_image?: string;
  product_kind?: string;
  booking_slot_id?: string | null;
  ticket_type_id?: string | null;
  bookable_id?: string | null;
  bookable_title?: string | null;
  slot_starts_at?: string | null;
  slot_ends_at?: string | null;
  ticket_type_name?: string | null;
  price?: number;
  sales_price?: number;
  quantity: number;
  sku?: string;
}

export interface Cart {
  id: string;
  session_id: string;
  items: CartItem[];
  total?: number;
  item_count?: number;
}

export interface CartCreateParams {
  cart_id?: string;
  customer_id?: string;
}

export interface CartAddProductParams {
  product_id: string;
  quantity: number;
  booking_slot_id?: string | null;
  ticket_type_id?: string | null;
}

export interface CartCompleteParams {
  payment_method: PaymentMethod;
  full_name: string;
  email: string;
  phone_number: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
}
