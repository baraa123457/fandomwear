-- FandomWear — Row Level Security
-- Run after 0001_schema.sql.

-- Helper: is the current request's user an admin? SECURITY DEFINER so it
-- can read profiles without itself being blocked by the profiles RLS
-- policy it's used inside of (avoids infinite recursion).
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- =========================================================
-- profiles
-- =========================================================
alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: admins read all" on public.profiles
  for select using (public.is_admin());

create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    -- customers can edit their own name/avatar, but never their own role
    and role = (select role from public.profiles where id = auth.uid())
  );

create policy "profiles: admins update any" on public.profiles
  for update using (public.is_admin());

-- No insert policy: rows are created only by the handle_new_user() trigger
-- (SECURITY DEFINER), so users can never insert an arbitrary profiles row
-- (e.g. to grant themselves admin) directly.

-- =========================================================
-- universes / categories — public catalog data
-- =========================================================
alter table public.universes enable row level security;
alter table public.categories enable row level security;

create policy "universes: public read" on public.universes for select using (true);
create policy "universes: admins write" on public.universes for all using (public.is_admin()) with check (public.is_admin());

create policy "categories: public read" on public.categories for select using (true);
create policy "categories: admins write" on public.categories for all using (public.is_admin()) with check (public.is_admin());

-- =========================================================
-- products / product_images — public catalog data
-- =========================================================
alter table public.products enable row level security;
alter table public.product_images enable row level security;

create policy "products: public read" on public.products for select using (true);
create policy "products: admins write" on public.products for all using (public.is_admin()) with check (public.is_admin());

create policy "product_images: public read" on public.product_images for select using (true);
create policy "product_images: admins write" on public.product_images for all using (public.is_admin()) with check (public.is_admin());

-- =========================================================
-- orders / order_items
-- =========================================================
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "orders: read own" on public.orders for select using (auth.uid() = user_id);
create policy "orders: admins read all" on public.orders for select using (public.is_admin());
create policy "orders: create own" on public.orders for insert with check (auth.uid() = user_id);
create policy "orders: admins update any" on public.orders for update using (public.is_admin());

-- order_items has no user_id of its own — authorize via the parent order.
create policy "order_items: read via own order" on public.order_items
  for select using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "order_items: admins read all" on public.order_items for select using (public.is_admin());
create policy "order_items: create via own order" on public.order_items
  for insert with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

-- =========================================================
-- reviews
-- =========================================================
alter table public.reviews enable row level security;

create policy "reviews: public read" on public.reviews for select using (true);
create policy "reviews: create own" on public.reviews for insert with check (auth.uid() = user_id);
create policy "reviews: update own" on public.reviews for update using (auth.uid() = user_id);
create policy "reviews: delete own" on public.reviews for delete using (auth.uid() = user_id);
create policy "reviews: admins manage all" on public.reviews for all using (public.is_admin()) with check (public.is_admin());

-- =========================================================
-- coupons — validation reads happen through a SECURITY DEFINER RPC
-- (see 0003_functions.sql) rather than direct table reads, so customers
-- never see the full coupon list; only admins can browse the table.
-- =========================================================
alter table public.coupons enable row level security;

create policy "coupons: admins manage all" on public.coupons for all using (public.is_admin()) with check (public.is_admin());

-- =========================================================
-- wishlist_items
-- =========================================================
alter table public.wishlist_items enable row level security;

create policy "wishlist: read own" on public.wishlist_items for select using (auth.uid() = user_id);
create policy "wishlist: create own" on public.wishlist_items for insert with check (auth.uid() = user_id);
create policy "wishlist: delete own" on public.wishlist_items for delete using (auth.uid() = user_id);
