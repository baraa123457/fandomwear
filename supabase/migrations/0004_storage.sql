-- FandomWear — Storage bucket for product images
-- Run after 0001-0003. Creates a public-read bucket (product photos are
-- public catalog data, same as the products table) with write access
-- restricted to admins.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product-images: public read"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "product-images: admins upload"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "product-images: admins update"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin());

create policy "product-images: admins delete"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());
