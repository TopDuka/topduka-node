# topduka-node

Node.js SDK for TopDuka storefront APIs.

## Installation

```bash
npm install topduka-node
```

## Usage

### Create a client

```ts
import { createClient } from "topduka-node";

const duka = createClient({
  baseURL: "http://localhost:8080",
  apiKey: "your-api-key",
});
```

### Products

```ts
const products = await duka.products.list({ status: "active" });
const popular = await duka.products.popular();
const discounted = await duka.products.discounted({ min_discount: 10 });
const bestSelling = await duka.products.bestSelling();
```

### Categories

```ts
const categories = await duka.categories.list();
```

### Banners

```ts
const banners = await duka.banners.list({ status: "active" });
```

### Cart

```ts
const { session_id } = await duka.cart.create();
const cart = await duka.cart.get(session_id);
await duka.cart.updateProduct({ session_id, product_id: "...", quantity: 2 });
await duka.cart.complete({ session_id, payment_method: "paystack", ... });
```

### Orders

```ts
const orders = await duka.orders.list();
const order = await duka.orders.get("order-id");
```

### Payments

```ts
const config = await duka.payments.getConfig();
const payment = await duka.payments.initialize({ email: "...", amount: 5000 });
const verification = await duka.payments.verify({ reference: "..." });
```

### Store Config

```ts
const config = await duka.config.get();
```

## Bring your own hooks

The SDK is framework-agnostic. Use it with any data-fetching library:

```ts
// React Query
import { useQuery } from "@tanstack/react-query";

const { data } = useQuery({
  queryKey: ["products"],
  queryFn: () => duka.products.list({ status: "active" }),
});

// SWR
import useSWR from "swr";

const { data } = useSWR("products", () => duka.products.list({ status: "active" }));

// Vue Query, Solid Query, etc. — same pattern
```
# topduka-node
