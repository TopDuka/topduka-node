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
});
```

> `baseURL` defaults to `https://api.topduka.com`. Override it only for local development or custom deployments.

## API Reference

### Products

Fetch active listings, trending items, discounted products, and best sellers.

```ts
const products    = await duka.products.list({ status: "active" });
const popular     = await duka.products.popular();
const discounted  = await duka.products.discounted({ min_discount: 10 });
const bestSelling = await duka.products.bestSelling();
```

### Categories

Retrieve the full product category tree.

```ts
const categories = await duka.categories.list();
```

### Banners

Pull promotional banners for your storefront.

```ts
const banners = await duka.banners.list({ status: "active" });
```

### Cart

Create sessions, update line items, and complete checkout. The SDK manages `session_id` internally via `localStorage` — no need to pass it around.

```ts
await duka.cart.create();
const cart = await duka.cart.get();
await duka.cart.updateProduct({ product_id: "...", quantity: 2 });
await duka.cart.complete({ payment_method: "paystack", ... });
await duka.cart.clear();   // remove all items
await duka.cart.delete();  // destroy the session
```

### Orders

List and retrieve order details for authenticated customers.

```ts
const orders = await duka.orders.list();
const order  = await duka.orders.get("order-id");
```

### Payments

Configure payment providers, initialize transactions, and verify payments.

```ts
const config       = await duka.payments.getConfig();
const payment      = await duka.payments.initialize({ email: "...", amount: 5000 });
const verification = await duka.payments.verify({ reference: "..." });
```

### Store Config

Retrieve store-level settings like currency and tax preferences.

```ts
const config = await duka.config.get();
```

### Store Info

Fetch public store details — name, email, phone, address, logo, country code, and social links.

```ts
const store = await duka.store.get();
console.log(store.name, store.logo, store.country_code);
console.log(store.twitter, store.facebook, store.instagram, store.whatsapp);
```

## Framework Agnostic

`@valebytes/topduka-node` is a plain async client with zero framework dependencies. Plug it into whatever data-fetching layer you prefer:

```ts
// React Query
import { useQuery } from "@tanstack/react-query";

const { data } = useQuery({
  queryKey: ["products"],
  queryFn: () => duka.products.list({ status: "active" }),
});
```

```ts
// SWR
import useSWR from "swr";

const { data } = useSWR("products", () =>
  duka.products.list({ status: "active" })
);
```

Works the same way with Vue Query, Solid Query, Svelte Query, or any other async pattern.

## License

MIT
