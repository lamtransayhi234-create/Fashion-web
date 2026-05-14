-- ============================================================
-- Cho phép xoá user / supplier từ Supabase Auth mà không bị FK block.
--
-- Chain khi xoá auth.users:
--   auth.users      → CASCADE      profiles  (đã có từ 0001)
--   profiles        → các FK dưới
--
-- profiles → ...
--   products.provider_id              → CASCADE   (supplier đóng cửa → products xoá theo)
--   product_submissions.supplier_id   → CASCADE   (submission của supplier xoá theo)
--   orders.user_id                    → CASCADE   (user xoá → orders mình đặt cũng xoá)
--   orders.provider_id                → SET NULL  (preserve order của buyer khác; snapshot fields giữ display)
--   whitelist.user_id                 → CASCADE   (đã có từ 0001)
-- ============================================================

-- products.provider_id → CASCADE
alter table public.products
  drop constraint if exists products_provider_id_fkey;
alter table public.products
  add constraint products_provider_id_fkey
  foreign key (provider_id) references public.profiles(id) on delete cascade;

-- product_submissions.supplier_id → CASCADE
alter table public.product_submissions
  drop constraint if exists product_submissions_supplier_id_fkey;
alter table public.product_submissions
  add constraint product_submissions_supplier_id_fkey
  foreign key (supplier_id) references public.profiles(id) on delete cascade;

-- orders.user_id → CASCADE
alter table public.orders
  drop constraint if exists orders_user_id_fkey;
alter table public.orders
  add constraint orders_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;

-- orders.provider_id → SET NULL (cần bỏ NOT NULL trước)
alter table public.orders
  alter column provider_id drop not null;
alter table public.orders
  drop constraint if exists orders_provider_id_fkey;
alter table public.orders
  add constraint orders_provider_id_fkey
  foreign key (provider_id) references public.profiles(id) on delete set null;
