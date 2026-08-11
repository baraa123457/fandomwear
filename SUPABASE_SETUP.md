# Supabase setup — FandomWear

Status: **in progress**. This document tracks what's been migrated to
Supabase so far and what's still on localStorage/seed data. See the
"Migration status" section at the bottom for the current state.

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → New Project.
2. Pick a name, a database password (save it somewhere — you won't need it
   day-to-day, but you'll want it if you ever connect directly with `psql`),
   and a region close to your users.
3. Wait for provisioning (~2 minutes).

## 2. Get your API keys

In the Supabase dashboard: **Project Settings → API**.

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` — treat this like a
  root password. It bypasses Row Level Security completely.

## 3. Configure `.env.local`

```bash
cp .env.example .env.local
```

Fill in the three values from step 2. `.env.local` is already gitignored —
never commit it, and never commit the service role key anywhere.

## 4. Run the database migrations

The schema lives in `supabase/migrations/`, in order:

1. `0001_schema.sql` — tables, indexes, triggers
2. `0002_rls.sql` — Row Level Security policies
3. `0003_functions.sql` — `place_order` and `validate_coupon` RPCs

**Easiest path (no CLI needed):** open **SQL Editor** in the Supabase
dashboard, paste the contents of each file in order, and run it.

**Or with the Supabase CLI**, if you have a project linked:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Both approaches are safe to re-run — the SQL uses `create table if not
exists`, `create or replace function`, and `drop ... if exists` before
recreating triggers/policies, so running it twice won't error or duplicate
anything (though re-running `0002`/`0003` against a project that already has
data is fine; they only touch policies/functions, not rows).

## 5. Seed initial data

This pushes your existing `src/lib/data/products.ts`, `universes.ts`, and
`admin.ts` (coupons) into the database, so the storefront isn't empty.

```bash
npm install
npm run db:seed
```

This is idempotent (upserts on `slug` / `id` / `code`), so re-running it
after editing the seed source files just updates existing rows instead of
duplicating them.

**Not seeded from static data, by design:**
- **Reviews** — the old `reviews.ts` procedurally *generated* fake reviews
  on the fly; there's no fixed list to import. Reviews are empty until real
  customers leave them.
- **Customers** — `admin.ts`'s `customers` array was fake. Real customers
  come from people signing up via Supabase Auth.
- **Orders** — same reasoning; orders come from real checkouts.

## 6. Create your first admin account

There is intentionally no "make me admin" button anywhere in the app (a
public one would be a critical security hole). To grant admin access:

1. Sign up for a normal account through the site's `/account/register`
   page (or have Supabase Auth create one directly in the dashboard under
   **Authentication → Users → Add user**).
2. In the Supabase dashboard, open **SQL Editor** and run:

   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```

3. Sign in at `/admin/login` with that account's email/password.

If your project has **Confirm email** enabled (default), the account must
confirm its email before it can sign in. For local development you can
turn this off under **Authentication → Providers → Email → Confirm email**,
or just confirm the user manually in the dashboard.

## 7. Configure Storage (for product images — coming in a later pass)

Not wired up yet — product photo uploads still go through the old
data-URL/localStorage path (Phase 13 in the original request). When that
lands, you'll need to create a `product-images` bucket:
**Storage → New bucket → name it `product-images`**, and the migration
will include the matching Storage RLS policies.

## 8. Deploying to Vercel

Add these environment variables in **Vercel → Project Settings →
Environment Variables**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — only if you deploy any server-only route
  that needs it (the seed script itself is a local dev tool, not part of
  the deployed app). Mark it as a "sensitive"/server-only variable, never
  exposed to the client bundle.

`npm run build` and `npm run db:seed` are separate steps — seeding is a
one-time (or occasional) operation, not part of the build.

---

## Migration status

Legend: ✅ done · 🚧 not yet migrated (still localStorage/static seed data)

| Area | Status | Notes |
|---|---|---|
| Supabase clients (browser/server/middleware) | ✅ | `src/lib/supabase/*` |
| Database schema + RLS + RPCs | ✅ | `supabase/migrations/*.sql` |
| Seed script | ✅ | `supabase/seed.ts`, run with `npm run db:seed` |
| Customer auth (sign up / in / out / reset) | ✅ | `src/context/auth-context.tsx` |
| Admin auth (role-based, server-enforced) | ✅ | `src/context/admin-auth-context.tsx` + `src/middleware.ts` |
| Products (storefront read) | ✅ | `CatalogContext` reads from Supabase; `/product/[slug]` fetches server-side per request (no stale static build) |
| Admin product CRUD | ✅ | including CSV import/export and reset-to-seed, all writing through Supabase |
| Inventory / stock | ✅ | stock is a single column on `products`, no separate conflicting copy |
| Orders / checkout | ✅ | `place_order` RPC — server computes price/stock, never trusts the browser; checkout now requires sign-in (orders are tied to a real account) |
| Wishlist | ✅ | `wishlist_items`, scoped to the signed-in account, optimistic UI with rollback on failure |
| Reviews | ✅ | real `reviews` table + a "Write a review" form (didn't exist before — needed for the real flow to be possible at all); one review per user per product, rating auto-recalculated via DB trigger |
| Coupons | ✅ | admin CRUD on the real `coupons` table; validation happens server-side via `validate_coupon` RPC |
| Customers (admin page) | ✅ | real `profiles` + aggregated `orders`, no passwords ever exposed |
| Admin dashboard analytics | ✅ | revenue/orders/customers/sales-by-universe computed from real orders, not canned numbers |
| Product image Storage | ✅ | uploads go to the `product-images` Storage bucket (public read, admin-only write) |
| CSV export | ✅ | reads live `products` from context, unaffected by the migration |
| Saved addresses (account page) | 🚧 | still browser-only localStorage — not in the original table list; a reasonable candidate for a future `addresses` table but out of scope for this pass |

Everything above is implemented in code. What's still **required from you** before any of it is live: creating the Supabase project, running the 4 migration files, and seeding — see the Setup steps above. Nothing here was faked or mocked; it's all real Supabase reads/writes waiting on real credentials.

### Known behavior changes from the old demo version

- **Checkout now requires an account.** Orders are tied to `auth.uid()` (both by the schema and by RLS), so the old "guest checkout with just an email" flow no longer works — the checkout page shows a sign-in/create-account prompt instead. The cart itself is unaffected and still works for guests.
- **`product_images` exists but isn't populated with multiple photos yet.** The admin form still uploads one photo per product (now to real Storage instead of a data URL) and it's written to `products.image_url`. The table is there and ready for an actual multi-image gallery whenever that UI gets built — right now the product gallery still simulates extra angles from the single photo, exactly as before.
- **Reviews needed a form that didn't exist before.** There was previously no way to submit a review at all (only fake generated ones were displayed) — Phase 12 required a real submit-to-Supabase flow, so a minimal "Write a review" form was added to the product page's Reviews tab. Everything else about that tab's layout is unchanged.
