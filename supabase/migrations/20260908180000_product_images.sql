-- SOLO este archivo. No vuelvas a correr 20260908120000_init.sql
-- (ese ya se ejecutó: por eso aparece "plan_tier already exists").

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product_images_public_read" on storage.objects;
drop policy if exists "product_images_auth_insert" on storage.objects;
drop policy if exists "product_images_auth_update" on storage.objects;

create policy "product_images_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "product_images_auth_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "product_images_auth_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and split_part(name, '/', 1) = auth.uid()::text
  );
