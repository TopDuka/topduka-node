<div align="center">

# topduka-node

**The official Node.js SDK for the TopDuka Storefront API**

Build custom storefronts, integrate product catalogs, manage carts, and process payments — all with a clean, type-safe developer experience.

[![npm version](https://img.shields.io/npm/v/topduka-node)](https://www.npmjs.com/package/topduka-node)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

</div>

---

## What is TopDuka?

TopDuka is a modern e-commerce platform that gives merchants everything they need to sell online — from product management and storefront hosting to payments and order fulfillment. This SDK lets developers interact with the TopDuka Storefront API to build headless storefronts, mobile apps, and custom integrations.

## Getting Started

### Installation

```bash
npm install topduka-node
```

### Initialize the Client

```ts
import { createClient } from "topduka-node";

const duka = createClient({
  baseURL: "https://api.topduka.com",
  apiKey: "your-api-key",
});
```

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

Create sessions, update line items, and complete checkout.

```ts
const { session_id } = await duka.cart.create();
const cart = await duka.cart.get(session_id);
await duka.cart.updateProduct({ session_id, product_id: "...", quantity: 2 });
await duka.cart.complete({ session_id, payment_method: "paystack", ... });
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

Retrieve store-level settings like currency, name, and theme preferences.

```ts
const config = await duka.config.get();
```

## Framework Agnostic

`topduka-node` is a plain async client with zero framework dependencies. Plug it into whatever data-fetching layer you prefer:

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
