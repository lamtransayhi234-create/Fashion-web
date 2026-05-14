-- ============================================================
-- StyleLoop — Initial schema (5 tables + RLS + trigger)
-- ============================================================

-- ─── Enums ─────────────────────────────────────────────────
create type user_role      as enum ('user', 'admin', 'supplier');
create type order_status   as enum ('pending', 'confirmed', 'completed', 'cancelled');
create type upload_status  as enum ('pending', 'approved', 'rejected');
create type payment_method as enum ('bank', 'momo');
create type product_status as enum ('available', 'out_of_stock');

-- ─── profiles ──────────────────────────────────────────────
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null unique,
  name         text not null,
  role         user_role not null default 'user',
  phone        text,
  address      text,
  avatar       text,
  shop_name    text,
  permissions  text[],
  created_at   timestamptz not null default now()
);

-- ─── products ──────────────────────────────────────────────
create table public.products (
  id            uuid primary key default gen_random_uuid(),
  src           text not null,
  name          text not null,
  brand_price   numeric not null,
  rental_price  numeric not null,
  status        product_status not null default 'available',
  description   text,
  category      text not null,
  type          text not null,
  sizes         text[] not null,
  color         text,
  tags          text[],
  rating        smallint check (rating in (4, 5)),
  provider_id   uuid not null references public.profiles(id),
  created_at    timestamptz not null default now()
);
create index products_provider_id_idx on public.products(provider_id);
create index products_category_idx    on public.products(category);

-- ─── product_submissions ───────────────────────────────────
create table public.product_submissions (
  id             uuid primary key default gen_random_uuid(),
  supplier_id    uuid not null references public.profiles(id),
  src            text not null,
  name           text not null,
  brand_price    numeric not null,
  rental_price   numeric not null,
  description    text,
  category       text not null,
  type           text not null,
  sizes          text[] not null,
  color          text,
  tags           text[],
  upload_status  upload_status not null default 'pending',
  reject_reason  text,
  product_id     uuid references public.products(id),
  submitted_at   timestamptz not null default now()
);
create index product_submissions_supplier_id_idx on public.product_submissions(supplier_id);
create index product_submissions_status_idx      on public.product_submissions(upload_status);

-- ─── orders ────────────────────────────────────────────────
create table public.orders (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles(id),
  provider_id           uuid not null references public.profiles(id),
  product_id            uuid not null references public.products(id),
  product_name          text not null,
  product_src           text not null,
  product_type          text not null,
  size                  text not null,
  color                 text,
  from_date             date not null,
  to_date               date not null,
  nights                integer not null,
  rental_price_per_day  numeric not null,
  total                 numeric not null,
  deposit               numeric not null,
  address               text not null,
  phone                 text not null,
  payment_method        payment_method not null,
  payment_method_label  text not null,
  note                  text,
  status                order_status not null default 'pending',
  created_at            timestamptz not null default now()
);
create index orders_user_id_idx     on public.orders(user_id);
create index orders_provider_id_idx on public.orders(provider_id);
create index orders_status_idx      on public.orders(status);

-- ─── whitelist ─────────────────────────────────────────────
create table public.whitelist (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ============================================================
-- Trigger: tự tạo profile khi auth.users insert
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id, email, name, role, phone, address, avatar, shop_name
  ) values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'user'),
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'address',
    new.raw_user_meta_data ->> 'avatar',
    new.raw_user_meta_data ->> 'shop_name'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Helper: lấy role của user hiện tại
-- ============================================================
create or replace function public.current_user_role()
returns user_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- ============================================================
-- RLS
-- ============================================================
alter table public.profiles            enable row level security;
alter table public.products            enable row level security;
alter table public.product_submissions enable row level security;
alter table public.orders              enable row level security;
alter table public.whitelist           enable row level security;

-- ─── profiles ──────────────────────────────────────────────
create policy "profiles_select_authenticated" on public.profiles
  for select to authenticated using (true);

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "profiles_delete_admin" on public.profiles
  for delete to authenticated
  using (public.current_user_role() = 'admin');

-- ─── products ──────────────────────────────────────────────
create policy "products_select_public" on public.products
  for select to anon, authenticated
  using (status = 'available' or public.current_user_role() in ('admin', 'supplier'));

create policy "products_insert_admin" on public.products
  for insert to authenticated
  with check (public.current_user_role() = 'admin');

create policy "products_update_owner_or_admin" on public.products
  for update to authenticated
  using (provider_id = auth.uid() or public.current_user_role() = 'admin')
  with check (provider_id = auth.uid() or public.current_user_role() = 'admin');

create policy "products_delete_admin" on public.products
  for delete to authenticated
  using (public.current_user_role() = 'admin');

-- ─── product_submissions ───────────────────────────────────
create policy "submissions_select_own_or_admin" on public.product_submissions
  for select to authenticated
  using (supplier_id = auth.uid() or public.current_user_role() = 'admin')
;

create policy "submissions_insert_own" on public.product_submissions
  for insert to authenticated
  with check (supplier_id = auth.uid() and public.current_user_role() = 'supplier');

create policy "submissions_update_pending_or_admin" on public.product_submissions
  for update to authenticated
  using (
    (supplier_id = auth.uid() and upload_status = 'pending')
    or public.current_user_role() = 'admin'
  );

create policy "submissions_delete_admin" on public.product_submissions
  for delete to authenticated
  using (public.current_user_role() = 'admin');

-- ─── orders ────────────────────────────────────────────────
create policy "orders_select_party_or_admin" on public.orders
  for select to authenticated
  using (
    user_id = auth.uid()
    or provider_id = auth.uid()
    or public.current_user_role() = 'admin'
  );

create policy "orders_insert_self" on public.orders
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "orders_update_provider_or_admin" on public.orders
  for update to authenticated
  using (provider_id = auth.uid() or public.current_user_role() = 'admin');

create policy "orders_delete_admin" on public.orders
  for delete to authenticated
  using (public.current_user_role() = 'admin');

-- ─── whitelist ─────────────────────────────────────────────
create policy "whitelist_select_own" on public.whitelist
  for select to authenticated using (user_id = auth.uid());

create policy "whitelist_insert_own" on public.whitelist
  for insert to authenticated with check (user_id = auth.uid());

create policy "whitelist_delete_own" on public.whitelist
  for delete to authenticated using (user_id = auth.uid());
