/* ═══════════════════════════════════════════════════════════
   BARAMASI — one-click fix for invisible product photos.

   Symptom: photos upload from /admin without an error, but they
   don't show on the storefront (broken-image icons instead).

   Usual cause: the `product-images` storage bucket is private
   (e.g. it was created by hand in the dashboard, which defaults
   new buckets to private). Uploads succeed because the admin is
   signed in — but anonymous store visitors can't read the files.

   Fix: paste this whole file into
     Supabase dashboard → SQL editor → New query → Run
   Safe to run any number of times; it changes nothing else.
   ═══════════════════════════════════════════════════════════════ */

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

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
