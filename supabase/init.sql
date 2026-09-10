/* ═══════════════════════════════════════════════════════════
   BARAMASI — Supabase setup (run ONCE in the SQL editor).

   Paste this whole file into:
     Supabase dashboard → SQL editor → New query → Run

   Then paste supabase/seed.sql to load the 33 bundled products.

   ══ What this creates ══
   1. public.products — the live product catalogue (public read,
      admin write via Row Level Security).
   2. product-images — a public storage bucket for product photos.

   ══ Security model ══
   · Anyone (anon) can SELECT products and read images.
   · Only an authenticated user can INSERT / UPDATE / DELETE rows
     or upload images — so sign in on /admin and the dashboard
     simply works, no server code and no secret keys in the browser.

   ══ After running ══
   · Create the admin login (one of):
       a. open /admin/login.html on the live site and use "Create the
          admin account", then confirm via the email Supabase sends, or
       b. Dashboard → Authentication → Users → Add user → fill email +
          password and tick "Auto Confirm User".
   · Recommended: turn off self sign-up so no one else can register:
       Dashboard → Authentication → Providers → Email →
       "Allow new users to sign up" → OFF.
   ═══════════════════════════════════════════════════════════════ */

-- 1 ── products table ───────────────────────────────────────────
create table if not exists public.products (
  id              text primary key,                 -- URL-safe slug (e.g. 'hoodie-01')
  type            text not null default 'hoodies',  -- category key (see js/products.js TYPES)
  colour          text not null default 'neutrals',
  name_en         text not null,
  name_hi         text,
  desc_en         text,
  desc_hi         text,
  fabric_en       text,
  fabric_hi       text,
  craft_en        text,
  craft_hi        text,
  price           numeric(10, 2) not null default 0,
  price_confirmed boolean not null default false,
  stock           integer,                          -- null = unknown, else units in hand
  image_url       text,
  card_url        text,
  best_seller     boolean not null default false,
  new_arrival     boolean not null default true,
  availability    text not null default 'in-store',
  sort_order      integer,                          -- catalogue order (nulls list last)
  created_at      timestamptz not null default now()
);

alter table public.products enable row level security;

-- 2 ── product policies (safe to re-run) ──────────────────────────
drop policy if exists "products are publicly readable" on public.products;
create policy "products are publicly readable"
  on public.products for select
  using (true);

drop policy if exists "admin can insert products" on public.products;
create policy "admin can insert products"
  on public.products for insert
  with check (auth.uid() is not null);

drop policy if exists "admin can update products" on public.products;
create policy "admin can update products"
  on public.products for update
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "admin can delete products" on public.products;
create policy "admin can delete products"
  on public.products for delete
  using (auth.uid() is not null);

-- 3 ── product-images bucket ────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- belt: a bucket once flipped to private silently breaks every storefront
-- image (uploads still succeed, but nothing is publicly visible) — force it
-- back to public on every run of this file.
update storage.buckets set public = true where id = 'product-images';

drop policy if exists "product images are publicly readable" on storage.objects;
create policy "product images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "admin can upload product images" on storage.objects;
create policy "admin can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.uid() is not null);

drop policy if exists "admin can update product images" on storage.objects;
create policy "admin can update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and auth.uid() is not null);

drop policy if exists "admin can delete product images" on storage.objects;
create policy "admin can delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and auth.uid() is not null);
