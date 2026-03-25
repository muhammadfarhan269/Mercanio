# Mercanio — Claude Code Project Brief

## What this project is
Full-stack multi-vendor e-commerce platform built as a portfolio project.
Single Next.js 16 monolith (modular architecture).
Three user roles: CUSTOMER, VENDOR, ADMIN.

## Tech stack
- Next.js 16.2.1 (App Router, TypeScript strict)
- Prisma 7 + PostgreSQL (Neon serverless)
- NextAuth v5 (JWT strategy, credentials + Google OAuth)
- Stripe (Payment Element + Connect for vendor payouts)
- Algolia (product search, index: mercanio_products)
- Zustand (cart state, persisted to localStorage)
- TanStack Query v5 (server state)
- shadcn/ui + Tailwind CSS
- Resend + React Email (transactional email)
- Uploadthing (image uploads)
- Upstash Redis (caching + rate limiting — not yet implemented)

## Design system
- Font: Geist (via next/font)
- Background: #F5F0EB (parchment)
- Primary text: #1A1410 (ink)
- Accent/CTA: #C2692A (sienna) — used on ALL primary buttons
- Secondary text: #8C7B6E (driftwood)
- Border: #E8DDD4 (sand)
- Success: #2B6B4A (forest)
- Error: #B54242 (ember)
- Card background: #FFFFFF with border-[#E8DDD4]
- Border radius: rounded-xl (12px) for cards, rounded-lg (8px) for inputs/buttons
- All prices stored as Int (cents) in database, displayed via formatPrice() from src/lib/utils/format.ts

## Project structure
src/app/(storefront)/          — shopper-facing pages
src/app/(auth)/                — login, register
src/app/dashboard/vendor/      — vendor portal (Phase 5 — BUILD THIS NEXT)
src/app/dashboard/admin/       — admin panel (Phase 6)
src/app/api/                   — API routes
src/components/storefront/     — storefront UI components
src/components/auth/           — auth form components
src/components/checkout/       — checkout components
src/components/vendor/         — vendor dashboard components (empty, build here)
src/components/admin/          — admin components (empty, build in Phase 6)
src/components/shared/         — shared across roles
src/lib/                       — utilities, db client, auth config
src/lib/queries/               — server-side DB queries
src/lib/store/                 — Zustand stores
src/lib/validations/           — Zod schemas
src/emails/                    — React Email templates
prisma/schema.prisma           — full 33-table schema
prisma/seed.ts                 — seed with 4 vendors, 15 products, 40 orders

## Key files
src/lib/db.ts                  — Prisma client singleton (use `db`)
src/lib/auth.ts                — NextAuth config (use `auth()` for session)
src/lib/auth.helpers.ts        — requireAuth(), requireVendor(), requireAdmin(), getCurrentVendor()
src/lib/stripe.ts              — Stripe client singleton (use `stripe`)
src/lib/algolia.ts             — Algolia search + admin clients
src/lib/algolia.sync.ts        — syncAllProductsToAlgolia(), syncSingleProductToAlgolia()
src/lib/constants.ts           — COLORS, CHART_COLORS, DEFAULT_COMMISSION_RATE, PRODUCTS_PER_PAGE
src/lib/utils.ts               — cn() utility
src/lib/utils/format.ts        — formatPrice(), formatCompact(), discountPercent()
src/lib/orders.ts              — generateOrderNumber()
src/lib/email.ts               — sendOrderConfirmationEmail()
src/proxy.ts                   — Next.js 16 auth proxy (replaces middleware.ts)
src/types/index.ts             — shared TypeScript types
src/types/next-auth.d.ts       — NextAuth type extensions (session.user.id, session.user.role)

## Auth patterns
// Server component — get session
const session = await auth()

// Server component — require auth or redirect
const session = await requireAuth()

// Server component — require VENDOR role
const session = await requireVendor()

// Server component — require ADMIN role
const session = await requireAdmin()

// Get current vendor record
const vendor = await getCurrentVendor()

// Client component
const { data: session } = useSession()

## Database access
Always import from @/lib/db:
import { db } from '@/lib/db'

// Example query
const vendor = await db.vendor.findUnique({
  where: { userId: session.user.id }
})

## Pricing rule — CRITICAL
All prices are stored as integers in cents/pence.
NEVER use Float for money. NEVER recalculate from live prices after order is placed.
Display using: formatPrice(amount) from @/lib/utils/format.ts
Example: 2999 = $29.99

## Completed phases
- Phase 1: Project scaffold, design system, Geist font, Tailwind config
- Phase 2: NextAuth v5, three-role auth, login/register pages, proxy.ts
- Phase 3A: Prisma schema (33 tables), seed data
- Phase 3B: Storefront homepage with real data queries
- Phase 4A: Algolia search, product catalog with filters/sort/pagination
- Phase 4B: Product detail page, image gallery, variant selector, add-to-cart
- Phase 4C: Cart page, Zustand store with localStorage persistence
- Phase 4D: Category pages, vendor pages
- Phase 4E: Checkout with Stripe Payment Element, webhook order creation,
            Resend confirmation email, success page with order polling

## What to build next — Phase 5: Vendor Dashboard
Location: src/app/dashboard/vendor/
Components: src/components/vendor/

### Phase 5 feature list (build in this order):
1. Vendor dashboard layout (sidebar navigation)
2. Dashboard overview page (stats: revenue, orders, products, avg order value)
3. Product management (list, create, edit, archive) with Uploadthing images
4. Inventory management (stock levels per variant, low-stock alerts)
5. Order management (vendor-filtered orders, fulfillment status updates)
6. Analytics page (Recharts: revenue chart, order volume, top products)
7. Store settings (store name, description, logo, banner, policies)
8. Payout history (list of payouts from Stripe)

### Vendor dashboard conventions:
- All vendor pages must call requireVendor() at the top
- Always filter data by vendor.id — never show other vendors' data
- Use getCurrentVendor() to get the vendor record
- Vendor sidebar should be a persistent layout component
- Stats cards use the metric card pattern: bg-[#F5F0EB], no border, rounded-xl
- Charts use CHART_COLORS from src/lib/constants.ts
- Tables use shadcn/ui Table component
- Forms use react-hook-form + Zod validation
- Image uploads use Uploadthing

### Demo vendor credentials:
- sarah@threadcraft.com / Vendor123! (ThreadCraft Studio)
- james@oakandstone.com / Vendor123! (Oak & Stone)
- priya@lumenjewels.com / Vendor123! (Lumen Jewels)
- marcus@inkandpage.com / Vendor123! (Ink & Page)

### Demo admin credentials:
- admin@mercanio.com / Admin123!

### Demo customer credentials:
- emma@example.com / Customer123!

## Code conventions
- All monetary values: Int (cents), never Float
- All server components: async functions, await params and searchParams
- All client components: 'use client' at top
- Imports: always use @/ alias, never relative paths from src/
- Tailwind: use design system colors directly (#C2692A not sienna-500)
- Error handling: try/catch on all API routes, return NextResponse.json with status codes
- No console.log in production code (console.error only for genuine errors)
- shadcn components live in src/components/ui/ — do not modify them
- Custom components live in src/components/{storefront|vendor|admin|shared}/

## Scripts
npm run dev          — start dev server
npm run build        — production build
npm run db:seed      — seed database
npm run db:reset     — reset and reseed
npm run db:studio    — open Prisma Studio
npm run algolia:sync — sync products to Algolia
