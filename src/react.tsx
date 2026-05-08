import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import type { TopDukaClient } from "./client";
import {
  PaymentMethod,
  type BookingCheckoutInitOptions,
  type CheckoutCustomerInfo,
  type CheckoutInitOptions,
  type CheckoutSession,
  type CheckoutShippingInfo,
  type CompleteCashSessionResponse,
  type InitializePaystackCheckoutParams,
  type InitializePaystackCheckoutResponse,
} from "./types";

type TopDukaCheckoutDialogProps = {
  client: TopDukaClient;
  open: boolean;
  cartSessionId?: string;
  title?: string;
  clearCartOnSuccess?: boolean;
  createSession?: (
    method: PaymentMethod.Cash | PaymentMethod.Mpesa | PaymentMethod.Paystack,
    customer: CheckoutCustomerInfo,
    shipping: CheckoutShippingInfo,
  ) => Promise<CheckoutSession>;
  completeCashSession?: (id: string) => Promise<CompleteCashSessionResponse>;
  initializePaystackPayment?: (params: InitializePaystackCheckoutParams) => Promise<InitializePaystackCheckoutResponse>;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (result: { checkout_session: CheckoutSession; order?: unknown }) => void;
  onClose?: () => void;
};

const EMPTY_CUSTOMER: CheckoutCustomerInfo = {
  full_name: "",
  email: "",
  phone_number: "",
};

const EMPTY_SHIPPING: CheckoutShippingInfo = {
  address_line1: "",
  address_line2: "",
  city: "",
  state_province: "",
  postal_code: "",
  country: "Kenya",
};

const panelStyle: React.CSSProperties = {
  position: "fixed",
  right: 0,
  top: 0,
  bottom: 0,
  width: "min(100vw, 420px)",
  background: "#fff",
  boxShadow: "0 24px 80px rgba(15, 23, 42, 0.24)",
  zIndex: 2147483647,
  display: "flex",
  flexDirection: "column",
  fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 40,
  border: "1px solid #d1d5db",
  padding: "0 10px",
  fontSize: 14,
};

const buttonStyle: React.CSSProperties = {
  height: 44,
  border: 0,
  background: "#111827",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

function Field(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label style={{ display: "grid", gap: 6, fontSize: 13, color: "#374151" }}>
      {props.label}
      <input
        style={inputStyle}
        value={props.value}
        type={props.type || "text"}
        required={props.required}
        onChange={(event) => props.onChange(event.target.value)}
      />
    </label>
  );
}

