import { PaymentMethod } from "./payments";

export interface CheckoutCustomerInfo {
  full_name: string;
  email: string;
  phone_number: string;
}

export interface CheckoutShippingInfo {
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province: string;
  postal_code?: string;
  country: string;
}

export interface CreateCheckoutSessionParams {
  session_id?: string;
  payment_method: PaymentMethod.Cash | PaymentMethod.Mpesa | PaymentMethod.Paystack;
  customer: CheckoutCustomerInfo;
  shipping: CheckoutShippingInfo;
}

export interface CheckoutSession {
  id: string;
  cart_session_id: string | number;
  payment_method: string;
  status: string;
  amount: number;
  currency_code: string;
  phone_number?: string | null;
  provider_reference?: string | null;
  checkout_request_id?: string | null;
  order_id?: string | number | null;
  error_message?: string | null;
  expires_at: string;
  completed_at?: string | null;
}

export interface StartMpesaPaymentParams {
  checkout_session_id: string;
  phone_number: string;
  callback_base_url?: string;
}

export interface StartMpesaPaymentResponse extends CheckoutSession {
  customer_message?: string;
}

export interface CompleteCashSessionResponse {
  checkout_session: CheckoutSession;
  order?: unknown;
}

export interface InitializePaystackCheckoutParams {
  checkout_session_id: string;
  callback_url?: string;
}

export interface InitializePaystackCheckoutResponse extends CheckoutSession {
  authorization_url: string;
  access_code: string;
  reference: string;
  public_key: string;
}

export interface VerifyPaystackCheckoutResponse {
  checkout_session: CheckoutSession;
  order?: unknown;
  verification?: unknown;
}

export interface CheckoutInitOptions {
  cart_session_id?: string;
  onSuccess?: (result: { checkout_session: CheckoutSession; order?: unknown }) => void;
  onClose?: () => void;
}
