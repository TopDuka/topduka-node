import { PaymentMethod } from "./payments";

export interface CartItem {
  id: string;
  product_id: string;
  product_name?: string;
  product_image?: string;
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
