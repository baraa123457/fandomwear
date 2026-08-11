-- FandomWear — core schema
-- Run in order: 0001_schema.sql, 0002_rls.sql. Reproducible on a fresh
-- Supabase project. See SUPABASE_SETUP.md for how to run these.

create extension if not exists "pgcrypto"; -- for gen_random_uuid()

-- =========================================================
-- profiles — one row per Supabase Auth user
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text not null,
  avatar_url text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'App-level profile + role for each auth.users row. Role is the source of truth for admin access — never trust a client-side flag.';

-- Auto-create a profile row whenever someone signs up via Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- universes — the fandom taxonomy (anime, gaming, marvel, ...)
-- =========================================================
create table if not exists public.universes (
  id text primary key, -- slug, e.g. 'anime' — kept as text to match existing frontend routes/query params
  label text not null,
  tagline text not null default '',
  color text not null default '#7C5CFF',
  icon text not null default 'Sparkles', -- lucide-react icon name
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- categories — garment type (Oversized Tee, Hoodie, ...)
-- =========================================================
create table if not exists public.categories (
  id text primary key, -- slug
  label text not null,
  created_at timestamptz not null default now()
);

-- =========================================================
-- products
-- =========================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  material text not null default '',
  universe_id text not null references public.universes (id) on delete restrict,
  category_id text not null references public.categories (id) on delete restrict,
  price numeric(10, 2) not null check (price >= 0),
  compare_at_price numeric(10, 2) check (compare_at_price is null or compare_at_price >= 0),
  sizes text[] not null default '{}',
  colors jsonb not null default '[]', -- [{ name, hex }]
  stock integer not null default 0 check (stock >= 0),
  rating numeric(2, 1) not null default 0,
  review_count integer not null default 0,
  tags text[] not null default '{}', -- 'new' | 'bestseller' | 'sale' | 'limited'
  art_icon text not null default 'Shirt', -- lucide-react icon name, used when no image is uploaded
  image_url text, -- primary display image; kept denormalized for cheap reads (see product_images for gallery)
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_universe_id_idx on public.products (universe_id);
create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists products_created_at_idx on public.products (created_at desc);
create index if not exists products_slug_idx on public.products (slug);

-- =========================================================
-- product_images — supports multiple images per product (Storage-backed)
-- =========================================================
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_id_idx on public.product_images (product_id, sort_order);

-- =========================================================
-- orders / order_items
-- =========================================================
create table if not exists public.orders (
  id text primary key, -- e.g. 'FW-10482', matches existing order id format
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'processing' check (status in ('processing', 'shipped', 'delivered', 'cancelled')),
  subtotal numeric(10, 2) not null,
  discount numeric(10, 2) not null default 0,
  coupon_code text,
  shipping numeric(10, 2) not null default 0,
  tax numeric(10, 2) not null default 0,
  total numeric(10, 2) not null,
  payment_method text default 'card' check (payment_method in ('card', 'cod')),
  shipping_address jsonb not null, -- { fullName, line1, city, state, zip, country }
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id, created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null, -- kept even if product later deleted
  product_name text not null, -- snapshot — don't depend on current product name
  slug text not null,
  unit_price numeric(10, 2) not null, -- snapshot — don't depend on current product price
  quantity integer not null check (quantity > 0),
  size text,
  color text,
  universe_id text,
  art_icon text,
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

-- =========================================================
-- reviews — one per (user, product)
-- =========================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null,
  rating integer not null check (rating between 1 and 5),
  title text not null default '',
  body text not null default '',
  size text,
  verified boolean not null default false, -- true if the reviewer has an order containing this product
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, user_id)
);

create index if not exists reviews_product_id_idx on public.reviews (product_id, created_at desc);

-- Keep products.rating / review_count in sync whenever reviews change.
create or replace function public.recalc_product_rating()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  target_product_id uuid := coalesce(new.product_id, old.product_id);
begin
  update public.products p
  set
    review_count = (select count(*) from public.reviews r where r.product_id = target_product_id),
    rating = coalesce((select round(avg(r.rating)::numeric, 1) from public.reviews r where r.product_id = target_product_id), 0)
  where p.id = target_product_id;
  return null;
end;
$$;

drop trigger if exists on_review_change on public.reviews;
create trigger on_review_change
  after insert or update or delete on public.reviews
  for each row execute function public.recalc_product_rating();

-- =========================================================
-- coupons
-- =========================================================
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(10, 2) not null check (discount_value >= 0),
  minimum_order numeric(10, 2) not null default 0,
  active boolean not null default true,
  usage_limit integer,
  uses integer not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- =========================================================
-- wishlist_items
-- =========================================================
create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists wishlist_items_user_id_idx on public.wishlist_items (user_id);

-- =========================================================
-- updated_at helper trigger, reused by several tables
-- =========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.products;
create trigger set_updated_at before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.orders;
create trigger set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.reviews;
create trigger set_updated_at before update on public.reviews
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.universes;
create trigger set_updated_at before update on public.universes
  for each row execute function public.set_updated_at();
