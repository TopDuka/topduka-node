import axios, { AxiosInstance } from "axios";
import {
  Product, Category, ProductGetParams, CategoryGetParams, DiscountedProductsParams,
  Banner, BannerGetParams,
  Cart, CartCreateParams, CartCompleteParams,
  StoreConfig, StoreInfo,
  Order,
  PaystackConfig, PaystackInlineOptions, InitializePaymentParams, InitializePaymentResponse,
  VerifyPaymentParams, VerifyPaymentResponse,
  Tag, TagGetParams,
  PesapalConfig, PesapalOrderParams, PesapalOrderResponse, PesapalTransactionStatus, PesapalVerifyParams,
  BookingCheckoutApi, BookingCheckoutInitOptions, BookingCheckoutSessionResponse, BookingEvent, BookingEventDetails, BookingEventListParams, BookingSlot, BookingTicketCartParams, CreateBookingCheckoutSessionParams, Ticket,
  CreateCheckoutSessionParams, CheckoutSession, StartMpesaPaymentParams, StartMpesaPaymentResponse, CompleteCashSessionResponse,
  InitializePaystackCheckoutParams, InitializePaystackCheckoutResponse, VerifyPaystackCheckoutResponse,
  CheckoutInitOptions,
} from "./types";

export interface TopDukaClientOptions {
  baseURL?: string;
  apiKey: string;
}

export interface TopDukaClient {
  products: {
    list(params?: ProductGetParams): Promise<Product[]>;
    popular(skip?: number): Promise<Product[]>;
    discounted(params?: DiscountedProductsParams): Promise<Product[]>;
    bestSelling(skip?: number): Promise<Product[]>;
  };
  categories: {
    list(params?: CategoryGetParams): Promise<Category[]>;
    getProducts(categoryId: string): Promise<Product[]>;
  };
  tags: {
    list(params?: TagGetParams): Promise<Tag[]>;
    getProducts(tagId: string): Promise<Product[]>;
  };
  banners: {
    list(params?: BannerGetParams): Promise<Banner[]>;
  };
  bookings: {
    listEvents(params?: number | BookingEventListParams): Promise<BookingEvent[]>;
    getEvent(idOrSlug: string): Promise<BookingEventDetails>;
    getSlots(idOrSlug: string): Promise<BookingSlot[]>;
    getTicket(token: string): Promise<Ticket>;
    addTicketToCart(params: BookingTicketCartParams): Promise<unknown>;
  };
  bookingCheckout: BookingCheckoutApi;
  tickets: {
    get(token: string): Promise<Ticket>;
  };
  cart: {
    get(): Promise<Cart | null>;
    create(params?: CartCreateParams): Promise<{ session_id: string }>;
    updateProduct(params: { product_id: string; quantity: number; booking_slot_id?: string | null; ticket_type_id?: string | null }): Promise<unknown>;
    complete(params: Omit<CartCompleteParams, "session_id">): Promise<unknown>;
    delete(): Promise<void>;
    clear(): Promise<void>;
    getSessionId(): string | null;
  };
  checkout: {
    createSession(params: CreateCheckoutSessionParams): Promise<CheckoutSession>;
    getSession(id: string): Promise<CheckoutSession>;
    startMpesaPayment(params: StartMpesaPaymentParams): Promise<StartMpesaPaymentResponse>;
    initializePaystackPayment(params: InitializePaystackCheckoutParams): Promise<InitializePaystackCheckoutResponse>;
    verifyPaystackPayment(checkoutSessionId: string): Promise<VerifyPaystackCheckoutResponse>;
    completeCashSession(id: string): Promise<CompleteCashSessionResponse>;
    init(options?: CheckoutInitOptions): Promise<void>;
  };
  config: {
    get(): Promise<StoreConfig>;
  };
  store: {
    get(): Promise<StoreInfo>;
  };
  orders: {
    list(skip?: number): Promise<Order[]>;
    get(orderId: string): Promise<Order>;
    track(orderNumber: number): Promise<Order>;
  };
  payments: {
    getConfig(): Promise<PaystackConfig>;
    initialize(params: InitializePaymentParams): Promise<InitializePaymentResponse>;
    verify(params: VerifyPaymentParams): Promise<VerifyPaymentResponse>;
    payInline(options: PaystackInlineOptions): Promise<void>;
    getPesapalConfig(): Promise<PesapalConfig>;
    createPesapalOrder(params: PesapalOrderParams): Promise<PesapalOrderResponse>;
    verifyPesapalTransaction(params: PesapalVerifyParams): Promise<PesapalTransactionStatus>;
  };
}

