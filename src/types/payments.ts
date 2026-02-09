export enum PaymentMethod {
  Cash = "cash",
  Paystack = "paystack",
  Flutterwave = "flutterwave",
  Paypal = "paypal",
  Stripe = "stripe",
}

export interface PaystackConfig {
  public_key: string;
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
