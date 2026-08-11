# FandomWear

Premium oversized fandom tees — Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, lucide-react.

## Status: Complete storefront

All pages from the brief are implemented and working end to end:

- **Home** — hero, universe marquee, collections grid, featured/new/best-seller rails, newsletter
- **Shop** (`/shop`) — filters (universe, category, price, size, color, stock), search, sort, pagination, all URL-synced
- **Product** (`/product/[slug]`) — zoom gallery, 360° preview, size guide, tabs, reviews, related + recently viewed, JSON-LD
- **Cart** — slide-over drawer *and* a full page at `/cart`, quantity controls, free-shipping progress, coupon field
- **Wishlist** (`/wishlist`) — public, no login required (matches how the heart-toggle itself works), "add all to cart"
- **Checkout** (`/checkout`) — shipping + mock payment, order summary, places a real order into order history
- **Account** (`/account/...`) — mock login/register/forgot-password, guarded dashboard with profile/orders/addresses
- **Admin** (`/admin/...`) — analytics charts, products/orders/customers/discounts/inventory, all with working in-session CRUD

## What's mocked (by design, per the brief)

- **Auth**: `AuthProvider` stores a session in `localStorage` — no real backend. Swap in NextAuth/your API when ready.
- **Payment**: checkout simulates a delay and never contacts a real payment provider.
- **Admin data**: orders/customers/discounts are generated mock datasets; edits persist only for the browser session (not saved to a database, since there isn't one).
- **Reviews**: deterministically generated per product so they stay consistent across reloads, not user-submitted.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. The build requires internet access on first run to fetch Google Fonts (Unbounded, Inter, JetBrains Mono) — this is normal Next.js behavior and will work automatically on any machine with a network connection.

To build for production:

```bash
npm run build
npm run start
```

## Project structure

```
src/
  app/
    layout.tsx        Root layout — fonts, metadata, providers
    page.tsx           Home page (assembles all sections below)
    globals.css         Design tokens (Tailwind v4 @theme block)
  components/
    layout/            Navbar, Footer
    home/               Hero, Marquee, Collections, Featured/NewArrivals/BestSellers, Newsletter
    shared/             ProductCard, TeeArt (placeholder art), CartDrawer
    ui/                  Button (shadcn-style, cva variants)
  context/
    cart-context.tsx    Cart state (add/remove/qty), persisted to localStorage
    wishlist-context.tsx Wishlist state, persisted to localStorage
  lib/
    data/products.ts    30 demo products
    data/universes.ts   7 universe definitions incl. per-universe accent color
    types.ts, utils.ts, icon-map.ts
```

## Design tokens

- **Colors**: void `#090909`, surface `#131316`, ink `#F5F5F2`, accent-purple `#7C5CFF`, accent-cyan `#22D3EE`, accent-red `#FF3B4E`, plus one accent per universe (Marvel red, DC blue, Potter gold, Anime purple, Gaming cyan, Fantasy green, Movies amber)
- **Type**: Unbounded (display/headlines), Inter (body/UI), JetBrains Mono (prices, labels)
- All tokens live in `src/app/globals.css` under the Tailwind v4 `@theme` block — change a value there and it propagates everywhere.

## What's next (say the word and I'll continue)

Everything from the original brief is built. Natural next steps if you want to keep going: real backend/database, real payment provider (Stripe), real auth, product image uploads, and E2E tests.