let _paystackScriptLoaded = false;

function loadPaystackScript(): Promise<void> {
  if (_paystackScriptLoaded) return Promise.resolve();
  if (typeof document === "undefined") {
    return Promise.reject(new Error("payInline requires a browser environment"));
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
    if (existing) {
      _paystackScriptLoaded = true;
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => { _paystackScriptLoaded = true; resolve(); };
    script.onerror = () => reject(new Error("Failed to load Paystack inline script"));
    document.head.appendChild(script);
  });
}

const CART_SESSION_KEY = "topduka_cart_session";

function getStoredSession(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CART_SESSION_KEY);
}

function setStoredSession(sessionId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_SESSION_KEY, sessionId);
}

function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_SESSION_KEY);
}

function buildQuery(entries: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(entries)) {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function toId(value: string | number): string {
  return String(value);
}

export function createClient(options: TopDukaClientOptions): TopDukaClient {
  const raw = options.baseURL || "https://api.topduka.com";
  const normalized = raw.replace(/\/+$/, "");
  const baseURL =
    normalized.endsWith("/api/v1") || normalized.endsWith("/pb/v1")
      ? normalized.replace(/\/pb\/v1$/, "/api/v1")
      : `${normalized}/api/v1`;

  const http: AxiosInstance = axios.create({ baseURL });

  http.interceptors.request.use((config) => {
    config.headers["x-api-key"] = options.apiKey;
    return config;
  });

  const resolveBookingTicketProductId = async (params: BookingTicketCartParams): Promise<string> => {
    if (params.product_id !== undefined && params.product_id !== null) {
      return toId(params.product_id);
    }
    if (!params.event_id_or_slug) {
      throw new Error("product_id or event_id_or_slug is required for booking checkout");
    }

    const event = (await http.get<BookingEventDetails>(`bookings/events/${params.event_id_or_slug}`)).data;
    const ticketType = event.ticket_types.find((item) => toId(item.id) === toId(params.ticket_type_id));
    if (!ticketType) {
      throw new Error("ticket type not found for booking event");
    }
    return toId(ticketType.product_id);
  };

  const addBookingTicketToCartSession = async (
    sessionId: string | number,
    params: BookingTicketCartParams,
  ): Promise<unknown> => {
    const productId = await resolveBookingTicketProductId(params);
    return (await http.post("cart/update", {
      session_id: sessionId,
      product_id: productId,
      quantity: params.quantity ?? 1,
      booking_slot_id: params.booking_slot_id,
      ticket_type_id: params.ticket_type_id,
    })).data;
  };

  const createBookingCheckoutSession = async (
    params: CreateBookingCheckoutSessionParams,
  ): Promise<BookingCheckoutSessionResponse> => {
    const cart = (await http.post<{ session_id: string | number }>("cart", {})).data;
    await addBookingTicketToCartSession(cart.session_id, params);
    const checkoutSession = (await http.post<CheckoutSession>("checkout/sessions", {
      session_id: cart.session_id,
      payment_method: params.payment_method,
      customer: params.customer,
      shipping: params.shipping,
    })).data;

    return {
      cart_session_id: cart.session_id,
      checkout_session: checkoutSession,
    };
  };

  const client: TopDukaClient = {
    products: {
      async list(params?: ProductGetParams) {
        const qs = buildQuery({
          id: params?.id, sku: params?.sku, slug: params?.slug, search_term: params?.search_term,
          status: params?.status, barcode: params?.barcode, skip: params?.skip,
          category_id: params?.category_id, tag_id: params?.tag_id
        });
        return (await http.get<Product[]>(`products${qs}`)).data;
      },
      async popular(skip?: number) {
        return (await http.get<Product[]>(`products/popular${buildQuery({ skip })}`)).data;
      },
      async discounted(params?: DiscountedProductsParams) {
        return (await http.get<Product[]>(`products/discounted${buildQuery({ min_discount: params?.min_discount, max_discount: params?.max_discount, skip: params?.skip })}`)).data;
      },
      async bestSelling(skip?: number) {
        return (await http.get<Product[]>(`products/best-selling${buildQuery({ skip })}`)).data;
      },
    },

    categories: {
      async list(params?: CategoryGetParams) {
        return (await http.get<Category[]>(`categories${buildQuery({ slug: params?.slug, is_active: params?.is_active })}`)).data;
      },
      async getProducts(categoryId: string) {
        return (await http.get<Product[]>(`categories/${categoryId}/products`)).data;
      },
    },

    tags: {
      async list(params?: TagGetParams) {
        return (await http.get<Tag[]>(`tags${buildQuery({ search_term: params?.search_term })}`)).data;
      },
      async getProducts(tagId: string) {
        return (await http.get<Product[]>(`tags/${tagId}/products`)).data;
      },
    },

    banners: {
      async list(params?: BannerGetParams) {
        return (await http.get<Banner[]>(`banners${buildQuery({ status: params?.status, type: params?.type, skip: params?.skip })}`)).data;
      },
    },

    bookings: {
      async listEvents(params?: number | BookingEventListParams) {
        const skip = typeof params === "number" ? params : params?.skip;
        return (await http.get<BookingEvent[]>(`bookings/events${buildQuery({ skip })}`)).data;
      },
      async getEvent(idOrSlug: string) {
        return (await http.get<BookingEventDetails>(`bookings/events/${idOrSlug}`)).data;
      },
      async getSlots(idOrSlug: string) {
        return (await http.get<BookingSlot[]>(`bookings/events/${idOrSlug}/slots`)).data;
      },
      async getTicket(token: string) {
        return (await http.get<Ticket>(`tickets/${token}`)).data;
      },
      async addTicketToCart(params: BookingTicketCartParams) {
        let sid = getStoredSession();
        if (!sid) {
          const cart = (await http.post<{ session_id: string }>("cart", {})).data;
          sid = cart.session_id;
          setStoredSession(sid);
        }
        return addBookingTicketToCartSession(sid, params);
      },
    },

    bookingCheckout: {
      async createSession(params: CreateBookingCheckoutSessionParams) {
        return createBookingCheckoutSession(params);
      },
      async getSession(id: string) {
        return (await http.get<CheckoutSession>(`checkout/sessions/${id}`)).data;
      },
      async startMpesaPayment(params: StartMpesaPaymentParams) {
        return (await http.post<StartMpesaPaymentResponse>(
          `checkout/sessions/${params.checkout_session_id}/mpesa/stk-push`,
          {
            phone_number: params.phone_number,
            callback_base_url: params.callback_base_url,
          },
        )).data;
      },
      async initializePaystackPayment(params: InitializePaystackCheckoutParams) {
        return (await http.post<InitializePaystackCheckoutResponse>(
          `checkout/sessions/${params.checkout_session_id}/paystack/initialize`,
          { callback_url: params.callback_url },
        )).data;
      },
      async verifyPaystackPayment(checkoutSessionId: string) {
        return (await http.post<VerifyPaystackCheckoutResponse>(
          `checkout/sessions/${checkoutSessionId}/paystack/verify`,
          {},
        )).data;
      },
      async completeCashSession(id: string) {
        return (await http.post<CompleteCashSessionResponse>(`checkout/sessions/${id}/cash`, {})).data;
      },
      async init(options: BookingCheckoutInitOptions) {
        if (typeof window === "undefined" || typeof document === "undefined") {
          throw new Error("bookingCheckout.init requires a browser environment");
        }

        const mod = await import("./react");
        await mod.openTopDukaBookingCheckout({ client, ...options });
      },
    },

    tickets: {
      async get(token: string) {
        return (await http.get<Ticket>(`tickets/${token}`)).data;
      },
    },

    cart: {
      async get() {
        const sid = getStoredSession();
        if (!sid) return null;
        return (await http.get<Cart>(`cart?session_id=${sid}`)).data;
      },
      async create(params?: CartCreateParams) {
        const result = (await http.post<{ session_id: string }>("cart", params || {})).data;
        setStoredSession(result.session_id);
        return result;
      },
      async updateProduct(params: { product_id: string; quantity: number; booking_slot_id?: string | null; ticket_type_id?: string | null }) {
        const sid = getStoredSession();
        if (!sid) throw new Error("No cart session. Call cart.create() first.");
        return (await http.post("cart/update", { session_id: sid, ...params })).data;
      },
      async complete(params: Omit<CartCompleteParams, "session_id">) {
        const sid = getStoredSession();
        if (!sid) throw new Error("No cart session. Call cart.create() first.");
        const result = (await http.post("cart/complete", { ...params, session_id: sid })).data;
        clearStoredSession();
        return result;
      },
      async delete() {
        const sid = getStoredSession();
        if (!sid) return;
        await http.delete(`cart?session_id=${sid}`);
        clearStoredSession();
      },
      async clear() {
        const sid = getStoredSession();
        if (!sid) return;
        await http.post("cart/clear", { session_id: sid });
      },
      getSessionId() {
        return getStoredSession();
      },
    },

    checkout: {
      async createSession(params: CreateCheckoutSessionParams) {
        const sid = params.session_id || getStoredSession();
        if (!sid) throw new Error("No cart session. Call cart.create() first.");
        return (await http.post<CheckoutSession>("checkout/sessions", { ...params, session_id: sid })).data;
      },
      async getSession(id: string) {
        return (await http.get<CheckoutSession>(`checkout/sessions/${id}`)).data;
      },
      async startMpesaPayment(params: StartMpesaPaymentParams) {
        return (await http.post<StartMpesaPaymentResponse>(
          `checkout/sessions/${params.checkout_session_id}/mpesa/stk-push`,
          {
            phone_number: params.phone_number,
            callback_base_url: params.callback_base_url,
          },
        )).data;
      },
      async initializePaystackPayment(params: InitializePaystackCheckoutParams) {
        return (await http.post<InitializePaystackCheckoutResponse>(
          `checkout/sessions/${params.checkout_session_id}/paystack/initialize`,
          { callback_url: params.callback_url },
        )).data;
      },
      async verifyPaystackPayment(checkoutSessionId: string) {
        const result = (await http.post<VerifyPaystackCheckoutResponse>(
          `checkout/sessions/${checkoutSessionId}/paystack/verify`,
          {},
        )).data;
        if (result.checkout_session?.status === "completed") {
          clearStoredSession();
        }
        return result;
      },
      async completeCashSession(id: string) {
        const result = (await http.post<CompleteCashSessionResponse>(`checkout/sessions/${id}/cash`, {})).data;
        clearStoredSession();
        return result;
      },
      async init(options?: CheckoutInitOptions) {
        if (typeof window === "undefined" || typeof document === "undefined") {
          throw new Error("checkout.init requires a browser environment");
        }

        const mod = await import("./react");
        await mod.openTopDukaCheckout({ client, ...options });
      },
    },

    config: {
      async get() {
        return (await http.get<StoreConfig>("config")).data;
      },
    },

    store: {
      async get() {
        return (await http.get<StoreInfo>("store-info")).data;
      },
    },

    orders: {
      async list(skip?: number) {
        return (await http.get<Order[]>(`orders${buildQuery({ skip })}`)).data;
      },
      async get(orderId: string) {
        return (await http.get<Order>(`orders/${orderId}`)).data;
      },
      async track(orderNumber: number) {
        return (await http.get<Order>(`orders/track${buildQuery({ order_number: orderNumber })}`)).data;
      },
    },

    payments: {
      async getConfig() {
        return (await http.get<PaystackConfig>("payments/config")).data;
      },
      async initialize(params: InitializePaymentParams) {
        return (await http.post<InitializePaymentResponse>("payments/initialize", params)).data;
      },
      async verify(params: VerifyPaymentParams) {
        return (await http.post<VerifyPaymentResponse>("payments/verify", params)).data;
      },
      async payInline(options: PaystackInlineOptions) {
        const config = (await http.get<PaystackConfig>("payments/config")).data;
        if (!config.public_key) {
          throw new Error("Paystack is not configured for this store");
        }
        await loadPaystackScript();
        const ref = options.reference || `txn_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const win = typeof window !== "undefined" ? window as any : undefined;
        if (!win?.PaystackPop) {
          throw new Error("PaystackPop not available after loading script");
        }
        const handler = win.PaystackPop.setup({
          key: config.public_key,
          email: options.email,
          amount: options.amount,
          currency: options.currency || "NGN",
          ref,
          callback: function (response: { reference: string }) {
            options.onSuccess(response);
          },
          onClose: function () {
            options.onClose?.();
          },
        });
        handler.openIframe();
      },
      async getPesapalConfig() {
        return (await http.get<PesapalConfig>("payments/pesapal/config")).data;
      },
      async createPesapalOrder(params: PesapalOrderParams) {
        return (await http.post<PesapalOrderResponse>("payments/pesapal/order", params)).data;
      },
      async verifyPesapalTransaction(params: PesapalVerifyParams) {
        return (await http.get<PesapalTransactionStatus>(
          `payments/pesapal/status?order_tracking_id=${params.order_tracking_id}`
        )).data;
      },
    },
  };

  return client;
}
