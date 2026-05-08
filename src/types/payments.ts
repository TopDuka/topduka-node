export enum PaymentMethod {
  Cash = "cash",
  Mpesa = "mpesa",
  Paystack = "paystack",
  Pesapal = "pesapal",
  Flutterwave = "flutterwave",
  Paypal = "paypal",
  Stripe = "stripe",
}

export interface PaystackConfig {
  public_key: string;
}

export interface PesapalConfig {
  consumer_key: string;
}

export interface PesapalOrderParams {
  id: string;
  currency: string;
  amount: number;
  description: string;
  callback_url: string;
  email: string;
  phone_number?: string;
  first_name?: string;
  last_name?: string;
}

export interface PesapalOrderResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
  status: string;
}

export interface PesapalTransactionStatus {
  payment_method: string;
  amount: number;
  created_date: string;
  confirmation_code: string;
  payment_status_description: string;
  status_code: number;
  merchant_reference: string;
  order_tracking_id: string;
  currency: string;
}

export interface PesapalVerifyParams {
  order_tracking_id: string;
}

export interface PaystackInlineOptions {
  email: string;
  amount: number;
  currency?: string;
  reference?: string;
  onSuccess: (response: { reference: string }) => void;
  onClose?: () => void;
}

export interface InitializePaymentParams {
  email: string;
  amount: number;
  reference?: string;
  callback_url?: string;
}

export interface InitializePaymentResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface VerifyPaymentParams {
  reference: string;
}

export interface VerifyPaymentResponse {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  channel: string;
  paid_at: string;
}
