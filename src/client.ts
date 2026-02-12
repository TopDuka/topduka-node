import axios, { AxiosInstance } from "axios";
import {
  Product, Category, ProductGetParams, CategoryGetParams, DiscountedProductsParams,
  Banner, BannerGetParams,
  Cart, CartCreateParams, CartCompleteParams,
  StoreConfig, StoreInfo,
  Order,
  PaystackConfig, PaystackInlineOptions, InitializePaymentParams, InitializePaymentResponse,
  VerifyPaymentParams, VerifyPaymentResponse,
} from "./types";

export interface TopDukaClientOptions {
  baseURL: string;
  apiKey?: string;
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
  banners: {
    list(params?: BannerGetParams): Promise<Banner[]>;
  };
  cart: {
    get(): Promise<Cart | null>;
    create(params?: CartCreateParams): Promise<{ session_id: string }>;
    updateProduct(params: { product_id: string; quantity: number }): Promise<unknown>;
    complete(params: Omit<CartCompleteParams, "session_id">): Promise<unknown>;
    delete(): Promise<void>;
    clear(): Promise<void>;
    getSessionId(): string | null;
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
  };
  payments: {
    getConfig(): Promise<PaystackConfig>;
    initialize(params: InitializePaymentParams): Promise<InitializePaymentResponse>;
    verify(params: VerifyPaymentParams): Promise<VerifyPaymentResponse>;
    payInline(options: PaystackInlineOptions): Promise<void>;
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

export function createClient(options: TopDukaClientOptions): TopDukaClient {
  const baseURL = options.baseURL.endsWith("/pb/v1")
    ? options.baseURL
    : `${options.baseURL.replace(/\/+$/, "")}/pb/v1`;

  const http: AxiosInstance = axios.create({ baseURL });

  if (options.apiKey) {
    http.interceptors.request.use((config) => {
      config.headers["x-api-key"] = options.apiKey;
      return config;
    });
  }

  return {
    products: {
      async list(params?: ProductGetParams) {
        const qs = buildQuery({
          id: params?.id, sku: params?.sku, slug: params?.slug, search_term: params?.search_term,
          status: params?.status, barcode: params?.barcode, skip: params?.skip, category_id: params?.category_id
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

    banners: {
      async list(params?: BannerGetParams) {
        return (await http.get<Banner[]>(`banners${buildQuery({ status: params?.status, type: params?.type, skip: params?.skip })}`)).data;
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
      async updateProduct(params: { product_id: string; quantity: number }) {
        const sid = getStoredSession();
        if (!sid) throw new Error("No cart session. Call cart.create() first.");
        return (await http.post("cart/update", { session_id: sid, product_id: params.product_id, quantity: params.quantity })).data;
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
    },
  };
}
