-- ============================================================
-- StyleLoop — Storage bucket: product-images
-- ============================================================
-- Public read (ai cũng xem được ảnh sản phẩm), authenticated upload,
-- owner-only delete. Path convention: {user_id}/{uuid}.{ext}
-- ============================================================

insert into storage.buckets (id, name, public)
  values ('product-images', 'product-images', true)
  on conflict (id) do nothing;

-- Public read
create policy "product_images_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'product-images');

-- Authenticated upload — chỉ cho upload vào folder = user.id của mình
create policy "product_images_authenticated_upload"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Owner delete — chỉ xoá file trong folder của mình
create policy "product_images_owner_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
