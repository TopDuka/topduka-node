import { PaymentMethod } from "./payments";
import type {
  CheckoutCustomerInfo,
  CheckoutSession,
  CheckoutShippingInfo,
  CompleteCashSessionResponse,
  InitializePaystackCheckoutParams,
  InitializePaystackCheckoutResponse,
  StartMpesaPaymentParams,
  StartMpesaPaymentResponse,
  VerifyPaystackCheckoutResponse,
} from "./checkout";

export type BookingId = string | number;

export interface BookingEvent {
  id: BookingId;
  store_id?: BookingId;
  title: string;
  slug: string;
  description?: string | null;
  short_description?: string | null;
  status: string;
  location_id?: string | null;
  location_name?: string | null;
  images?: string[];
  starts_at?: string | null;
  ends_at?: string | null;
  min_price?: number;
  next_slot_at?: string | null;
  ticket_types_count?: number;
  slots_count?: number;
  booked_users_count?: number;
  capacity_total?: number;
  sold_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TicketType {
  id: BookingId;
  bookable_id: BookingId;
  product_id: BookingId;
  name: string;
  description?: string | null;
  price: number;
  sales_price?: number | null;
  sort_order: number;
  is_active: boolean;
}

export interface BookingSlot {
  id: BookingId;
  bookable_id: BookingId;
  starts_at: string;
  ends_at: string;
  capacity: number;
  sold_count: number;
  remaining: number;
  is_active: boolean;
}

export interface BookingEventDetails extends BookingEvent {
  ticket_types: TicketType[];
}

export interface Ticket {
  id: BookingId;
  token: string;
  status: string;
  checked_in_at?: string | null;
  event_title: string;
  slot_starts_at: string;
  slot_ends_at: string;
  ticket_type_name: string;
  order_id?: BookingId | null;
  order_number?: BookingId | null;
  customer_name?: string | null;
  customer_email?: string | null;
}

export interface BookingEventListParams {
  skip?: number;
}

export interface BookingTicketCartParams {
  event_id_or_slug?: string;
  ticket_type_id: BookingId;
  booking_slot_id: BookingId;
  product_id?: BookingId;
  quantity?: number;
}

export interface CreateBookingCheckoutSessionParams extends BookingTicketCartParams {
  payment_method: PaymentMethod.Cash | PaymentMethod.Mpesa | PaymentMethod.Paystack;
  customer: CheckoutCustomerInfo;
  shipping: CheckoutShippingInfo;
}

export interface BookingCheckoutSessionResponse {
  cart_session_id: BookingId;
  checkout_session: CheckoutSession;
}

export interface BookingCheckoutInitOptions extends BookingTicketCartParams {
  onSuccess?: (result: { checkout_session: CheckoutSession; order?: unknown }) => void;
  onClose?: () => void;
}

export interface BookingCheckoutApi {
  createSession(params: CreateBookingCheckoutSessionParams): Promise<BookingCheckoutSessionResponse>;
  getSession(id: string): Promise<CheckoutSession>;
  startMpesaPayment(params: StartMpesaPaymentParams): Promise<StartMpesaPaymentResponse>;
  initializePaystackPayment(params: InitializePaystackCheckoutParams): Promise<InitializePaystackCheckoutResponse>;
  verifyPaystackPayment(checkoutSessionId: string): Promise<VerifyPaystackCheckoutResponse>;
  completeCashSession(id: string): Promise<CompleteCashSessionResponse>;
  init(options: BookingCheckoutInitOptions): Promise<void>;
}
