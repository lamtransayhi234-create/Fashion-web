-- ============================================================
-- Cho phép xoá product mà không bị FK block.
-- Strategy:
--  - product_submissions.product_id  → SET NULL  (giữ submission cho audit)
--  - orders.product_id               → SET NULL  (giữ order — snapshot fields đã lưu name/src/price)
--  - whitelist.product_id            → CASCADE   (đã set từ migration 0001, không cần đổi)
-- ============================================================

-- product_submissions
alter table public.product_submissions
  drop constraint if exists product_submissions_product_id_fkey;

alter table public.product_submissions
  add constraint product_submissions_product_id_fkey
  foreign key (product_id) references public.products(id) on delete set null;

-- orders — phải bỏ NOT NULL constraint trước khi set NULL on delete
alter table public.orders
  alter column product_id drop not null;

alter table public.orders
  drop constraint if exists orders_product_id_fkey;

alter table public.orders
  add constraint orders_product_id_fkey
  foreign key (product_id) references public.products(id) on delete set null;
