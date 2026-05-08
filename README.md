<div align="center">

# @valebytes/topduka-node

**The official Node.js SDK for the TopDuka Storefront API**

Build custom storefronts, integrate product catalogs, manage carts, and process payments — all with a clean, type-safe developer experience.

[![npm version](https://img.shields.io/npm/v/@valebytes/topduka-node)](https://www.npmjs.com/package/@valebytes/topduka-node)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

</div>

---

## What is TopDuka?

TopDuka is a modern e-commerce platform that gives merchants everything they need to sell online — from product management and storefront hosting to payments and order fulfillment. This SDK lets developers interact with the TopDuka Storefront API to build headless storefronts, mobile apps, and custom integrations.

## Getting Started

### Installation

```bash
npm install @valebytes/topduka-node
```

### Initialize the Client

```ts
import { createClient } from "@valebytes/topduka-node";

const duka = createClient({
  apiKey: process.env.NEXT_PUBLIC_API_KEY!,
  // baseURL defaults to "https://api.topduka.com"
  // SDK targets "/api/v1" automatically
  // baseURL: "https://api.topduka.com" // optional
});
```

## API Reference

### Products

The Products API provides comprehensive access to your store's product catalog with advanced filtering, search, and categorization capabilities.

#### List Products

Fetch products with full filtering, search, and pagination support.

**Basic Usage:**

```ts
// Get all products
const allProducts = await duka.products.list();

// Get active products only
const activeProducts = await duka.products.list({ status: "active" });
```

**Advanced Filtering:**

```ts
// Search by name/description
const headphones = await duka.products.list({
  search_term: "wireless headphones"
});

// Filter by category and status
const electronics = await duka.products.list({
  category_id: "electronics-category-id",
  status: "active"
});

// Complex filtering
const filteredProducts = await duka.products.list({
  search_term: "laptop",
  status: "active",
  category_id: "electronics-id",
  skip: 20 // Pagination: skip first 20 results
});
```

**Lookup by Specific Identifiers:**

```ts
// By SKU
const productBySku = await duka.products.list({
  sku: "LAPTOP-2024"
});

// By barcode
const productByBarcode = await duka.products.list({
  barcode: "123456789"
});

// By slug (URL-friendly identifier)
const productBySlug = await duka.products.list({
  slug: "wireless-headphones"
});

// Get single product by UUID
const singleProduct = await duka.products.list({
  id: "550e8400-e29b-41d4-a716-446655440000"
});
```

**Parameters (ProductGetParams):**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `id` | string | Get specific product by UUID | `"550e8400-e29b-41d4-a716-446655440000"` |
| `sku` | string | Filter by product SKU | `"LAPTOP-2024"` |
| `slug` | string | Filter by URL-friendly slug | `"wireless-headphones"` |
| `search_term` | string | Search in name/description | `"wireless headphones"` |
| `status` | string | Filter by status | `"active"`, `"inactive"`, `"draft"` |
| `barcode` | string | Filter by barcode | `"123456789"` |
| `skip` | number | Pagination offset | `20` (skip first 20) |
| `category_id` | string | Filter by category UUID | `"category-uuid"` |
| `tag_id` | string | Filter by tag UUID | `"tag-uuid"` |

**Returns:** `Promise<Product[]>`

**Product Interface:**

```ts
interface Product {
  id: string;                    // Unique product identifier
  name: string;                  // Product name
  description: string;           // Full product description
  short_description?: string;    // Brief description for listings
  sku?: string;                  // Stock Keeping Unit
  barcode?: string;              // Product barcode
  slug?: string;                  // URL-friendly identifier
  price: number;                  // Regular price
  sales_price?: number;           // Sale price (if applicable)
  status: string;                 // Product status
  rating?: number;                // Average rating (0-5)
  images?: string[];             // Product image URLs
  categories?: string[];         // Category names
  category_ids?: string[];        // Category UUIDs
  tags?: string[];                // Tag names
  tag_ids?: string[];             // Tag UUIDs
  stock?: number;                 // Available quantity
  created_at: string;             // Creation timestamp
  updated_at: string;             // Last update timestamp
}
```

**Best Practices:**
- Use `skip` for pagination to avoid loading too many products at once
- Use `search_term` for product search functionality
- Filter by `status: "active"` for customer-facing listings
- Cache results for frequently accessed products
- Use specific identifiers (`id`, `sku`, `slug`) for direct product lookups

#### Popular Products

Get trending products based on view count and popularity metrics.

```ts
// Get first 20 popular products
const popular = await duka.products.popular();

// Get next page (skip first 20)
const morePopular = await duka.products.popular(20);
```

**Parameters:** `skip?: number` (default: 0)

**Returns:** `Promise<Product[]>`

#### Discounted Products

Fetch products currently on sale with discount filtering.

```ts
// All discounted products
const discounted = await duka.products.discounted();

// Products with at least 20% discount
const highDiscount = await duka.products.discounted({
  min_discount: 20
});

// Products with discount between 10-50%
const moderateDiscount = await duka.products.discounted({
  min_discount: 10,
  max_discount: 50
});
```

**Parameters (DiscountedProductsParams):**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `min_discount` | number | Minimum discount percentage | `20` |
| `max_discount` | number | Maximum discount percentage | `50` |
| `skip` | number | Pagination offset | `10` |

**Returns:** `Promise<Product[]>`

#### Best Selling Products

Get top-selling products ordered by sales volume.

```ts
// Get first 20 best-sellers
const bestSellers = await duka.products.bestSelling();

// Get next page
const moreBestSellers = await duka.products.bestSelling(20);
```

**Parameters:** `skip?: number` (default: 0)

**Returns:** `Promise<Product[]>`

---

### Categories

Organize and manage product categories for better navigation and filtering.

#### List Categories

Fetch all product categories with filtering options.

```ts
// Get all categories
const allCategories = await duka.categories.list();

// Get only active categories
const activeCategories = await duka.categories.list({
  is_active: true
});

// Get specific category by slug
const electronics = await duka.categories.list({
  slug: "electronics"
});
```

**Parameters (CategoryGetParams):**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `slug` | string | Get specific category by slug | `"electronics"` |
| `is_active` | boolean | Filter by active status | `true`, `false` |

**Returns:** `Promise<Category[]>`

**Category Interface:**

```ts
interface Category {
  id: string;                    // Unique category identifier
  name: string;                  // Category name
  slug?: string;                 // URL-friendly identifier
  description?: string;          // Category description
  is_active: boolean;            // Whether category is active
  placeholder_type?: string;     // Type of placeholder content
  placeholder_value?: string;    // Placeholder content value
  created_at: string;            // Creation timestamp
  updated_at: string;            // Last update timestamp
}
```

#### Get Category Products

Retrieve all products within a specific category.

```ts
// Get products in electronics category
const electronicsProducts = await duka.categories.getProducts("category-uuid");

// Use for category pages
async function loadCategoryPage(categorySlug: string) {
  const categories = await duka.categories.list({ slug: categorySlug });
  const category = categories[0];
  
  if (category) {
    const products = await duka.categories.getProducts(category.id);
    return { category, products };
  }
}
```

**Parameters:** `categoryId: string` (Category UUID)

**Returns:** `Promise<Product[]>`

**Best Practices:**
- Use categories for product navigation and filtering
- Cache category data as it changes infrequently
- Display category descriptions for better user experience
- Use `is_active: true` filter for customer-facing category lists

---

### Tags

Manage product tags for flexible categorization and search functionality.

#### List Tags

Fetch all product tags with search capabilities.

```ts
// Get all tags
const allTags = await duka.tags.list();

// Search for specific tags
const techTags = await duka.tags.list({
  search_term: "technology"
});
```

**Parameters (TagGetParams):**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search_term` | string | Search tag names | `"technology"` |

**Returns:** `Promise<Tag[]>`

**Tag Interface:**

```ts
interface Tag {
  id: string;           // Unique tag identifier
  name: string;         // Tag name
  slug?: string;        // URL-friendly identifier
  store_id: string;     // Store identifier
  created_at: string;   // Creation timestamp
  updated_at: string;   // Last update timestamp
}
```

#### Get Tag Products

Retrieve all products associated with a specific tag.

```ts
// Get products with "new-arrival" tag
const newArrivals = await duka.tags.getProducts("tag-uuid");

// Use for tag-based filtering
async function loadTagProducts(tagName: string) {
  const tags = await duka.tags.list({ search_term: tagName });
  const tag = tags.find(t => t.name === tagName);
  
  if (tag) {
    const products = await duka.tags.getProducts(tag.id);
    return products;
  }
}
```

**Parameters:** `tagId: string` (Tag UUID)

**Returns:** `Promise<Product[]>`

**Best Practices:**
- Use tags for flexible product categorization
- Implement tag-based search and filtering
- Display popular tags as clickable filters
- Use descriptive tag names for better user experience

---

### Banners

Manage promotional banners and marketing content.

#### List Banners

Fetch promotional banners with filtering options.

```ts
// Get all active banners
const activeBanners = await duka.banners.list({
  status: "active"
});

// Get specific banner type
const heroBanners = await duka.banners.list({
  type: "hero",
  status: "active"
});

// Get banners with pagination
const banners = await duka.banners.list({
  status: "active",
  skip: 0
});
```

**Parameters (BannerGetParams):**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `status` | string | Filter by status | `"active"`, `"inactive"` |
| `type` | string | Filter by banner type | `"hero"`, `"sidebar"` |
| `skip` | number | Pagination offset | `10` |

**Returns:** `Promise<Banner[]>`

**Banner Interface:**

```ts
interface Banner {
  id: string;           // Unique banner identifier
  title: string;         // Banner title
  description?: string;  // Banner description
  image_url: string;     // Banner image URL
  link_url?: string;     // Click-through URL
  type: string;          // Banner type
  status: string;        // Banner status
  sort_order: number;    // Display order
  created_at: string;    // Creation timestamp
  updated_at: string;    // Last update timestamp
}
```

**Best Practices:**
- Use `sort_order` to control banner display sequence
- Filter by `status: "active"` for live banners
- Implement banner click tracking via `link_url`
- Use different banner types for various layout sections

---

### Cart

Complete shopping cart management with automatic session handling via `localStorage`. Cart sessions persist across browser refreshes and provide a seamless shopping experience.

> **Important Notes:**
> - Cart sessions are automatically managed via `localStorage` (key: `topduka_cart_session`)
> - No need to manually pass session IDs - they're handled internally
> - Sessions persist until explicitly cleared or until checkout completion

#### Create Cart Session

Initialize a new shopping cart session or resume an existing one.

**Basic Cart Creation:**

```ts
// Create new cart session
const result = await duka.cart.create();
console.log(result.session_id); // "abc123..."
```

**Resume Existing Cart:**

```ts
// Resume existing cart (useful for cart sharing)
const result = await duka.cart.create({
  cart_id: "existing-cart-uuid"
});
```

**Associate with Customer:**

```ts
// Create cart linked to customer (for authenticated users)
const result = await duka.cart.create({
  customer_id: "customer-uuid"
});
```

**Parameters (CartCreateParams):**

```ts
interface CartCreateParams {
  cart_id?: string;     // Resume existing cart by UUID
  customer_id?: string; // Associate cart with customer
}
```

**Returns:** `Promise<{ session_id: string }>`

**Best Practices:**
- Call `create()` before any cart operations if no session exists
- Use `customer_id` for authenticated users to persist cart across devices
- Handle cart creation errors gracefully (network issues, invalid cart_id)

#### Get Current Cart

Retrieve the current cart contents, including items, quantities, and totals.

```ts
const cart = await duka.cart.get();

if (cart) {
  console.log(`Cart has ${cart.item_count} items`);
  console.log(`Total: $${cart.total}`);
  
  cart.items.forEach(item => {
    console.log(`${item.quantity}x ${item.product_name} - $${item.price}`);
  });
} else {
  console.log("No active cart session");
  // Show "empty cart" message or call cart.create()
}
```

**Returns:** `Promise<Cart | null>`

**Cart Interface:**

```ts
interface Cart {
  id: string;           // Cart identifier
  session_id: string;   // Session identifier
  items: CartItem[];    // Cart items
  total?: number;       // Total price (before tax/shipping)
  item_count?: number;  // Total quantity of all items
}

interface CartItem {
  id: string;              // Cart item identifier
  product_id: string;      // Product identifier
  product_name?: string;   // Product name at time of addition
  product_image?: string;  // Product image URL
  price?: number;          // Unit price at time of addition
  sales_price?: number;    // Sale price (if applicable)
  quantity: number;        // Quantity in cart
  sku?: string;            // Product SKU
}
```

**Error Handling:**

```ts
try {
  const cart = await duka.cart.get();
  if (!cart) {
    // No active session - create new cart
    await duka.cart.create();
  }
} catch (error) {
  console.error("Failed to load cart:", error);
  // Handle error (show retry button, offline message, etc.)
}
```

#### Add/Update Product

Add a product to cart or update the quantity of an existing item.

**Add New Item:**

```ts
// Add product to cart
await duka.cart.updateProduct({
  product_id: "product-uuid",
  quantity: 1
});
```

**Update Quantity:**

```ts
// Increase quantity to 5
await duka.cart.updateProduct({
  product_id: "product-uuid",
  quantity: 5
});

// Reduce quantity to 2
await duka.cart.updateProduct({
  product_id: "product-uuid",
  quantity: 2
});
```

**Remove Item:**

```ts
// Remove item completely
await duka.cart.updateProduct({
  product_id: "product-uuid",
  quantity: 0
});
```

**Parameters:**

```ts
interface UpdateProductParams {
  product_id: string;  // Product to add/update/remove
  quantity: number;    // New quantity (0 to remove)
}
```

**Returns:** `Promise<unknown>`

**Error Handling:**

```ts
try {
  await duka.cart.updateProduct({
    product_id: "product-uuid",
    quantity: 2
  });
  
  // Refresh cart data after successful update
  const updatedCart = await duka.cart.get();
  console.log(`Cart now has ${updatedCart?.item_count} items`);
  
} catch (error) {
  if (error.message?.includes("session")) {
    console.error("No active cart session");
    // Prompt user to create cart or handle gracefully
  } else if (error.message?.includes("product")) {
    console.error("Invalid product or out of stock");
    // Show product unavailable message
  } else {
    console.error("Failed to update cart:", error);
    // Show generic error message
  }
}
```

#### Hosted Checkout Sessions

Hosted checkout is the recommended checkout flow for Cash, M-Pesa, and Paystack. TopDuka creates a 15-minute checkout session from the active cart, calculates the amount server-side, keeps provider secrets on the TopDuka server, and only creates the order after the payment method is confirmed. Checkout session IDs are not stored in localStorage by the SDK.

**Open the Built-in Dialog:**

```ts
await duka.checkout.init({
  onSuccess: ({ checkout_session, order }) => {
    console.log("Checkout complete", checkout_session, order);
  },
  onClose: () => {
    console.log("Checkout closed");
  },
});
```

`checkout.init()` opens the TopDuka dialog from inside the library and automatically uses the active cart session. Use the lower-level methods below only when building your own checkout UI.

**Cash Checkout:**

```ts
import { PaymentMethod } from "@valebytes/topduka-node";

const session = await duka.checkout.createSession({
  payment_method: PaymentMethod.Cash,
  customer: {
    full_name: "Jane Smith",
    email: "jane@example.com",
    phone_number: "+254700000000",
  },
  shipping: {
    address_line1: "456 Oak Avenue",
    city: "Nairobi",
    state_province: "Nairobi",
    country: "Kenya",
  },
});

const result = await duka.checkout.completeCashSession(session.id);
console.log("Order created:", result.order);
```

**M-Pesa STK Push Checkout:**

```ts
const session = await duka.checkout.createSession({
  payment_method: PaymentMethod.Mpesa,
  customer: {
    full_name: "John Doe",
    email: "john@example.com",
    phone_number: "+254700000000",
  },
  shipping: {
    address_line1: "123 Main Street",
    city: "Nairobi",
    state_province: "Nairobi",
    country: "Kenya",
  },
});

await duka.checkout.startMpesaPayment({
  checkout_session_id: session.id,
  phone_number: "+254700000000",
});

// Poll until Daraja callback marks the session completed or failed.
const current = await duka.checkout.getSession(session.id);
```

**Paystack Hosted Checkout:**

```ts
const session = await duka.checkout.createSession({
  payment_method: PaymentMethod.Paystack,
  customer: {
    full_name: "John Doe",
    email: "john@example.com",
    phone_number: "+2348012345678",
  },
  shipping: {
    address_line1: "123 Main Street",
    city: "Lagos",
    state_province: "Lagos",
    country: "Nigeria",
  },
});

const payment = await duka.checkout.initializePaystackPayment({
  checkout_session_id: session.id,
  callback_url: `${window.location.origin}/payment/return`,
});

window.location.href = payment.authorization_url;

// On your return page, verify before showing success.
const result = await duka.checkout.verifyPaystackPayment(session.id);
```

**React Dialog:**

```tsx
import { TopDukaCheckoutDialog } from "@valebytes/topduka-node/react";

<TopDukaCheckoutDialog
  client={duka}
  open={checkoutOpen}
  onOpenChange={setCheckoutOpen}
  onSuccess={({ checkout_session, order }) => {
    console.log("Checkout complete", checkout_session, order);
  }}
/>
```

**Hosted Checkout Methods:**

```ts
duka.checkout.init({ onSuccess, onClose });
duka.checkout.createSession(params);
duka.checkout.getSession(checkoutSessionId);
duka.checkout.completeCashSession(checkoutSessionId);
duka.checkout.startMpesaPayment({ checkout_session_id, phone_number });
duka.checkout.initializePaystackPayment({ checkout_session_id, callback_url });
duka.checkout.verifyPaystackPayment(checkoutSessionId);
```

#### Public Booking APIs

Use the booking APIs to list events, load ticket types and slots, add tickets to the normal cart, or run a booking-only checkout.

```ts
const events = await duka.bookings.listEvents({ skip: 0 });
const event = await duka.bookings.getEvent("summer-concert");
const slots = await duka.bookings.getSlots("summer-concert");

const ticket = event.ticket_types[0];
const slot = slots[0];

await duka.bookings.addTicketToCart({
  event_id_or_slug: event.slug,
  ticket_type_id: ticket.id,
  booking_slot_id: slot.id,
  quantity: 2,
});
```

`bookings.addTicketToCart(...)` uses the normal cart session, so it is useful when customers can buy products and tickets together.

**Booking Checkout Only:**

```ts
const booking = await duka.bookingCheckout.createSession({
  event_id_or_slug: event.slug,
  ticket_type_id: ticket.id,
  booking_slot_id: slot.id,
  quantity: 2,
  payment_method: PaymentMethod.Mpesa,
  customer: {
    full_name: "John Doe",
    email: "john@example.com",
    phone_number: "+254700000000",
  },
  shipping: {
    address_line1: "Event pickup",
    city: "Nairobi",
    state_province: "Nairobi",
    country: "Kenya",
  },
});

await duka.bookingCheckout.startMpesaPayment({
  checkout_session_id: booking.checkout_session.id,
  phone_number: "+254700000000",
});
```

`bookingCheckout.createSession(...)` creates a temporary cart session just for that ticket selection, then creates a 15-minute hosted checkout session. It does not save the booking checkout session in localStorage and does not replace the normal shopping cart session.

**Open the Booking Dialog:**

```ts
await duka.bookingCheckout.init({
  event_id_or_slug: event.slug,
  ticket_type_id: ticket.id,
  booking_slot_id: slot.id,
  quantity: 1,
  onSuccess: ({ checkout_session, order }) => {
    console.log("Booking complete", checkout_session, order);
  },
});
```

**Booking Checkout Methods:**

```ts
duka.bookingCheckout.createSession(params);
duka.bookingCheckout.getSession(checkoutSessionId);
duka.bookingCheckout.completeCashSession(checkoutSessionId);
duka.bookingCheckout.startMpesaPayment({ checkout_session_id, phone_number });
duka.bookingCheckout.initializePaystackPayment({ checkout_session_id, callback_url });
duka.bookingCheckout.verifyPaystackPayment(checkoutSessionId);
duka.bookingCheckout.init({ event_id_or_slug, ticket_type_id, booking_slot_id, quantity });
```

#### Complete Checkout Legacy API

`cart.complete()` is kept for compatibility. For provider-backed payments, prefer hosted checkout sessions so TopDuka verifies payment server-side before order creation.

**Basic Checkout:**

```ts
import { PaymentMethod } from "@valebytes/topduka-node";

await duka.cart.complete({
  payment_method: PaymentMethod.Paystack,
  full_name: "John Doe",
  email: "john@example.com",
  phone_number: "+1234567890",
  address_line1: "123 Main Street",
  city: "Lagos",
  country: "Nigeria"
});
```

**Complete Checkout with All Fields:**

```ts
await duka.cart.complete({
  payment_method: PaymentMethod.Cash,
  full_name: "Jane Smith",
  email: "jane@example.com",
  phone_number: "+2348012345678",
  address_line1: "456 Oak Avenue",
  address_line2: "Suite 200",        // optional
  city: "Lagos",
  state_province: "Lagos State",     // optional
  postal_code: "100001",             // optional
  country: "Nigeria"
});
```

**Parameters (CartCompleteParams):**

```ts
interface CartCompleteParams {
  payment_method: PaymentMethod;  // Payment method enum
  full_name: string;              // Customer full name
  email: string;                  // Customer email
  phone_number: string;           // Customer phone number
  address_line1: string;          // Primary address line
  address_line2?: string;         // Secondary address line
  city: string;                   // City
  state_province?: string;        // State/Province
  postal_code?: string;           // Postal/ZIP code
  country: string;                // Country
}
```

**Payment Methods:**

```ts
enum PaymentMethod {
  Cash = "cash",              // Pay on delivery
  Mpesa = "mpesa",            // M-Pesa STK Push
  Paystack = "paystack",      // Card, bank transfer, USSD
  Flutterwave = "flutterwave", // Multiple payment options
  Paypal = "paypal",          // PayPal payments
  Stripe = "stripe"           // Stripe payments
}
```

**Returns:** `Promise<unknown>`

**Important Behaviors:**
- Cart session is automatically cleared after successful completion
- Payment processing happens server-side
- Order confirmation should be handled by your success callback/page

**Error Handling:**

```ts
try {
  await duka.cart.complete({
    payment_method: PaymentMethod.Paystack,
    full_name: "John Doe",
    email: "john@example.com",
    phone_number: "+1234567890",
    address_line1: "123 Main St",
    city: "Lagos",
    country: "Nigeria"
  });

  // Success - redirect to confirmation page
  router.push("/order-confirmation");

} catch (error) {
  if (error.message?.includes("payment")) {
    console.error("Payment processing failed");
    // Handle payment errors (insufficient funds, card declined, etc.)
  } else if (error.message?.includes("validation")) {
    console.error("Invalid checkout data");
    // Show validation errors to user
  } else if (error.message?.includes("cart")) {
    console.error("Cart is empty or invalid");
    // Redirect to cart page
  } else {
    console.error("Checkout failed:", error);
    // Show generic error message
  }
}
```

#### Clear Cart

Remove all items from cart while keeping the session active.

```ts
// Clear all items but keep session
await duka.cart.clear();

// Cart is now empty but can still add items
const emptyCart = await duka.cart.get();
console.log(emptyCart?.item_count); // 0
```

**Returns:** `Promise<void>`

**Use Cases:**
- "Empty cart" button in cart page
- After successful order (additional cleanup)
- Reset cart for new shopping session

#### Delete Cart Session

Completely destroy the cart session and all associated data.

```ts
// Destroy cart session entirely
await duka.cart.delete();

// No more cart session - localStorage cleared
const cart = await duka.cart.get();
console.log(cart); // null
```

**Returns:** `Promise<void>`

**Use Cases:**
- User logout
- Complete cart abandonment
- Reset application state

#### Get Session ID

Access the current cart session ID for debugging or external use.

```ts
const sessionId = duka.cart.getSessionId();

if (sessionId) {
  console.log("Current session:", sessionId);
  // Use session ID for external integrations
} else {
  console.log("No active cart session");
}
```

**Returns:** `string | null`

---

### Complete Cart Workflow Example

```ts
import { duka } from "./lib/duka";

// 1. Initialize cart
await duka.cart.create();

// 2. Add products
await duka.cart.updateProduct({ product_id: "product-1", quantity: 2 });
await duka.cart.updateProduct({ product_id: "product-2", quantity: 1 });

// 3. Check cart contents
const cart = await duka.cart.get();
console.log(`Cart total: $${cart?.total}`);

// 4. Complete checkout
try {
  await duka.cart.complete({
    payment_method: PaymentMethod.Paystack,
    full_name: "John Doe",
    email: "john@example.com",
    phone_number: "+1234567890",
    address_line1: "123 Main St",
    city: "Lagos",
    country: "Nigeria"
  });
  
  console.log("Order completed successfully!");
  // Cart session automatically cleared
  
} catch (error) {
  console.error("Checkout failed:", error);
  // Handle error appropriately
}
```

---

### Orders

Access customer order history and details. Requires authentication and only returns orders belonging to the authenticated customer.

#### List Orders

Retrieve a paginated list of the customer's orders, sorted by most recent first.

**Basic Usage:**

```ts
// Get first 20 orders
const orders = await duka.orders.list();

// Get next page (skip first 20)
const moreOrders = await duka.orders.list(20);

// Get third page (skip first 40)
const evenMoreOrders = await duka.orders.list(40);
```

**Parameters:** `skip?: number` (default: 0)

**Returns:** `Promise<Order[]>`

**Order Interface:**

```ts
interface Order {
  id: string;                 // Unique order identifier
  order_number?: string;      // Human-readable order number (e.g., "ORD-12345")
  status: string;             // Order status (pending, processing, shipped, delivered, cancelled)
  payment_status?: string;    // Payment status (pending, paid, failed, refunded)
  payment_method?: string;    // Payment method used (paystack, cash, etc.)
  subtotal: number;           // Subtotal before tax/discount
  discount_amount?: number;   // Discount applied
  tax_amount?: number;        // Tax amount
  total: number;              // Final total amount
  currency?: string;          // Currency code (NGN, USD, etc.)
  full_name?: string;         // Customer full name
  email?: string;             // Customer email
  phone_number?: string;      // Customer phone number
  address_line1?: string;     // Shipping address line 1
  address_line2?: string;     // Shipping address line 2
  city?: string;              // Shipping city
  state_province?: string;    // Shipping state/province
  postal_code?: string;       // Shipping postal code
  country?: string;           // Shipping country
  items?: OrderItem[];        // Order line items
  created_at: string;         // Order creation date (ISO string)
  updated_at: string;         // Last update date (ISO string)
}

interface OrderItem {
  id: string;              // Order item identifier
  product_id: string;      // Product identifier
  product_name?: string;   // Product name at time of order
  product_image?: string;  // Product image URL at time of order
  quantity: number;        // Quantity ordered
  unit_price: number;      // Price per unit
  total_price: number;     // Total for this line item (quantity × unit_price)
  sku?: string;            // Product SKU at time of order
}
```

**Best Practices:**
- Use pagination for better performance (20-50 orders per page)
- Cache order data locally to reduce API calls
- Display order status prominently in UI
- Show order numbers for easy customer reference

**Error Handling:**

```ts
try {
  const orders = await duka.orders.list();
  console.log(`Found ${orders.length} orders`);
} catch (error) {
  if (error.message?.includes("authentication")) {
    console.error("User not authenticated");
    // Redirect to login
  } else {
    console.error("Failed to load orders:", error);
    // Show error message
  }
}
```

#### Get Order by ID

Retrieve detailed information for a specific order.

```ts
// Get order details
const order = await duka.orders.get("order-uuid");

// Display order information
console.log(`Order ${order.order_number}`);
console.log(`Status: ${order.status}`);
console.log(`Total: ${order.currency} ${order.total}`);

// Show order items
order.items?.forEach(item => {
  console.log(`${item.quantity}x ${item.product_name} - ${order.currency} ${item.total_price}`);
});
```

**Parameters:** `orderId: string` (Order UUID)

**Returns:** `Promise<Order>`

**Use Cases:**
- Order details page
- Order confirmation page
- Order tracking interface

**Error Handling:**

```ts
try {
  const order = await duka.orders.get(orderId);
  // Display order details
} catch (error) {
  if (error.message?.includes("not found")) {
    console.error("Order not found");
    // Show 404 page or redirect
  } else if (error.message?.includes("permission")) {
    console.error("Access denied - order doesn't belong to user");
    // Show permission error
  } else {
    console.error("Failed to load order:", error);
  }
}
```

#### Track Order by Number

Look up an order using the human-readable order number (e.g., "ORD-12345").

```ts
// Track order by number
const order = await duka.orders.track(12345);

// Display tracking information
console.log(`Order ${order.order_number} - Status: ${order.status}`);

// Show shipping address
console.log(`Shipping to: ${order.full_name}, ${order.city}, ${order.country}`);
```

**Parameters:** `orderNumber: number` (Order number without prefix)

**Returns:** `Promise<Order>`

**Use Cases:**
- Order tracking page
- Customer service lookup
- Guest order tracking (if order numbers are public)

**Error Handling:**

```ts
try {
  const order = await duka.orders.track(orderNumber);
  // Display tracking info
} catch (error) {
  if (error.message?.includes("not found")) {
    console.error("Order number not found");
    // Show "order not found" message
  } else {
    console.error("Failed to track order:", error);
  }
}
```

---

### Complete Order Management Example

```ts
import { duka } from "./lib/duka";

// 1. Load order history
async function loadOrderHistory() {
  try {
    const orders = await duka.orders.list();
    
    orders.forEach(order => {
      console.log(`Order ${order.order_number}: ${order.status} - ${order.currency} ${order.total}`);
    });
    
    return orders;
  } catch (error) {
    console.error("Failed to load orders:", error);
    return [];
  }
}

// 2. Get order details
async function getOrderDetails(orderId: string) {
  try {
    const order = await duka.orders.get(orderId);
    
    return {
      orderNumber: order.order_number,
      status: order.status,
      total: `${order.currency} ${order.total}`,
      items: order.items || [],
      shipping: {
        name: order.full_name,
        address: `${order.address_line1}, ${order.city}, ${order.country}`,
        phone: order.phone_number
      },
      createdAt: new Date(order.created_at).toLocaleDateString()
    };
  } catch (error) {
    console.error("Failed to load order details:", error);
    throw error;
  }
}

// 3. Track order by number
async function trackOrder(orderNumber: number) {
  try {
    const order = await duka.orders.track(orderNumber);
    
    return {
      status: order.status,
      paymentStatus: order.payment_status,
      estimatedDelivery: calculateDeliveryDate(order.created_at, order.status)
    };
  } catch (error) {
    console.error("Failed to track order:", error);
    return null;
  }
}

function calculateDeliveryDate(orderDate: string, status: string): string {
  // Implementation for delivery date calculation
  const orderDateObj = new Date(orderDate);
  
  if (status === "delivered") {
    return "Delivered";
  } else if (status === "shipped") {
    const deliveryDate = new Date(orderDateObj);
    deliveryDate.setDate(deliveryDate.getDate() + 3); // 3 days delivery
    return deliveryDate.toLocaleDateString();
  } else {
    return "Processing";
  }
}
```

---

### Payments

Handle payment processing, configuration, and verification. Supports multiple payment providers including Paystack, Flutterwave, PayPal, and Stripe.

#### Get Payment Config

Check which payment providers are configured and get configuration details.

```ts
const config = await duka.payments.getConfig();

console.log("Paystack configured:", !!config.public_key);
// Output: Paystack configured: true
```

**Returns:** `Promise<PaystackConfig>`

**PaystackConfig Interface:**

```ts
interface PaystackConfig {
  public_key: string;  // Paystack public key for client-side payments
}
```

**Use Cases:**
- Show/hide payment options in checkout
- Enable/disable payment methods in UI
- Client-side payment initialization

**Error Handling:**

```ts
try {
  const config = await duka.payments.getConfig();
  // Use config to determine available payment methods
} catch (error) {
  console.error("Failed to load payment config:", error);
  // Fall back to basic payment options or show error
}
```

#### Initialize Payment (Server-side)

Start a payment transaction server-side. Returns a URL to redirect users for payment.

**Basic Payment Initialization:**

```ts
const payment = await duka.payments.initialize({
  email: "customer@example.com",
  amount: 500000, // 5000 NGN in kobo (smallest currency unit)
  reference: "txn_123456789",
  callback_url: "https://yoursite.com/payment/success"
});

// Redirect user to payment page
window.location.href = payment.authorization_url;
```

**Complete Payment Initialization:**

```ts
const payment = await duka.payments.initialize({
  email: "john.doe@example.com",
  amount: 2500000, // 25000 NGN in kobo
  reference: `payment_${Date.now()}`, // Unique reference
  callback_url: `${window.location.origin}/payment/callback`
});

console.log("Payment URL:", payment.authorization_url);
console.log("Access Code:", payment.access_code);
console.log("Reference:", payment.reference);
```

**Parameters (InitializePaymentParams):**

```ts
interface InitializePaymentParams {
  email: string;          // Customer email address
  amount: number;         // Amount in smallest currency unit (kobo/cents)
  reference?: string;     // Unique payment reference (auto-generated if not provided)
  callback_url?: string;  // URL to redirect after payment completion
}
```

**Returns:** `Promise<InitializePaymentResponse>`

**InitializePaymentResponse Interface:**

```ts
interface InitializePaymentResponse {
  authorization_url: string;  // URL to redirect user for payment
  access_code: string;        // Paystack access code for transaction
  reference: string;          // Unique payment reference
}
```

**Important Notes:**
- Amount is in kobo (₦) or cents (other currencies)
- Reference should be unique per transaction
- Callback URL receives payment result after completion
- Payment is processed by Paystack server-side

**Error Handling:**

```ts
try {
  const payment = await duka.payments.initialize({
    email: "customer@example.com",
    amount: 100000, // 1000 NGN
    reference: `pay_${Date.now()}`
  });

  // Redirect to payment page
  window.location.href = payment.authorization_url;

} catch (error) {
  if (error.message?.includes("amount")) {
    console.error("Invalid payment amount");
    // Show amount validation error
  } else if (error.message?.includes("email")) {
    console.error("Invalid email address");
    // Show email validation error
  } else if (error.message?.includes("provider")) {
    console.error("Payment provider not configured");
    // Show payment unavailable message
  } else {
    console.error("Failed to initialize payment:", error);
    // Show generic error
  }
}
```

#### Verify Payment

Check the status of a completed payment using the payment reference.

**Payment Verification:**

```ts
const verification = await duka.payments.verify({
  reference: "txn_123456789"
});

if (verification.status === "success") {
  console.log("Payment successful!");
  console.log("Amount:", verification.amount / 100, verification.currency);
  console.log("Paid at:", new Date(verification.paid_at).toLocaleString());
  
  // Fulfill order, update inventory, etc.
  await fulfillOrder(verification.reference);
  
} else {
  console.log("Payment failed or pending");
  // Handle failed or pending payment
}
```

**Parameters (VerifyPaymentParams):**

```ts
interface VerifyPaymentParams {
  reference: string;  // Payment reference to verify
}
```

**Returns:** `Promise<VerifyPaymentResponse>`

**VerifyPaymentResponse Interface:**

```ts
interface VerifyPaymentResponse {
  status: string;     // "success", "failed", or "pending"
  reference: string;  // Payment reference
  amount: number;     // Amount paid (in smallest currency unit)
  currency: string;   // Currency code (NGN, USD, etc.)
  channel: string;    // Payment channel used (card, bank, ussd, etc.)
  paid_at: string;    // Payment completion timestamp (ISO string)
}
```

**Best Practices:**
- Verify payments on callback URL to confirm completion
- Store verification results to prevent duplicate processing
- Handle all status types (success, failed, pending)
- Convert amount back from smallest currency unit for display

**Error Handling:**

```ts
try {
  const result = await duka.payments.verify({
    reference: paymentReference
  });

  switch (result.status) {
    case "success":
      await handleSuccessfulPayment(result);
      break;
    case "failed":
      await handleFailedPayment(result);
      break;
    case "pending":
      // Payment still processing - check again later
      scheduleReverification(paymentReference);
      break;
    default:
      console.warn("Unknown payment status:", result.status);
  }

} catch (error) {
  if (error.message?.includes("not found")) {
    console.error("Payment reference not found");
    // Handle invalid reference
  } else {
    console.error("Failed to verify payment:", error);
    // Retry verification or manual intervention
  }
}
```

#### Pay Inline (Client-side)

Open Paystack's inline payment modal directly in the browser. Requires Paystack to be configured.

**Basic Inline Payment:**

```ts
await duka.payments.payInline({
  email: "customer@example.com",
  amount: 500000, // 5000 NGN in kobo
  onSuccess: (response) => {
    console.log("Payment completed:", response.reference);
    // Handle successful payment
    redirectToSuccessPage(response.reference);
  },
  onClose: () => {
    console.log("Payment modal closed by user");
    // Handle user cancellation
  }
});
```

**Complete Inline Payment with All Options:**

```ts
await duka.payments.payInline({
  email: "john.doe@example.com",
  amount: 1000000, // 10000 NGN in kobo
  currency: "NGN", // Optional, defaults to NGN
  reference: `inline_pay_${Date.now()}`, // Optional, auto-generated
  onSuccess: (response) => {
    console.log("Payment successful!");
    console.log("Reference:", response.reference);
    
    // Verify payment server-side
    verifyPayment(response.reference);
    
    // Update UI
    showSuccessMessage();
  },
  onClose: () => {
    console.log("User closed payment modal");
    // Re-enable checkout button
    enableCheckoutButton();
  }
});
```

**Parameters (PaystackInlineOptions):**

```ts
interface PaystackInlineOptions {
  email: string;          // Customer email
  amount: number;         // Amount in kobo/cents
  currency?: string;      // Currency code (default: "NGN")
  reference?: string;     // Payment reference (auto-generated if not provided)
  onSuccess: (response: { reference: string }) => void;
  onClose?: () => void;
}
```

**Returns:** `Promise<void>`

**Requirements & Limitations:**
- Must run in browser environment (not Node.js/server-side)
- Automatically loads Paystack script if not present
- Paystack must be configured in store settings
- Handles script loading, modal display, and callbacks automatically

**Error Handling:**

```ts
try {
  await duka.payments.payInline({
    email: customerEmail,
    amount: orderTotal * 100, // Convert to kobo
    onSuccess: handlePaymentSuccess,
    onClose: handlePaymentCancel
  });

} catch (error) {
  if (error.message?.includes("browser")) {
    console.error("payInline requires browser environment");
    // Fall back to redirect payment method
  } else if (error.message?.includes("configured")) {
    console.error("Paystack not configured");
    // Show alternative payment methods
  } else if (error.message?.includes("script")) {
    console.error("Failed to load Paystack script");
    // Retry or use fallback
  } else {
    console.error("Failed to start inline payment:", error);
  }
}
```

---

### Complete Payment Flow Example

```ts
import { duka, PaymentMethod } from "./lib/duka";

// 1. Check payment configuration
async function checkPaymentMethods() {
  try {
    const config = await duka.payments.getConfig();
    return {
      paystack: !!config.public_key,
      // Add other payment methods as they're implemented
    };
  } catch (error) {
    console.error("Failed to check payment config:", error);
    return { paystack: false };
  }
}

// 2. Server-side payment initialization (redirect flow)
async function initiatePayment(orderData: any) {
  try {
    const payment = await duka.payments.initialize({
      email: orderData.customer.email,
      amount: Math.round(orderData.total * 100), // Convert to kobo
      reference: `order_${orderData.id}_${Date.now()}`,
      callback_url: `${window.location.origin}/payment/callback`
    });

    // Store reference for verification
    localStorage.setItem("payment_ref", payment.reference);

    // Redirect to payment page
    window.location.href = payment.authorization_url;

  } catch (error) {
    console.error("Failed to initiate payment:", error);
    throw new Error("Payment initialization failed");
  }
}

// 3. Client-side inline payment
async function payInline(orderData: any) {
  try {
    await duka.payments.payInline({
      email: orderData.customer.email,
      amount: Math.round(orderData.total * 100),
      reference: `inline_${orderData.id}_${Date.now()}`,
      onSuccess: async (response) => {
        // Verify payment immediately
        const verification = await duka.payments.verify({
          reference: response.reference
        });

        if (verification.status === "success") {
          // Complete the order
          await duka.cart.complete({
            payment_method: PaymentMethod.Paystack,
            ...orderData.shipping
          });

          redirectToSuccessPage();
        } else {
          showPaymentError("Payment verification failed");
        }
      },
      onClose: () => {
        // User cancelled payment
        console.log("Payment cancelled by user");
      }
    });

  } catch (error) {
    console.error("Inline payment failed:", error);
    throw error;
  }
}

// 4. Payment verification (callback handler)
async function verifyPaymentCallback(paymentReference: string) {
  try {
    const verification = await duka.payments.verify({
      reference: paymentReference
    });

    if (verification.status === "success") {
      // Payment successful - complete order
      const orderId = extractOrderIdFromReference(paymentReference);
      await completeOrder(orderId, verification);

      return { success: true, verification };
    } else {
      // Payment failed or pending
      return { success: false, status: verification.status };
    }

  } catch (error) {
    console.error("Payment verification failed:", error);
    return { success: false, error: error.message };
  }
}

// 5. Complete order after successful payment
async function completeOrder(orderId: string, verification: any) {
  // Implementation for order completion
  // Update order status, send confirmation email, etc.
  console.log(`Order ${orderId} completed with payment ${verification.reference}`);
}
```

---

### Store Config

Retrieve store-level settings and configuration preferences. This includes tax settings, currency preferences, and other global store configuration.

```ts
const config = await duka.config.get();

console.log("Store currency:", config.currency_code);    // "NGN"
console.log("VAT enabled:", config.vat_enabled);         // true
console.log("VAT rate:", config.vat_rate, "%");          // 16
console.log("Prices include tax:", config.prices_include_tax); // false
```

**Returns:** `Promise<StoreConfig>`

**StoreConfig Interface:**

```ts
interface StoreConfig {
  id: string;             // Configuration identifier
  vat_enabled: boolean;   // Whether VAT/tax is enabled for the store
  vat_rate: number;       // VAT rate as percentage (e.g., 16 for 16%)
  prices_include_tax: boolean; // Whether displayed prices already include tax
  currency_code: string;  // Currency code (e.g., "NGN", "USD", "EUR")
  created_at: string;     // Configuration creation date (ISO string)
}
```

**Common Use Cases:**
- Display currency symbols and formatting
- Calculate taxes on product prices
- Show tax-inclusive/exclusive pricing
- Format monetary values in UI

**Best Practices:**
- Cache config data (changes infrequently)
- Use for consistent currency formatting across app
- Check `prices_include_tax` before displaying prices
- Handle VAT calculations properly based on `vat_enabled`

**Error Handling:**

```ts
try {
  const config = await duka.config.get();
  
  // Use config for price calculations
  const displayPrice = config.prices_include_tax 
    ? product.price 
    : product.price * (1 + config.vat_rate / 100);
    
} catch (error) {
  console.error("Failed to load store config:", error);
  // Fall back to default values
  const defaultConfig = {
    currency_code: "NGN",
    vat_enabled: false,
    vat_rate: 0,
    prices_include_tax: false
  };
}
```

---

### Store Info

Fetch public store information including branding, contact details, and social media links.

```ts
const store = await duka.store.get();

console.log("Store name:", store.name);
console.log("Contact:", store.email, store.phone);
console.log("Location:", store.country_code);

// Social media links
console.log("Website:", store.website);
console.log("Social:", {
  twitter: store.twitter,
  facebook: store.facebook,
  instagram: store.instagram,
  whatsapp: store.whatsapp
});
```

**Returns:** `Promise<StoreInfo>`

**StoreInfo Interface:**

```ts
interface StoreInfo {
  id: string;           // Store identifier
  name: string;         // Store display name
  email: string;        // Contact email address
  phone: string;        // Contact phone number
  address: string;      // Store physical address
  logo: string;         // Logo image URL
  country_code: string; // Country code (e.g., "NG", "US")
  twitter: string;      // Twitter handle or URL
  facebook: string;     // Facebook page URL
  instagram: string;    // Instagram handle or URL
  whatsapp: string;     // WhatsApp number or contact link
  created_at: string;   // Store creation date (ISO string)
  updated_at: string;   // Last update date (ISO string)
}
```

**Common Use Cases:**
- Display store branding and logo
- Show contact information in footer/header
- Link to social media profiles
- Display store address/location

**Best Practices:**
- Cache store info (updates rarely)
- Use logo for consistent branding
- Validate social media URLs before displaying
- Handle missing social links gracefully

**Error Handling:**

```ts
try {
  const store = await duka.store.get();
  
  // Display store information
  document.title = store.name;
  
  // Handle social links (may be empty strings)
  const socialLinks = [];
  if (store.twitter) socialLinks.push({ name: "Twitter", url: store.twitter });
  if (store.facebook) socialLinks.push({ name: "Facebook", url: store.facebook });
  if (store.instagram) socialLinks.push({ name: "Instagram", url: store.instagram });
  
} catch (error) {
  console.error("Failed to load store info:", error);
  // Use fallback store information
  const fallbackStore = {
    name: "Store",
    email: "contact@example.com",
    logo: "/default-logo.png"
  };
}
```

---

## Framework Integration Examples

The SDK works with any JavaScript framework. Here are complete examples for popular frameworks:

### React with React Query

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { duka, PaymentMethod } from "@/lib/duka";
import { useState } from "react";

function ProductCatalog() {
  const queryClient = useQueryClient();
  const [cart, setCart] = useState(null);

  // Fetch products with caching
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: () => duka.products.list({ status: "active" }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch cart
  const { data: cartData } = useQuery({
    queryKey: ["cart"],
    queryFn: () => duka.cart.get(),
    enabled: !!cart, // Only fetch if cart exists
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: (productId: string) =>
      duka.cart.updateProduct({ product_id: productId, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      // Show success toast
    },
    onError: (error) => {
      // Show error toast
      console.error("Failed to add to cart:", error);
    },
  });

  const handleAddToCart = (productId: string) => {
    addToCartMutation.mutate(productId);
  };

  if (isLoading) return <div>Loading products...</div>;
  if (error) return <div>Failed to load products</div>;

  return (
    <div className="product-grid">
      {products?.map(product => (
        <div key={product.id} className="product-card">
          <img src={product.images?.[0]} alt={product.name} />
          <h3>{product.name}</h3>
          <p>{product.short_description}</p>
          <div className="price">${product.price}</div>
          <button
            onClick={() => handleAddToCart(product.id)}
            disabled={addToCartMutation.isPending}
          >
            {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      ))}
      
      {cartData && (
        <div className="cart-summary">
          Cart: {cartData.item_count} items (${cartData.total})
        </div>
      )}
    </div>
  );
}

function CheckoutForm() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    phone_number: "",
    address_line1: "",
    city: "",
    country: "",
  });

  const checkoutMutation = useMutation({
    mutationFn: (data) => duka.cart.complete({
      payment_method: PaymentMethod.Paystack,
      ...data,
    }),
    onSuccess: () => {
      queryClient.clear(); // Clear all cached data
      // Redirect to success page
    },
    onError: (error) => {
      // Handle checkout errors
      console.error("Checkout failed:", error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    checkoutMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        required
      />
      <input
        type="text"
        placeholder="Full Name"
        value={formData.full_name}
        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
        required
      />
      {/* Add other form fields */}
      <button type="submit" disabled={checkoutMutation.isPending}>
        {checkoutMutation.isPending ? "Processing..." : "Complete Order"}
      </button>
    </form>
  );
}
```

### Next.js App Router (Server Components)

```tsx
// app/products/page.tsx
import { duka } from "@/lib/duka";
import ProductCard from "@/components/ProductCard";

export default async function ProductsPage() {
  const products = await duka.products.list({ status: "active" });
  const store = await duka.store.get();

  return (
    <div>
      <header>
        <img src={store.logo} alt={store.name} width={40} height={40} />
        <h1>{store.name} - Products</h1>
      </header>

      <div className="product-grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

// app/cart/page.tsx
import { duka } from "@/lib/duka";
import CartItem from "@/components/CartItem";

export default async function CartPage() {
  const cart = await duka.cart.get();

  if (!cart || cart.items.length === 0) {
    return (
      <div>
        <h1>Your Cart</h1>
        <p>Your cart is empty</p>
        <a href="/products">Continue Shopping</a>
      </div>
    );
  }

  return (
    <div>
      <h1>Your Cart</h1>
      <div className="cart-items">
        {cart.items.map(item => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>
      <div className="cart-total">
        Total: ${cart.total}
      </div>
      <a href="/checkout">Proceed to Checkout</a>
    </div>
  );
}
```

### SWR with React

```tsx
import useSWR, { mutate } from "swr";
import { duka } from "@/lib/duka";

function useProducts(categoryId?: string) {
  return useSWR(
    categoryId ? ["products", categoryId] : "products",
    () => duka.products.list({ 
      status: "active", 
      category_id: categoryId 
    })
  );
}

function useCart() {
  return useSWR("cart", () => duka.cart.get());
}

function ProductList({ categoryId }) {
  const { data: products, error, isLoading } = useProducts(categoryId);
  const { data: cart, mutate: mutateCart } = useCart();

  const addToCart = async (productId: string) => {
    try {
      await duka.cart.updateProduct({ product_id: productId, quantity: 1 });
      mutateCart(); // Refresh cart data
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  if (error) return <div>Failed to load products</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {products?.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>${product.price}</p>
          <button onClick={() => addToCart(product.id)}>
            Add to Cart
          </button>
        </div>
      ))}
      
      {cart && (
        <div>Cart: {cart.item_count} items</div>
      )}
    </div>
  );
}
```

### Vue 3 Composition API

```vue
<template>
  <div>
    <div v-if="loading">Loading products...</div>
    <div v-else-if="error">Failed to load products</div>
    <div v-else>
      <div v-for="product in products" :key="product.id" class="product-card">
        <img :src="product.images?.[0]" :alt="product.name" />
        <h3>{{ product.name }}</h3>
        <p>{{ product.short_description }}</p>
        <div class="price">${{ product.price }}</div>
        <button @click="addToCart(product.id)" :disabled="addingToCart">
          {{ addingToCart ? 'Adding...' : 'Add to Cart' }}
        </button>
      </div>
      
      <div v-if="cart" class="cart-summary">
        Cart: {{ cart.item_count }} items (${{ cart.total }})
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { duka } from '@/lib/duka';

const products = ref([]);
const cart = ref(null);
const loading = ref(true);
const error = ref(null);
const addingToCart = ref(false);

onMounted(async () => {
  try {
    // Load initial data
    [products.value, cart.value] = await Promise.all([
      duka.products.list({ status: 'active' }),
      duka.cart.get()
    ]);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});

const addToCart = async (productId) => {
  addingToCart.value = true;
  try {
    await duka.cart.updateProduct({ product_id: productId, quantity: 1 });
    // Refresh cart
    cart.value = await duka.cart.get();
  } catch (err) {
    console.error('Failed to add to cart:', err);
  } finally {
    addingToCart.value = false;
  }
};
</script>
```

### Nuxt 3 (Vue/Nitro)

```ts
// server/api/products.get.ts
import { duka } from '~/lib/duka';

export default defineEventHandler(async () => {
  return await duka.products.list({ status: 'active' });
});

// server/api/cart.get.ts
import { duka } from '~/lib/duka';

export default defineEventHandler(async () => {
  return await duka.cart.get();
});

// pages/products.vue
<template>
  <div>
    <div v-for="product in products" :key="product.id">
      <NuxtLink :to="`/products/${product.id}`">
        <img :src="product.images?.[0]" :alt="product.name" />
        <h3>{{ product.name }}</h3>
        <p>${{ product.price }}</p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const { data: products } = await $fetch('/api/products');
</script>
```

---

## Best Practices

### Performance Optimization

1. **Cache Static Data**
   ```ts
   // Store config changes rarely - cache aggressively
   const storeConfig = await duka.config.get();
   const storeInfo = await duka.store.get();
   
   // Cache for hours/days
   localStorage.setItem('store_config', JSON.stringify(storeConfig));
   ```

2. **Implement Pagination**
   ```ts
   // Don't load all products at once
   const products = await duka.products.list({ skip: 0 }); // First 20
   const moreProducts = await duka.products.list({ skip: 20 }); // Next 20
   ```

3. **Use Appropriate Product Listing Methods**
   ```ts
   // Use specific methods for better performance
   const popular = await duka.products.popular();     // Fast, trending products
   const discounted = await duka.products.discounted(); // Fast, on-sale products
   const bestSelling = await duka.products.bestSelling(); // Fast, top sellers
   ```

### Error Handling Patterns

1. **Network Error Recovery**
   ```ts
   const fetchWithRetry = async (fn, retries = 3) => {
     for (let i = 0; i < retries; i++) {
       try {
         return await fn();
       } catch (error) {
         if (i === retries - 1) throw error;
         await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
       }
     }
   };
   
   // Usage
   const products = await fetchWithRetry(() => duka.products.list());
   ```

2. **Graceful Degradation**
   ```ts
   // Always provide fallback values
   const getProducts = async () => {
     try {
       return await duka.products.list({ status: 'active' });
     } catch (error) {
       console.error('API failed, using cached data');
       return getCachedProducts() || [];
     }
   };
   ```

3. **User-Friendly Error Messages**
   ```ts
   const handleApiError = (error) => {
     if (error.message?.includes('network')) {
       return 'Please check your internet connection and try again.';
     }
     if (error.message?.includes('authentication')) {
       return 'Please log in to continue.';
     }
     if (error.message?.includes('payment')) {
       return 'Payment processing failed. Please try a different method.';
     }
     return 'Something went wrong. Please try again.';
   };
   ```

### Security Considerations

1. **API Key Protection**
   ```ts
   // Never expose API keys in client-side code
   // Use environment variables
   const apiKey = process.env.NEXT_PUBLIC_API_KEY;
   
   // For server-side operations, keep keys secure
   const serverApiKey = process.env.TOPDUKA_API_KEY; // Server only
   ```

2. **Input Validation**
   ```ts
   // Validate user inputs before API calls
   const validateEmail = (email) => {
     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     return emailRegex.test(email);
   };
   
   const checkout = async (formData) => {
     if (!validateEmail(formData.email)) {
       throw new Error('Invalid email address');
     }
     // Proceed with checkout
   };
   ```

### Cart Management Best Practices

1. **Session Persistence**
   ```ts
   // Cart sessions persist automatically, but handle edge cases
   const initializeCart = async () => {
     try {
       const existingCart = await duka.cart.get();
       if (!existingCart) {
         await duka.cart.create();
       }
     } catch (error) {
       console.error('Failed to initialize cart:', error);
     }
   };
   ```

2. **Optimistic Updates**
   ```ts
   // Update UI immediately, then sync with server
   const addToCart = async (productId) => {
     // Optimistic update
     setCartItems(prev => [...prev, { product_id: productId, quantity: 1 }]);
     
     try {
       await duka.cart.updateProduct({ product_id: productId, quantity: 1 });
       // Refresh actual cart data
       const updatedCart = await duka.cart.get();
       setCartItems(updatedCart.items);
     } catch (error) {
       // Revert optimistic update
       setCartItems(prev);
       console.error('Failed to add to cart:', error);
     }
   };
   ```

3. **Inventory Checks**
   ```ts
   // Check stock before allowing purchases
   const addToCart = async (product) => {
     if (product.stock !== undefined && product.stock <= 0) {
       alert('This product is out of stock');
       return;
     }
     
     await duka.cart.updateProduct({ 
       product_id: product.id, 
       quantity: 1 
     });
   };
   ```

### Payment Integration Best Practices

1. **Payment Verification**
   ```ts
   // Always verify payments server-side
   const handlePaymentCallback = async (reference) => {
     const verification = await duka.payments.verify({ reference });
     
     if (verification.status === 'success') {
       // Only fulfill order after successful verification
       await fulfillOrder(verification);
     } else {
       // Handle failed payment
       await handlePaymentFailure(verification);
     }
   };
   ```

2. **Amount Validation**
   ```ts
   // Always convert amounts correctly
   const processPayment = (amountInDollars) => {
     // Convert to kobo (multiply by 100)
     const amountInKobo = Math.round(amountInDollars * 100);
     
     return duka.payments.initialize({
       email: customerEmail,
       amount: amountInKobo, // Paystack expects kobo
       reference: generateReference()
     });
   };
   ```

3. **Payment Method Selection**
   ```ts
   // Show available payment methods based on configuration
   const getAvailablePaymentMethods = async () => {
     const config = await duka.payments.getConfig();
     
     const methods = [];
     if (config.public_key) {
       methods.push({ id: 'paystack', name: 'Paystack' });
     }
     // Add other payment methods as configured
     
     return methods;
   };
   ```

### Development Tips

1. **TypeScript Integration**
   ```ts
   // Leverage TypeScript for better development experience
   import type { Product, Cart, Order } from '@valebytes/topduka-node';
   
   const products: Product[] = await duka.products.list();
   // TypeScript provides full autocomplete and type checking
   ```

2. **Testing Strategies**
   ```ts
   // Mock the SDK for testing
   const mockDuka = {
     products: {
       list: jest.fn().mockResolvedValue(mockProducts)
     },
     cart: {
       get: jest.fn().mockResolvedValue(mockCart)
     }
   };
   ```

3. **Monitoring and Logging**
   ```ts
   // Add comprehensive logging
   const loggedApiCall = async (apiCall, ...args) => {
     console.log(`Calling ${apiCall.name} with:`, args);
     try {
       const result = await apiCall(...args);
       console.log(`Success:`, result);
       return result;
     } catch (error) {
       console.error(`Error in ${apiCall.name}:`, error);
       throw error;
     }
   };
   
   // Usage
   const products = await loggedApiCall(duka.products.list, { status: 'active' });
   ```

---

## License

MIT