export function TopDukaCheckoutDialog({
  client,
  open,
  cartSessionId,
  title = "Checkout",
  clearCartOnSuccess = true,
  createSession: createCheckoutSession,
  completeCashSession = client.checkout.completeCashSession,
  initializePaystackPayment = client.checkout.initializePaystackPayment,
  onOpenChange,
  onSuccess,
  onClose,
}: TopDukaCheckoutDialogProps) {
  const [step, setStep] = React.useState<"details" | "payment" | "mpesa_wait">("details");
  const [customer, setCustomer] = React.useState<CheckoutCustomerInfo>(EMPTY_CUSTOMER);
  const [shipping, setShipping] = React.useState<CheckoutShippingInfo>(EMPTY_SHIPPING);
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod.Cash | PaymentMethod.Mpesa | PaymentMethod.Paystack>(PaymentMethod.Cash);
  const [paystackEnabled, setPaystackEnabled] = React.useState(false);
  const [cashEnabled, setCashEnabled] = React.useState(true);
  const [mpesaEnabled, setMpesaEnabled] = React.useState(false);
  const [mpesaName, setMpesaName] = React.useState("M-Pesa");
  const [mpesaPhone, setMpesaPhone] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    client.config.get()
      .then((config) => {
        setCashEnabled(config.cash_enabled !== false);
        setMpesaEnabled(Boolean(config.mpesa_enabled));
        setPaystackEnabled(Boolean(config.paystack_enabled));
        setMpesaName(config.mpesa_display_name || "M-Pesa");
        if (config.cash_enabled === false && config.mpesa_enabled) {
          setPaymentMethod(PaymentMethod.Mpesa);
        } else if (config.cash_enabled === false && !config.mpesa_enabled && config.paystack_enabled) {
          setPaymentMethod(PaymentMethod.Paystack);
        }
      })
      .catch(() => {
        setCashEnabled(true);
        setMpesaEnabled(false);
      });
  }, [client, open]);

  if (!open) {
    return null;
  }

  const close = () => {
    onOpenChange?.(false);
    onClose?.();
  };

  const createSession = (method: PaymentMethod.Cash | PaymentMethod.Mpesa | PaymentMethod.Paystack) => {
    if (createCheckoutSession) {
      return createCheckoutSession(method, customer, shipping);
    }
    return client.checkout.createSession({
      session_id: cartSessionId,
      payment_method: method,
      customer,
      shipping,
    });
  };

  const pollMpesaSession = async (sessionId: string) => {
    for (let i = 0; i < 24; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const session = await client.checkout.getSession(sessionId);
      if (session.status === "completed") {
        if (clearCartOnSuccess) {
          await client.cart.delete().catch(() => undefined);
        }
        onSuccess?.({ checkout_session: session });
        close();
        return;
      }
      if (session.status === "failed") {
        throw new Error(session.error_message || "M-Pesa payment failed");
      }
    }
    throw new Error("M-Pesa confirmation is still pending. Check the order status before trying again.");
  };

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      if (paymentMethod === PaymentMethod.Cash) {
        const session = await createSession(PaymentMethod.Cash);
        const result = await completeCashSession(session.id);
        onSuccess?.(result);
        close();
        return;
      }

      if (paymentMethod === PaymentMethod.Paystack) {
        const session = await createSession(PaymentMethod.Paystack);
        if (typeof window === "undefined") {
          throw new Error("Paystack checkout requires a browser environment");
        }
        const returnUrl = new URL(window.location.href);
        returnUrl.searchParams.set("topduka_checkout_session", session.id);
        const payment = await initializePaystackPayment({
          checkout_session_id: session.id,
          callback_url: returnUrl.toString(),
        });
        window.location.href = payment.authorization_url;
        return;
      }

      const session = await createSession(PaymentMethod.Mpesa);
      const started = await client.checkout.startMpesaPayment({
        checkout_session_id: session.id,
        phone_number: mpesaPhone || customer.phone_number,
      });
      setMessage(started.customer_message || "Check your phone and enter your M-Pesa PIN.");
      setStep("mpesa_wait");
      await pollMpesaSession(session.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(17, 24, 39, 0.52)", zIndex: 2147483646 }}>
      <aside style={panelStyle} role="dialog" aria-modal="true" aria-label="TopDuka checkout">
        <div style={{ padding: 20, borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between" }}>
          <strong>{title}</strong>
          <button type="button" onClick={close} style={{ border: 0, background: "transparent", cursor: "pointer", fontSize: 18 }}>
            x
          </button>
        </div>

        <div style={{ padding: 20, overflowY: "auto", display: "grid", gap: 14 }}>
          {step === "details" && (
            <>
              <Field label="Full name" value={customer.full_name} required onChange={(value) => setCustomer((prev) => ({ ...prev, full_name: value }))} />
              <Field label="Email" type="email" value={customer.email} required onChange={(value) => setCustomer((prev) => ({ ...prev, email: value }))} />
              <Field label="Phone number" value={customer.phone_number} required onChange={(value) => setCustomer((prev) => ({ ...prev, phone_number: value }))} />
              <Field label="Address" value={shipping.address_line1} required onChange={(value) => setShipping((prev) => ({ ...prev, address_line1: value }))} />
              <Field label="City" value={shipping.city} required onChange={(value) => setShipping((prev) => ({ ...prev, city: value }))} />
              <Field label="County / state" value={shipping.state_province} required onChange={(value) => setShipping((prev) => ({ ...prev, state_province: value }))} />
              <Field label="Country" value={shipping.country} required onChange={(value) => setShipping((prev) => ({ ...prev, country: value }))} />
            </>
          )}

          {step === "payment" && (
            <>
              {cashEnabled && (
                <button type="button" onClick={() => setPaymentMethod(PaymentMethod.Cash)} style={{ padding: 14, border: `2px solid ${paymentMethod === PaymentMethod.Cash ? "#111827" : "#e5e7eb"}`, background: "#fff", textAlign: "left" }}>
                  <strong>Cash</strong>
                  <div style={{ color: "#6b7280", fontSize: 13 }}>Pay on delivery or in person.</div>
                </button>
              )}
              {mpesaEnabled && (
                <button type="button" onClick={() => setPaymentMethod(PaymentMethod.Mpesa)} style={{ padding: 14, border: `2px solid ${paymentMethod === PaymentMethod.Mpesa ? "#111827" : "#e5e7eb"}`, background: "#fff", textAlign: "left" }}>
                  <strong>{mpesaName}</strong>
                  <div style={{ color: "#6b7280", fontSize: 13 }}>Receive an STK Push on your phone.</div>
                </button>
              )}
              {paystackEnabled && (
                <button type="button" onClick={() => setPaymentMethod(PaymentMethod.Paystack)} style={{ padding: 14, border: `2px solid ${paymentMethod === PaymentMethod.Paystack ? "#111827" : "#e5e7eb"}`, background: "#fff", textAlign: "left" }}>
                  <strong>Paystack</strong>
                  <div style={{ color: "#6b7280", fontSize: 13 }}>Pay by card, bank, USSD, or supported Paystack channel.</div>
                </button>
              )}
              {paymentMethod === PaymentMethod.Mpesa && (
                <Field label="M-Pesa phone number" value={mpesaPhone} onChange={setMpesaPhone} />
              )}
            </>
          )}

          {step === "mpesa_wait" && (
            <div style={{ display: "grid", gap: 10 }}>
              <strong>Waiting for M-Pesa confirmation</strong>
              <p style={{ margin: 0, color: "#4b5563", fontSize: 14 }}>{message}</p>
            </div>
          )}

          {error && <div style={{ color: "#b91c1c", fontSize: 14 }}>{error}</div>}
        </div>

        <div style={{ padding: 20, borderTop: "1px solid #e5e7eb", display: "grid", gap: 10 }}>
          {step === "details" ? (
            <button type="button" style={buttonStyle} onClick={() => setStep("payment")}>
              Continue to payment
            </button>
          ) : (
            <button type="button" style={{ ...buttonStyle, opacity: busy ? 0.7 : 1 }} disabled={busy} onClick={submit}>
              {busy ? "Processing..." : paymentMethod === PaymentMethod.Mpesa ? `Pay with ${mpesaName}` : paymentMethod === PaymentMethod.Paystack ? "Pay with Paystack" : "Complete order"}
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}

let checkoutRoot: Root | null = null;
let checkoutContainer: HTMLDivElement | null = null;

function cleanupCheckoutRoot() {
  checkoutRoot?.unmount();
  checkoutRoot = null;
  checkoutContainer?.remove();
  checkoutContainer = null;
}

export async function openTopDukaCheckout(options: CheckoutInitOptions & { client: TopDukaClient }): Promise<void> {
  if (typeof document === "undefined") {
    throw new Error("openTopDukaCheckout requires a browser environment");
  }

  cleanupCheckoutRoot();
  checkoutContainer = document.createElement("div");
  checkoutContainer.setAttribute("data-topduka-checkout-root", "true");
  document.body.appendChild(checkoutContainer);
  checkoutRoot = createRoot(checkoutContainer);

  const close = () => {
    options.onClose?.();
    cleanupCheckoutRoot();
  };

  checkoutRoot.render(
    <TopDukaCheckoutDialog
      client={options.client}
      open
      cartSessionId={options.cart_session_id}
      onClose={close}
      onOpenChange={(open) => {
        if (!open) close();
      }}
      onSuccess={(result) => {
        options.onSuccess?.(result);
        cleanupCheckoutRoot();
      }}
    />,
  );
}

export async function openTopDukaBookingCheckout(options: BookingCheckoutInitOptions & { client: TopDukaClient }): Promise<void> {
  if (typeof document === "undefined") {
    throw new Error("openTopDukaBookingCheckout requires a browser environment");
  }

  cleanupCheckoutRoot();
  checkoutContainer = document.createElement("div");
  checkoutContainer.setAttribute("data-topduka-checkout-root", "true");
  document.body.appendChild(checkoutContainer);
  checkoutRoot = createRoot(checkoutContainer);

  const close = () => {
    options.onClose?.();
    cleanupCheckoutRoot();
  };

  checkoutRoot.render(
    <TopDukaCheckoutDialog
      client={options.client}
      open
      title="Booking checkout"
      clearCartOnSuccess={false}
      createSession={async (paymentMethod, customer, shipping) => {
        const result = await options.client.bookingCheckout.createSession({
          event_id_or_slug: options.event_id_or_slug,
          ticket_type_id: options.ticket_type_id,
          booking_slot_id: options.booking_slot_id,
          product_id: options.product_id,
          quantity: options.quantity,
          payment_method: paymentMethod,
          customer,
          shipping,
        });
        return result.checkout_session;
      }}
      completeCashSession={options.client.bookingCheckout.completeCashSession}
      initializePaystackPayment={options.client.bookingCheckout.initializePaystackPayment}
      onClose={close}
      onOpenChange={(open) => {
        if (!open) close();
      }}
      onSuccess={(result) => {
        options.onSuccess?.(result);
        cleanupCheckoutRoot();
      }}
    />,
  );
}
