# Mercanio

**The modern multi-vendor marketplace platform**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)

[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe&logoColor=white)](https://stripe.com/)
[![Algolia](https://img.shields.io/badge/Algolia-Search-5468FF?logo=algolia&logoColor=white)](https://www.algolia.com/)
[![NextAuth.js](https://img.shields.io/badge/NextAuth-v5-black?logo=nextdotjs&logoColor=white)](https://authjs.dev/)

[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Mercanio is a **full-stack multi-vendor e-commerce monolith**: shoppers browse and buy from many independent stores, vendors operate their own dashboards, and admins govern the platform. The hard parts—**role-based access**, **per-line vendor economics**, **Stripe Payment Element checkout**, **webhook-only order persistence**, **Algolia-backed product indexing**, and a **33-table Prisma schema** with integer money and snapshots—are implemented end to end so the repo reads as a serious portfolio piece, not a tutorial storefront.

## Live Demo

> 🚀 **[mercanio.vercel.app](https://mercanio.vercel.app)** — deployed on Vercel

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mercanio.com | Admin123! |
| Vendor | sarah@threadcraft.com | Vendor123! |
| Customer | emma@example.com | Customer123! |

Use test card **`4242 4242 4242 4242`** with any future expiry and any CVC to complete a purchase.

## Features

### Shopper experience

- Full product catalog with **filters, sorting, and pagination** (PostgreSQL / Prisma)
- **`mercanio_products` Algolia index** with `npm run algolia:sync`, automatic reindex on vendor product changes, and a configured **search client** ready for instant search UI
- **Product detail** pages with image gallery and variant selection
- **Zustand cart** persisted to **localStorage** (guest and signed-in flows)
- **Checkout**: shipping and contact capture → **Stripe Payment Element** (cards; **Apple Pay / Google Pay** where enabled in the Element)
- **Order confirmation** email via **Resend** + **React Email** after **`payment_intent.succeeded`**

### Vendor dashboard

- **Isolated vendor workspace** (`/dashboard/vendor`): overview, products (create/edit with **Uploadthing** images), inventory with low-stock callouts, orders with per-line fulfilment, **Recharts** analytics, store settings (logo/banner upload), **payout history**
- **Prisma schema** models **Stripe Connect** readiness (`stripeAccountId`, onboarding and capability flags); **admin** can inspect connection state—commission and **per-line `vendorPayout`** are computed at order time in the webhook

### Admin panel

- **Platform overview**: GMV-style aggregates, orders, vendors, customers
- **Vendor lifecycle**: list, detail, approval/suspension, commission visibility
- **Orders**: full oversight; **full refund** path calling **Stripe Refunds API** then updating the database
- **Users** with role filters
- **Discounts** CRUD
- **Content**: homepage **banners** and **platform settings** (e.g. hero copy)

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router, React Server Components) |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL via Neon (serverless) |
| ORM | Prisma 7 (driver adapter + `pg`) |
| Auth | NextAuth v5 (JWT, credentials + Google OAuth) |
| Payments | Stripe (Payment Element; Connect fields & payout model in schema) |
| Search | Algolia (`mercanio_products` index, sync pipeline, `algoliasearch` clients) |
| Email | Resend + React Email |
| File uploads | Uploadthing |
| UI | shadcn/ui + Tailwind CSS |
| State | Zustand (cart, `localStorage` persistence) |
| Server state | TanStack Query v5 (dependency; composable for client dashboards) |
| Charts | Recharts |
| Deployment | Vercel-ready; `next/image`; auth via **`src/proxy.ts`** (Next.js 16 convention) |

## Architecture

Mercanio is a **modular monolith**: one Next.js app, clear route groups for storefront, auth, vendor, and admin, and shared `src/lib` for auth, DB, Stripe, Algolia, and email. That keeps **one deployable unit** and **one schema** while the domain (multi-vendor orders, commissions, roles) stays explicit—appropriate for a portfolio and for most products before true service extraction.

- **CUSTOMER** — storefront, cart, checkout, post-purchase flows.
- **VENDOR** — data scoped to `getCurrentVendor()`; APIs and pages filter by `vendorId`.
- **ADMIN** — platform-wide reads/writes; `requireAdmin()` on every admin route.

The **multi-vendor model** is enforced in data, not only in UI: each **`OrderItem`** stores **`vendorId`**, **`vendorPayout`**, **`commissionAmount`**, and a locked **`commissionRate`** so totals never depend on today’s vendor settings. **All prices and order money fields are integers (cents)**. Checkout creates a **Stripe PaymentIntent** server-side; **`payment_intent.succeeded`** runs a **Stripe webhook** that **creates the order**, decrements stock, and sends email—**the browser never authoritatively creates paid orders**.

## Local Development

**Prerequisites:** Node.js 18+, PostgreSQL (or a Neon project), [Stripe CLI](https://stripe.com/docs/stripe-cli), Git.

1. **Clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/mercanio.git
   cd mercanio
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**  
   Copy `.env.local.example` to `.env.local` and fill in:

   - `DATABASE_URL` and `DIRECT_URL` (Neon pooler + direct host, or local Postgres)
   - `AUTH_SECRET` (generate with: `openssl rand -base64 32`)
   - `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` (test keys)
   - `STRIPE_WEBHOOK_SECRET` (from: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`)
   - `RESEND_API_KEY`
   - `NEXT_PUBLIC_ALGOLIA_APP_ID`, `NEXT_PUBLIC_ALGOLIA_SEARCH_KEY`, `ALGOLIA_ADMIN_KEY`
   - `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (same publishable key as Stripe test mode, exposed to the browser)

4. **Push database schema**

   ```bash
   npx prisma db push
   ```

5. **Seed the database**

   ```bash
   npm run db:seed
   ```

6. **Sync products to Algolia**

   ```bash
   npm run algolia:sync
   ```

7. **Start the development server**

   ```bash
   npm run dev
   ```

8. **(Optional)** Forward Stripe webhooks in a separate terminal:

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

### Available scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:seed` | Seed database with demo data |
| `npm run db:reset` | Reset and reseed database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run algolia:sync` | Sync products to Algolia index |

## Project Structure

```text
mercanio/
├── prisma/
│   ├── schema.prisma        # 33-table multi-vendor schema
│   └── seed.ts              # Demo data (4 vendors, 15 products, 40 orders)
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login, register pages
│   │   ├── (storefront)/    # Public marketplace pages
│   │   ├── dashboard/
│   │   │   ├── admin/       # Admin panel (overview, orders, vendors, users, discounts, content, settings)
│   │   │   └── vendor/      # Vendor portal (overview, products, inventory, orders, analytics, settings, payouts)
│   │   └── api/             # REST API routes + webhooks (Stripe, vendor, admin, checkout, Uploadthing)
│   ├── components/
│   │   ├── admin/           # Admin UI components
│   │   ├── checkout/        # Checkout flow components
│   │   ├── storefront/      # Shopper-facing components
│   │   ├── ui/              # shadcn/ui base components
│   │   └── vendor/          # Vendor dashboard components
│   ├── lib/
│   │   ├── auth.ts          # NextAuth configuration
│   │   ├── db.ts            # Prisma client singleton (+ pg pool tuning)
│   │   ├── stripe.ts        # Stripe server SDK
│   │   ├── algolia.ts       # Algolia search + admin clients
│   │   └── email.ts         # Resend + order confirmation
│   └── emails/              # React Email templates
├── proxy.ts                 # Next.js 16 auth proxy (session + route protection)
└── CLAUDE.md                # AI assistant project brief (optional local copy)
```

## Database Schema

The schema contains **33 tables** modeling users, vendors, catalog, carts, orders, payments, payouts, reviews, discounts, banners, notifications, and audit-style history.

- **Variant-level pricing** — sellable price lives on **`ProductVariant`**, not on **`Product`** alone.
- **Integer money** — amounts stored as **cents** (Int) to avoid floating-point rounding errors.
- **Soft deletes** — e.g. **`deletedAt`** on products and vendors instead of destructive deletes for live commerce data.
- **Denormalised vendor payout** — **`OrderItem`** stores **`commissionRate`**, **`commissionAmount`**, and **`vendorPayout`** at purchase time.
- **Address snapshots** — orders persist **`shippingSnapshot`** / **`billingSnapshot`** JSON independent of the user’s saved addresses.
- **Append-only order status history** — **`OrderStatusHistory`** records transitions with optional notes.

## Key Technical Decisions

**Modular monolith over microservices** — A single Next.js application owns HTTP, rendering, background-capable API routes, and one PostgreSQL database. That minimizes operational overhead and keeps transactions and Prisma types coherent—ideal for demonstrating full-stack ownership without distributed-systems noise.

**Stripe webhook for order creation** — Paid orders are inserted only after **`payment_intent.succeeded`**, using PaymentIntent metadata prepared server-side during checkout. That closes the classic gap where a client could claim payment without settlement, and it keeps stock decrements and emails aligned with real money movement.

**Algolia alongside PostgreSQL** — The browsable catalog uses **Prisma** for filters, sort, and pagination while a dedicated **Algolia index** stays in sync for fast, relevance-ranked search and future instant-search UX. Sync is scriptable and hooked into vendor product APIs so the index does not drift silently.

**Zustand for the cart** — Cart lines are client-first with **`persist`** to **`localStorage`**, so guests keep a cart across tabs without round-trips. Checkout still **re-validates** variant price and stock on the server when creating the PaymentIntent.

**Integer cents for money** — Every monetary field that represents a charge, refund, commission, or payout is an **integer**. Display code uses **`formatPrice`** from `src/lib/utils/format.ts`. This matches how Stripe represents amounts and avoids a class of bugs that show up only in production ledgers.

## License

This project is licensed under the [MIT License](LICENSE).

---

> *Built as a portfolio project demonstrating full-stack engineering with production-grade architecture.*
