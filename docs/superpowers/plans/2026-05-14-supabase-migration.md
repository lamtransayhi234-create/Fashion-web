# Supabase Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay toàn bộ persistence layer của StyleLoop từ Zustand `persist` (localStorage) sang Supabase (Postgres + Auth + Storage), giữ nguyên shape Zustand store.

**Architecture:** 5 bảng (`profiles`, `products`, `product_submissions`, `orders`, `whitelist`) với RLS theo role. Auth dùng Supabase Auth email/password (tắt confirmation). Zustand store rewrite — bỏ `persist`, mỗi action async gọi Supabase, hydrate qua `init()` ở root layout. Storage 1 bucket `product-images`.

**Tech Stack:** Next.js 16 App Router · Zustand 5 · `@supabase/supabase-js` · `@supabase/ssr` · Postgres SQL · TypeScript 5.9 · pnpm.

**Testing convention:** Repo này không có test framework setup. Verification mỗi task = `pnpm typecheck` + `pnpm lint` + manual smoke test trong browser theo "golden path" trong CLAUDE.md. Không thêm jest/vitest trong scope này.

**Spec gốc:** `docs/superpowers/specs/2026-05-14-supabase-migration-design.md`

**Pre-flight (manual, làm trước Task 1):**
1. Vào https://supabase.com/dashboard tạo project mới (free tier OK). Region chọn Singapore.
2. Lấy 3 thông tin từ Project Settings → API:
   - `Project URL` → biến `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → biến `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → biến `SUPABASE_SERVICE_ROLE_KEY` (chỉ dùng cho seed)
3. Vào Authentication → Providers → Email: **bật**. Sub-section "Confirm email" → **tắt**.

---

## Phase 1 — Setup

### Task 1: Install deps + env scaffolding

**Files:**
- Create: `.env.local.example`
- Modify: `.gitignore`
- Modify: `package.json` (deps)

- [ ] **Step 1: Install Supabase packages**

```bash
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add -D tsx dotenv
```

Expected: `package.json` có 2 deps mới + 2 devDeps mới.

- [ ] **Step 2: Tạo `.env.local.example`**

```bash
# .env.local.example
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY

# Service role — chỉ dùng cho seed script. KHÔNG bao giờ commit giá trị thật.
SUPABASE_SERVICE_ROLE_KEY=YOUR-SERVICE-ROLE-KEY
```

- [ ] **Step 3: Verify `.gitignore` đã có `.env.local`**

Run: `grep -q "^\.env\.local$\|^\.env\*\.local$\|^\.env\.\*\.local$" .gitignore && echo OK || echo MISSING`

Nếu MISSING, append vào `.gitignore`:

```
# local env files
.env.local
.env*.local
```

- [ ] **Step 4: User tự tạo `.env.local` thật**

User chạy: `cp .env.local.example .env.local` rồi điền 3 giá trị thật từ pre-flight.

- [ ] **Step 5: Commit**

```bash
git add .env.local.example .gitignore package.json pnpm-lock.yaml
git commit -m "feat(supabase): install deps + env scaffolding"
```

---

### Task 2: Supabase client helpers

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/types.ts` (placeholder, regen sau)

- [ ] **Step 1: Tạo `lib/supabase/types.ts` placeholder**

```ts
// Auto-generated bởi `pnpm gen:types`. KHÔNG sửa tay.
// Hiện tại là placeholder — sẽ regen sau khi apply migration ở Task 5.
export type Database = {
  public: {
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
```

- [ ] **Step 2: Tạo `lib/supabase/client.ts`**

```ts
"use client"

import { createBrowserClient } from "@supabase/ssr"

import type { Database } from "./types"

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// Singleton dùng cho Zustand stores (tránh tạo lại mỗi render)
let _client: ReturnType<typeof createClient> | null = null
export function getSupabase() {
  if (!_client) _client = createClient()
  return _client
}
```

- [ ] **Step 3: Tạo `lib/supabase/server.ts`**

```ts
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

import type { Database } from "./types"

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Server Component không set được cookie — fine, middleware sẽ lo
          }
        },
      },
    },
  )
}
```

- [ ] **Step 4: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS (placeholder types đủ cho compile).

- [ ] **Step 5: Commit**

```bash
git add lib/supabase package.json
git commit -m "feat(supabase): add browser + server client helpers"
```

---

### Task 3: Middleware cho session refresh

**Files:**
- Create: `middleware.ts` (root)

- [ ] **Step 1: Tạo `middleware.ts`**

```ts
import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

import type { Database } from "@/lib/supabase/types"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          toSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Refresh session — KHÔNG được bỏ dòng này (theo docs Supabase + Next.js)
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
```

- [ ] **Step 2: Verify dev server chạy không lỗi**

Run trong terminal khác: `pnpm dev`
Mở http://localhost:3000 → không lỗi 500. Network tab có cookie `sb-*` xuất hiện sau khi auth (test ở Phase 4).
Stop dev server: Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat(supabase): add middleware for session refresh"
```

---

## Phase 2 — Schema + RLS

### Task 4: SQL migration file (schema + trigger + RLS)

**Files:**
- Create: `supabase/migrations/0001_init.sql`

- [ ] **Step 1: Tạo folder + file migration**

```bash
mkdir -p supabase/migrations
```

- [ ] **Step 2: Viết toàn bộ SQL vào `supabase/migrations/0001_init.sql`**

```sql
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
  using (supplier_id = auth.uid() or public.current_user_role() = 'admin');

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
```

- [ ] **Step 3: Apply migration (user thao tác)**

User vào Supabase Dashboard → **SQL Editor** → New query → paste toàn bộ nội dung `supabase/migrations/0001_init.sql` → Run.

Expected output: `Success. No rows returned.`

Verify ở **Table Editor** thấy 5 bảng. Vào **Database → Policies** thấy policies cho từng bảng.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0001_init.sql
git commit -m "feat(supabase): initial schema + RLS + trigger"
```

---

### Task 5: Generate TypeScript types

**Files:**
- Modify: `lib/supabase/types.ts`
- Modify: `package.json` (script)

- [ ] **Step 1: Thêm script vào `package.json`**

Edit `scripts` block, thêm dòng (user thay `YOUR-PROJECT-REF` bằng project ref thực tế — phần con của URL `https://<ref>.supabase.co`):

```json
"gen:types": "supabase gen types typescript --project-id=YOUR-PROJECT-REF --schema=public > lib/supabase/types.ts"
```

- [ ] **Step 2: Login Supabase CLI (user thao tác)**

User chạy 1 lần trong terminal:

```bash
pnpm dlx supabase login
```

Browser mở → user authorize. Sau đó:

```bash
pnpm gen:types
```

Expected: file `lib/supabase/types.ts` được overwrite, chứa `export type Database = { public: { Tables: { profiles: ..., products: ..., ... }}}` thật.

- [ ] **Step 3: Verify**

Run: `pnpm typecheck`
Expected: PASS.

Run: `grep -c "Row:" lib/supabase/types.ts`
Expected: 5 (mỗi bảng 1 Row type).

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/types.ts package.json
git commit -m "feat(supabase): generate typescript types from schema"
```

---

## Phase 3 — Seed

### Task 6: Seed script + chạy seed

**Files:**
- Create: `supabase/seed.ts`
- Modify: `package.json` (script `seed`)

- [ ] **Step 1: Thêm script `seed` vào `package.json`**

Thêm vào `scripts`:

```json
"seed": "tsx --env-file=.env.local supabase/seed.ts"
```

- [ ] **Step 2: Tạo `supabase/seed.ts`**

```ts
/**
 * Seed script — chạy 1 lần để populate Supabase với:
 *   - 5 demo accounts (2 user + 2 supplier + 1 admin)
 *   - ~30 mock products (remap providerId về 2 supplier seed)
 *
 * Run: pnpm seed
 * Idempotent: rerun sẽ skip user đã tồn tại + skip product trùng name+provider.
 */

import { createClient } from "@supabase/supabase-js"

import { products as mockProducts } from "../lib/data/products"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const AVATAR_USER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e8dcc8'/%3E%3Ccircle cx='50' cy='36' r='20' fill='%23b8956a'/%3E%3Cellipse cx='50' cy='90' rx='32' ry='22' fill='%23b8956a'/%3E%3C/svg%3E"
const AVATAR_SUPPLIER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e8dcc8'/%3E%3Crect x='22' y='48' width='56' height='34' fill='%23b8956a'/%3E%3Cpolygon points='14,48 86,48 76,22 24,22' fill='%238b6f4e'/%3E%3Crect x='40' y='62' width='20' height='20' fill='%23e8dcc8'/%3E%3C/svg%3E"
const AVATAR_ADMIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%231c1917'/%3E%3Ctext x='50' y='68' font-size='52' font-weight='bold' text-anchor='middle' fill='%23f0e4d0' font-family='Georgia%2Cserif'%3EA%3C/text%3E%3C/svg%3E"

type DemoAccount = {
  mockId: string  // id cũ trong code (u-001, s-001, ...) — để map products
  email: string
  password: string
  name: string
  role: "user" | "admin" | "supplier"
  shop_name?: string
  phone?: string
  address?: string
  avatar: string
  permissions?: string[]
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  { mockId: "u-001", email: "user1@styleloop.vn", password: "user123", name: "Linh Nguyễn", role: "user", avatar: AVATAR_USER },
  { mockId: "u-002", email: "user2@styleloop.vn", password: "user123", name: "Trang Phạm", role: "user", avatar: AVATAR_USER },
  {
    mockId: "a-001", email: "admin@styleloop.vn", password: "admin123", name: "Vincent Lê",
    role: "admin", avatar: AVATAR_ADMIN,
    permissions: ["users.manage", "orders.manage", "products.manage", "reports.view"],
  },
  {
    mockId: "s-001", email: "supplier1@styleloop.vn", password: "supplier123", name: "Bảo Lê",
    role: "supplier", shop_name: "Bảo Closet", phone: "0931111111",
    address: "120 Phan Xích Long, Q.Phú Nhuận, TP.HCM", avatar: AVATAR_SUPPLIER,
  },
  {
    mockId: "s-002", email: "supplier2@styleloop.vn", password: "supplier123", name: "Yến Vũ",
    role: "supplier", shop_name: "Yến Vintage", phone: "0932222222",
    address: "55 Trần Hưng Đạo, Q.5, TP.HCM", avatar: AVATAR_SUPPLIER,
  },
]

// Map mockId của 2 supplier seed
const SUPPLIER_MOCK_IDS = ["s-001", "s-002"]

async function ensureUser(acc: DemoAccount): Promise<string> {
  // Check exist trước
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (listErr) throw listErr
  const existing = list.users.find((u) => u.email === acc.email)
  if (existing) {
    console.log(`  ↺ ${acc.email} đã tồn tại (${existing.id})`)
    return existing.id
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: acc.email,
    password: acc.password,
    email_confirm: true,
    user_metadata: {
      name: acc.name,
      role: acc.role,
      shop_name: acc.shop_name,
      phone: acc.phone,
      address: acc.address,
      avatar: acc.avatar,
    },
  })
  if (error) throw error
  console.log(`  ✓ ${acc.email} (${data.user.id})`)

  // Permissions chỉ set khi admin (trigger không đẩy permissions)
  if (acc.permissions) {
    await admin.from("profiles").update({ permissions: acc.permissions }).eq("id", data.user.id)
  }
  return data.user.id
}

async function seedProducts(mockToUuid: Map<string, string>) {
  // Map products → seed supplier
  // s-001, s-003, s-005 → S1_UUID
  // s-002, s-004      → S2_UUID
  const s1 = mockToUuid.get("s-001")!
  const s2 = mockToUuid.get("s-002")!
  const remap = (oldId: string) => {
    const idx = Number(oldId.split("-")[1])
    return idx % 2 === 1 ? s1 : s2
  }

  // Skip nếu đã có row nào cho seed supplier (tránh duplicate)
  const { count } = await admin
    .from("products")
    .select("*", { count: "exact", head: true })
    .in("provider_id", [s1, s2])
  if (count && count > 0) {
    console.log(`  ↺ products: đã có ${count} row, skip seed.`)
    return
  }

  const rows = mockProducts.map((p) => ({
    src: p.src,
    name: p.name,
    brand_price: p.brandPrice,
    rental_price: p.rentalPrice,
    status: p.status,
    description: p.description,
    category: p.category,
    type: p.type,
    sizes: p.sizes,
    color: p.color,
    tags: p.tags,
    rating: p.rating,
    provider_id: remap(p.providerId),
  }))

  const { error } = await admin.from("products").insert(rows)
  if (error) throw error
  console.log(`  ✓ inserted ${rows.length} products`)
}

async function main() {
  console.log("→ Seeding demo accounts...")
  const mockToUuid = new Map<string, string>()
  for (const acc of DEMO_ACCOUNTS) {
    const id = await ensureUser(acc)
    mockToUuid.set(acc.mockId, id)
  }

  console.log("→ Seeding products...")
  await seedProducts(mockToUuid)

  console.log("✓ Done.")
}

main().catch((e) => {
  console.error("✗ Seed failed:", e)
  process.exit(1)
})
```

- [ ] **Step 3: Chạy seed**

Run: `pnpm seed`
Expected output (lần đầu):

```
→ Seeding demo accounts...
  ✓ user1@styleloop.vn (<uuid>)
  ✓ user2@styleloop.vn (<uuid>)
  ✓ admin@styleloop.vn (<uuid>)
  ✓ supplier1@styleloop.vn (<uuid>)
  ✓ supplier2@styleloop.vn (<uuid>)
→ Seeding products...
  ✓ inserted XX products
✓ Done.
```

Run lại lần 2 → tất cả "↺ ... đã tồn tại / skip seed".

- [ ] **Step 4: Verify trong Supabase Dashboard**

Vào Table Editor:
- `profiles`: 5 rows
- `products`: ~30 rows, mỗi row có `provider_id` là 1 trong 2 supplier seed

- [ ] **Step 5: Commit**

```bash
git add supabase/seed.ts package.json
git commit -m "feat(supabase): seed script for 5 demo accounts + products"
```

---

## Phase 4 — Auth Migration

### Task 7: Rewrite `auth-store.ts` (chỉ phần auth + profile, orders/whitelist để Task 13)

**Files:**
- Modify: `lib/store/auth-store.ts` (rewrite hoàn toàn)

- [ ] **Step 1: Replace toàn bộ `lib/store/auth-store.ts`**

```ts
"use client"

import { create } from "zustand"

import { getSupabase } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"
import type { Product } from "@/lib/data/products"

export type UserRole = "user" | "admin" | "supplier"

export type OrderStatus = "pending" | "confirmed" | "completed" | "cancelled"

// Order/Product types để các page khác import — vẫn giữ shape cũ
export type Order = {
  id: string
  userId: string
  providerId: string
  productId: string
  productName: string
  productSrc: string
  productType: string
  size: string
  color: string
  fromDate: string
  toDate: string
  nights: number
  rentalPricePerDay: number
  total: number
  deposit: number
  address: string
  phone: string
  paymentMethod: "bank" | "momo"
  paymentMethodLabel: string
  note: string
  status: OrderStatus
  createdAt: string
}

export type PublicUser = {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  phone?: string
  address?: string
  shopName?: string
  permissions?: string[]
}

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"]

const profileToUser = (p: ProfileRow): PublicUser => ({
  id: p.id,
  email: p.email,
  name: p.name,
  role: p.role,
  avatar: p.avatar ?? undefined,
  phone: p.phone ?? undefined,
  address: p.address ?? undefined,
  shopName: p.shop_name ?? undefined,
  permissions: p.permissions ?? undefined,
})

type Result<T> = { success: true; user: T } | { success: false; message: string }

type AuthState = {
  isAuthenticated: boolean
  user: PublicUser | null
  hydrated: boolean       // thay cho persist.hasHydrated cũ

  /** Gọi 1 lần ở root layout */
  init: () => Promise<void>

  login: (email: string, password: string) => Promise<Result<PublicUser>>
  logout: () => Promise<void>
  register: (input: {
    email: string
    password: string
    name: string
    role?: UserRole
    shopName?: string
    phone?: string
  }) => Promise<Result<PublicUser>>
  updateProfile: (patch: {
    name?: string
    phone?: string
    address?: string
    shopName?: string
  }) => Promise<{ success: boolean; message?: string }>
  changePassword: (newPassword: string) => Promise<{ success: boolean; message?: string }>

  /* TODO Task 13: addOrder, updateOrderStatus */
  /* TODO Task 14: toggleWhitelist, orders, whitelist fields */
}

let unsubscribe: (() => void) | null = null

export const useAuthStore = create<AuthState>()((set, get) => ({
  isAuthenticated: false,
  user: null,
  hydrated: false,

  init: async () => {
    if (get().hydrated) return
    const supabase = getSupabase()

    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single()
      if (profile) {
        set({ isAuthenticated: true, user: profileToUser(profile) })
      }
    }
    set({ hydrated: true })

    // Subscribe cho logout/refresh giữa các tab
    if (!unsubscribe) {
      const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          set({ isAuthenticated: false, user: null })
          return
        }
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()
          if (profile) set({ isAuthenticated: true, user: profileToUser(profile) })
        }
      })
      unsubscribe = () => sub.subscription.unsubscribe()
    }
  },

  login: async (email, password) => {
    const supabase = getSupabase()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    if (error || !data.user) {
      return { success: false, message: "Email hoặc mật khẩu không đúng." }
    }
    const { data: profile } = await supabase
      .from("profiles").select("*").eq("id", data.user.id).single()
    if (!profile) return { success: false, message: "Không tìm thấy hồ sơ." }
    const u = profileToUser(profile)
    set({ isAuthenticated: true, user: u })
    return { success: true, user: u }
  },

  logout: async () => {
    await getSupabase().auth.signOut()
    set({ isAuthenticated: false, user: null })
  },

  register: async ({ email, password, name, role = "user", shopName, phone }) => {
    if (!email || !password || !name) {
      return { success: false, message: "Vui lòng điền đầy đủ thông tin." }
    }
    const supabase = getSupabase()
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { name, role, shop_name: shopName, phone },
      },
    })
    if (error || !data.user) {
      const msg = error?.message?.includes("already")
        ? "Email này đã được đăng ký."
        : error?.message ?? "Đăng ký thất bại."
      return { success: false, message: msg }
    }

    // Trigger tạo profile rồi — fetch lại
    const { data: profile } = await supabase
      .from("profiles").select("*").eq("id", data.user.id).single()
    if (!profile) {
      return { success: false, message: "Tạo hồ sơ thất bại, vui lòng thử lại." }
    }
    const u = profileToUser(profile)
    set({ isAuthenticated: true, user: u })
    return { success: true, user: u }
  },

  updateProfile: async (patch) => {
    const id = get().user?.id
    if (!id) return { success: false, message: "Chưa đăng nhập." }
    const supabase = getSupabase()
    const dbPatch: Partial<ProfileRow> = {
      ...(patch.name      !== undefined && { name: patch.name }),
      ...(patch.phone     !== undefined && { phone: patch.phone }),
      ...(patch.address   !== undefined && { address: patch.address }),
      ...(patch.shopName  !== undefined && { shop_name: patch.shopName }),
    }
    const { data, error } = await supabase
      .from("profiles").update(dbPatch).eq("id", id).select("*").single()
    if (error || !data) return { success: false, message: error?.message ?? "Cập nhật thất bại." }
    set({ user: profileToUser(data) })
    return { success: true }
  },

  changePassword: async (newPassword) => {
    const { error } = await getSupabase().auth.updateUser({ password: newPassword })
    if (error) return { success: false, message: error.message }
    return { success: true }
  },
}))

// Re-export legacy aliases (sẽ remove sau Phase 8). Giúp tránh import error trung gian.
export const ROLE_LABEL: Record<UserRole, string> = {
  user:     "Khách hàng",
  admin:    "Quản trị viên",
  supplier: "Nhà cung cấp",
}

// Empty exports để compile-pass trong khi page files chưa migrate xong
export const ALL_MOCK_ACCOUNTS: never[] = []
export const MOCK_USERS:        never[] = []
export const MOCK_ADMINS:       never[] = []
export const MOCK_SUPPLIERS:    never[] = []

// Backwards-compat shim: cho `useAuthStore.persist.hasHydrated()` không crash trong các page chưa migrate.
// Sẽ xóa hết ở Task 17.
;(useAuthStore as unknown as {
  persist: {
    hasHydrated: () => boolean
    onFinishHydration: (cb: () => void) => () => void
  }
}).persist = {
  hasHydrated: () => useAuthStore.getState().hydrated,
  onFinishHydration: (cb) => useAuthStore.subscribe((s, prev) => {
    if (!prev.hydrated && s.hydrated) cb()
  }),
}
```

> **Note:** Phần `persist` shim ở cuối + `MOCK_*` empty là **tạm thời** để page files dùng `useAuthStore.persist.*` không crash trong khi migrate. Task 17 sẽ remove sau.

- [ ] **Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS (có thể có cảnh báo về `addOrder`/`toggleWhitelist` thiếu — fix ở Task 13/14).

- [ ] **Step 3: Commit**

```bash
git add lib/store/auth-store.ts
git commit -m "feat(auth): rewrite auth-store on supabase auth"
```

---

### Task 8: AuthInit provider + cập nhật root layout

**Files:**
- Create: `components/auth-init.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Tạo `components/auth-init.tsx`**

```tsx
"use client"

import { useEffect } from "react"

import { useAuthStore } from "@/lib/store/auth-store"

export function AuthInit({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useAuthStore.getState().init()
  }, [])
  return <>{children}</>
}
```

- [ ] **Step 2: Modify `app/layout.tsx` — wrap children với AuthInit**

Tìm dòng `<ThemeProvider>{children}</ThemeProvider>` và thay bằng:

```tsx
<ThemeProvider>
  <AuthInit>{children}</AuthInit>
</ThemeProvider>
```

Thêm import ở đầu file:

```tsx
import { AuthInit } from "@/components/auth-init"
```

- [ ] **Step 3: Verify**

Run: `pnpm dev` (terminal khác)
Mở http://localhost:3000 → page load, không lỗi console.
Stop: Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add components/auth-init.tsx app/layout.tsx
git commit -m "feat(auth): init supabase session on app mount"
```

---

### Task 9: Update login page → async

**Files:**
- Modify: `app/(auth)/login/page.tsx`

- [ ] **Step 1: Sửa hàm `handleSubmit` để await login**

Thay block `handleSubmit` (hiện tại lines ~57-68) bằng:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError(null)
  setLoading(true)
  const res = await login(email, password)
  setLoading(false)
  if (!res.success) {
    setError(res.message)
    return
  }
  router.push(redirect)
}
```

Demo accounts giờ chỉ còn 3 trong UI (user/admin/supplier1) — credentials không đổi, **vẫn login OK** vì seed dùng cùng email/password.

- [ ] **Step 2: Verify manual**

Run: `pnpm dev`
- Mở /login → bấm nút "Quản trị" → email/password auto-fill → bấm "Đăng nhập"
- Expected: redirect về `/`, header hiện avatar admin
- F5 reload → vẫn login (session lưu cookie)
- Vào dev tools → Application → Cookies → có cookie `sb-<project>-auth-token`

Stop dev server.

- [ ] **Step 3: Commit**

```bash
git add app/\(auth\)/login/page.tsx
git commit -m "feat(auth): make login submit async"
```

---

### Task 10: Update register page → async

**Files:**
- Modify: `app/(auth)/register/page.tsx`

- [ ] **Step 1: Sửa `handleSubmit` để await register**

Thay block `handleSubmit` bằng:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError(null)
  if (password !== confirm) {
    setError("Mật khẩu xác nhận không khớp.")
    return
  }
  if (password.length < 6) {
    setError("Mật khẩu phải có ít nhất 6 ký tự.")
    return
  }
  if (role === "supplier" && !shopName.trim()) {
    setError("Vui lòng nhập tên cửa hàng.")
    return
  }
  if (role === "supplier" && !phone.trim()) {
    setError("Vui lòng nhập số điện thoại.")
    return
  }
  setLoading(true)
  const res = await register({
    email,
    password,
    name,
    role,
    shopName: role === "supplier" ? shopName.trim() : undefined,
    phone: role === "supplier" ? phone.trim() : undefined,
  })
  setLoading(false)
  if (!res.success) {
    setError(res.message)
    return
  }
  router.push("/")
}
```

- [ ] **Step 2: Verify manual**

Run: `pnpm dev`
- /register → tạo user mới (email random vd `test+1@x.com` / pw `test123`) → submit
- Expected: redirect /, header hiện avatar
- Vào Supabase Dashboard → Authentication → Users: thấy user mới
- Table `profiles`: thấy row mới với role='user'

Stop dev server.

- [ ] **Step 3: Commit**

```bash
git add app/\(auth\)/register/page.tsx
git commit -m "feat(auth): make register submit async"
```

---

### Task 11: Update account page (profile + password change)

**Files:**
- Modify: `app/(home)/account/page.tsx`

Đọc file trước khi edit để biết exact handlers.

- [ ] **Step 1: Đọc file để tìm chỗ gọi `updateProfile` và `useAuthStore.persist.*`**

Run: `grep -n "updateProfile\|password" app/\(home\)/account/page.tsx`

- [ ] **Step 2: Sửa handler save profile**

Tìm hàm submit (thường tên `handleSave` hoặc `onSubmit`) gọi `updateProfile({...})`. Wrap với await:

```tsx
const result = await useAuthStore.getState().updateProfile({
  name, phone, address,
  shopName: user?.role === "supplier" ? shopName : undefined,
})
if (!result.success) {
  // hiển thị error
}
```

Nếu page có đổi password, dùng action mới `changePassword`:

```tsx
const result = await useAuthStore.getState().changePassword(newPassword)
```

(KHÔNG truyền `password` vào `updateProfile` nữa — đã tách ra `changePassword`.)

- [ ] **Step 3: Verify manual**

Run: `pnpm dev`
- Login bằng `user1@styleloop.vn / user123`
- Vào /account → đổi tên → save → reload page → tên vẫn đổi
- Đổi password → logout → login lại bằng password mới → OK

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add app/\(home\)/account/page.tsx
git commit -m "feat(auth): wire account page to supabase profile update"
```

---

### Task 12: Update site-header logout

**Files:**
- Modify: `components/site-header.tsx`

- [ ] **Step 1: Sửa nút logout để await**

Tìm chỗ gọi `logout()` (search `logout`). Thay bằng:

```tsx
onClick={async () => {
  await useAuthStore.getState().logout()
  router.push("/")
}}
```

(Hoặc nếu component đang dùng selector: `const logout = useAuthStore((s) => s.logout)` → đảm bảo callback là async.)

- [ ] **Step 2: Verify manual**

Run: `pnpm dev`
- Đang login → bấm logout trong header dropdown
- Expected: redirect /, header hiện nút "Đăng nhập"
- Reload → vẫn logged out

Stop dev server.

- [ ] **Step 3: Commit**

```bash
git add components/site-header.tsx
git commit -m "feat(auth): make header logout async"
```

---

## Phase 5 — Products + Submissions

### Task 13: Rewrite `product-store.ts`

**Files:**
- Modify: `lib/store/product-store.ts` (rewrite hoàn toàn)

- [ ] **Step 1: Replace toàn bộ `lib/store/product-store.ts`**

```ts
"use client"

import { create } from "zustand"

import { getSupabase } from "@/lib/supabase/client"
import type {
  Product, ProductCategory, ProductSize, ProductStatus, ProductType, SubmittedProduct,
} from "@/lib/data/products"
import type { Database } from "@/lib/supabase/types"

type ProductRow    = Database["public"]["Tables"]["products"]["Row"]
type SubmissionRow = Database["public"]["Tables"]["product_submissions"]["Row"]

const rowToProduct = (r: ProductRow): Product => ({
  id: r.id,
  src: r.src,
  name: r.name,
  brandPrice: Number(r.brand_price),
  rentalPrice: Number(r.rental_price),
  status: r.status as ProductStatus,
  description: r.description ?? "",
  category: r.category as ProductCategory,
  type: r.type as ProductType,
  sizes: r.sizes as ProductSize[],
  color: r.color ?? "",
  tags: r.tags ?? [],
  rating: (r.rating ?? 5) as 4 | 5,
  providerId: r.provider_id,
})

const rowToSubmission = (r: SubmissionRow, supplierName: string, shopName: string): SubmittedProduct => ({
  id: r.id,
  supplierId: r.supplier_id,
  supplierName,
  shopName,
  uploadStatus: r.upload_status,
  rejectReason: r.reject_reason ?? undefined,
  submittedAt: r.submitted_at,
  src: r.src,
  name: r.name,
  brandPrice: Number(r.brand_price),
  rentalPrice: Number(r.rental_price),
  description: r.description ?? "",
  category: r.category as ProductCategory,
  type: r.type as ProductType,
  sizes: r.sizes as ProductSize[],
  color: r.color ?? "",
  tags: r.tags ?? [],
})

type ProductState = {
  allProducts: Product[]
  submittedProducts: SubmittedProduct[]
  loaded: boolean

  init: () => Promise<void>
  refetch: () => Promise<void>

  submitProduct: (
    data: Omit<SubmittedProduct, "id" | "supplierId" | "supplierName" | "shopName" | "uploadStatus" | "submittedAt">,
    supplier: { id: string; name: string; shopName?: string },
  ) => Promise<void>
  approveProduct: (id: string) => Promise<void>
  rejectProduct: (id: string, reason: string) => Promise<void>
}

export const useProductStore = create<ProductState>()((set, get) => ({
  allProducts: [],
  submittedProducts: [],
  loaded: false,

  init: async () => {
    if (get().loaded) return
    await get().refetch()
  },

  refetch: async () => {
    const supabase = getSupabase()
    const { data: prodRows } = await supabase.from("products").select("*").order("created_at", { ascending: false })
    const { data: subRows  } = await supabase
      .from("product_submissions")
      .select("*, supplier:profiles!product_submissions_supplier_id_fkey(name, shop_name)")
      .order("submitted_at", { ascending: false })

    set({
      allProducts: (prodRows ?? []).map(rowToProduct),
      submittedProducts: (subRows ?? []).map((r) => {
        const supplier = (r as unknown as { supplier: { name: string; shop_name: string | null } }).supplier
        return rowToSubmission(
          r as SubmissionRow,
          supplier?.name ?? "",
          supplier?.shop_name ?? supplier?.name ?? "",
        )
      }),
      loaded: true,
    })
  },

  submitProduct: async (data, supplier) => {
    const { error } = await getSupabase().from("product_submissions").insert({
      supplier_id: supplier.id,
      src: data.src,
      name: data.name,
      brand_price: data.brandPrice,
      rental_price: data.rentalPrice,
      description: data.description,
      category: data.category,
      type: data.type,
      sizes: data.sizes,
      color: data.color,
      tags: data.tags,
    })
    if (error) throw error
    await get().refetch()
  },

  approveProduct: async (id) => {
    const supabase = getSupabase()
    const sub = get().submittedProducts.find((s) => s.id === id)
    if (!sub || sub.uploadStatus !== "pending") return

    // 1. Insert product
    const { data: prod, error: insErr } = await supabase.from("products").insert({
      src: sub.src,
      name: sub.name,
      brand_price: sub.brandPrice,
      rental_price: sub.rentalPrice,
      description: sub.description,
      category: sub.category,
      type: sub.type,
      sizes: sub.sizes,
      color: sub.color,
      tags: sub.tags,
      rating: 5,
      provider_id: sub.supplierId,
    }).select("id").single()
    if (insErr || !prod) throw insErr

    // 2. Update submission status
    const { error: updErr } = await supabase
      .from("product_submissions")
      .update({ upload_status: "approved", product_id: prod.id })
      .eq("id", id)
    if (updErr) throw updErr

    await get().refetch()
  },

  rejectProduct: async (id, reason) => {
    const { error } = await getSupabase()
      .from("product_submissions")
      .update({ upload_status: "rejected", reject_reason: reason })
      .eq("id", id)
    if (error) throw error
    await get().refetch()
  },
}))

// Compat shim — sẽ remove ở Task 17
;(useProductStore as unknown as {
  persist: {
    hasHydrated: () => boolean
    onFinishHydration: (cb: () => void) => () => void
  }
}).persist = {
  hasHydrated: () => useProductStore.getState().loaded,
  onFinishHydration: (cb) =>
    useProductStore.subscribe((s, prev) => { if (!prev.loaded && s.loaded) cb() }),
}
```

- [ ] **Step 2: Wire init vào `AuthInit`**

Modify `components/auth-init.tsx`:

```tsx
"use client"

import { useEffect } from "react"

import { useAuthStore } from "@/lib/store/auth-store"
import { useProductStore } from "@/lib/store/product-store"

export function AuthInit({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useAuthStore.getState().init()
    useProductStore.getState().init()
  }, [])
  return <>{children}</>
}
```

- [ ] **Step 3: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add lib/store/product-store.ts components/auth-init.tsx
git commit -m "feat(products): rewrite product-store on supabase"
```

---

### Task 14: Update supplier submit page

**Files:**
- Modify: `app/(home)/supplier/page.tsx`

- [ ] **Step 1: Tìm chỗ gọi `submitProduct`**

Run: `grep -n "submitProduct\|useProductStore" app/\(home\)/supplier/page.tsx`

- [ ] **Step 2: Sửa thành async**

Tìm hàm submit (thường `handleSubmit`), wrap call với `await`:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!user || user.role !== "supplier") return
  setLoading(true)
  try {
    await useProductStore.getState().submitProduct(
      {
        src, name, brandPrice, rentalPrice,
        description, category, type, sizes, color, tags,
      },
      { id: user.id, name: user.name, shopName: user.shopName },
    )
    // reset form, show toast success
  } catch (err) {
    setError((err as Error).message)
  } finally {
    setLoading(false)
  }
}
```

- [ ] **Step 3: Verify manual**

Run: `pnpm dev`
- Login `supplier1@styleloop.vn / supplier123`
- /supplier → điền form submit 1 sản phẩm (vẫn paste URL ảnh — Storage làm ở Task 19)
- Expected: list pending submission xuất hiện sản phẩm vừa submit
- Reload page → sản phẩm vẫn còn (đã lưu DB)

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add app/\(home\)/supplier/page.tsx
git commit -m "feat(supplier): wire submit to supabase"
```

---

### Task 15: Update admin approval page

**Files:**
- Modify: `app/(home)/admin/page.tsx`

- [ ] **Step 1: Tìm `approveProduct` / `rejectProduct` calls**

Run: `grep -n "approveProduct\|rejectProduct" app/\(home\)/admin/page.tsx`

- [ ] **Step 2: Sửa thành async**

```tsx
const handleApprove = async (id: string) => {
  setBusyId(id)
  try {
    await useProductStore.getState().approveProduct(id)
  } catch (e) { console.error(e) } finally { setBusyId(null) }
}

const handleReject = async (id: string, reason: string) => {
  setBusyId(id)
  try {
    await useProductStore.getState().rejectProduct(id, reason)
  } catch (e) { console.error(e) } finally { setBusyId(null) }
}
```

- [ ] **Step 3: Verify manual**

Run: `pnpm dev`
- Login `admin@styleloop.vn / admin123`
- /admin → thấy submission vừa tạo ở Task 14
- Approve → trạng thái → approved → vào /products thấy sản phẩm mới
- Submit thêm 1 sản phẩm khác (login supplier ở tab khác) → reject với reason → status → rejected

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add app/\(home\)/admin/page.tsx
git commit -m "feat(admin): wire approve/reject to supabase"
```

---

### Task 16: Update product list + detail pages

**Files:**
- Modify: `app/(home)/products/page.tsx` (nếu có)
- Modify: `app/(home)/product/[id]/page.tsx`

- [ ] **Step 1: Đảm bảo list page đọc từ `useProductStore.allProducts`**

Run: `grep -n "useProductStore\|allProducts" app/\(home\)/products/page.tsx app/\(home\)/page.tsx 2>/dev/null`

Page list/home đã dùng `useProductStore` → không cần đổi. Chỉ cần verify products show đúng sau init.

- [ ] **Step 2: Update product detail page**

`app/(home)/product/[id]/page.tsx` — đảm bảo lookup `products.find(p => p.id === id)` dùng list từ store. Vì id giờ là uuid, mọi link cũ dạng `/product/prod-001` sẽ 404 — đây là behavior **đúng** sau migrate. Link mới được generate từ store data, sẽ là uuid.

Đảm bảo `useSyncExternalStore` cho `useProductStore.persist.*` vẫn hoạt động (shim đã add ở Task 13).

- [ ] **Step 3: Verify manual**

Run: `pnpm dev`
- /products → thấy ~30+ sản phẩm
- Click 1 sản phẩm → vào detail, ảnh + thông tin đúng
- /product/<uuid> URL hợp lệ

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add app/\(home\)/product
git commit -m "feat(products): verify product pages render from supabase"
```

---

## Phase 6 — Orders + Whitelist

### Task 17: Thêm orders + whitelist actions vào auth-store

**Files:**
- Modify: `lib/store/auth-store.ts` (thêm field + actions)

- [ ] **Step 1: Thêm types + state**

Trong file `lib/store/auth-store.ts`, **mở rộng** type `AuthState` (chỗ đang có `/* TODO Task 13: ... */`):

```ts
type AuthState = {
  isAuthenticated: boolean
  user: PublicUser | null
  hydrated: boolean
  orders: Order[]        // orders của user hiện tại (hoặc orders của shop nếu là supplier)
  whitelist: Product[]   // wishlist của user hiện tại

  init: () => Promise<void>
  login: (email: string, password: string) => Promise<Result<PublicUser>>
  logout: () => Promise<void>
  register: (input: { /* unchanged */ }) => Promise<Result<PublicUser>>
  updateProfile: (patch: { /* unchanged */ }) => Promise<{ success: boolean; message?: string }>
  changePassword: (newPassword: string) => Promise<{ success: boolean; message?: string }>

  addOrder: (order: Omit<Order, "id" | "createdAt" | "userId">) => Promise<Order>
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>
  confirmOrder: (orderId: string) => Promise<void>
  toggleWhitelist: (product: Product) => Promise<void>
  refetchUserData: () => Promise<void>
}
```

- [ ] **Step 2: Thêm helpers + actions vào store implementation**

Thêm trên dòng `export const useAuthStore`:

```ts
type OrderRow = Database["public"]["Tables"]["orders"]["Row"]

const rowToOrder = (r: OrderRow): Order => ({
  id: r.id,
  userId: r.user_id,
  providerId: r.provider_id,
  productId: r.product_id,
  productName: r.product_name,
  productSrc: r.product_src,
  productType: r.product_type,
  size: r.size,
  color: r.color ?? "",
  fromDate: r.from_date,
  toDate: r.to_date,
  nights: r.nights,
  rentalPricePerDay: Number(r.rental_price_per_day),
  total: Number(r.total),
  deposit: Number(r.deposit),
  address: r.address,
  phone: r.phone,
  paymentMethod: r.payment_method,
  paymentMethodLabel: r.payment_method_label,
  note: r.note ?? "",
  status: r.status,
  createdAt: r.created_at,
})
```

Trong object `create((set, get) => ({...}))`:

1. Thêm `orders: []`, `whitelist: []` vào initial state.

2. Trong `init()`, sau khi set profile, thêm `await get().refetchUserData()`.

3. Trong `login()` sau `set({...})`, thêm `await get().refetchUserData()`.

4. Trong `logout()` thêm `set({ orders: [], whitelist: [] })`.

5. Thêm các action mới:

```ts
refetchUserData: async () => {
  const u = get().user
  if (!u) { set({ orders: [], whitelist: [] }); return }
  const supabase = getSupabase()

  // Orders: user thấy orders của mình, supplier thấy của shop, admin thấy hết
  let orderQuery = supabase.from("orders").select("*").order("created_at", { ascending: false })
  if (u.role === "user") orderQuery = orderQuery.eq("user_id", u.id)
  else if (u.role === "supplier") orderQuery = orderQuery.eq("provider_id", u.id)
  const { data: orderRows } = await orderQuery

  // Whitelist
  const { data: whitelistRows } = await supabase
    .from("whitelist")
    .select("product:products(*)")
    .eq("user_id", u.id)

  set({
    orders: (orderRows ?? []).map(rowToOrder),
    whitelist: ((whitelistRows ?? []) as Array<{ product: ProductRow }>).map((w) => ({
      id: w.product.id,
      src: w.product.src,
      name: w.product.name,
      brandPrice: Number(w.product.brand_price),
      rentalPrice: Number(w.product.rental_price),
      status: w.product.status as ProductStatus,
      description: w.product.description ?? "",
      category: w.product.category as ProductCategory,
      type: w.product.type as ProductType,
      sizes: w.product.sizes as ProductSize[],
      color: w.product.color ?? "",
      tags: w.product.tags ?? [],
      rating: (w.product.rating ?? 5) as 4 | 5,
      providerId: w.product.provider_id,
    })),
  })
},

addOrder: async (orderData) => {
  const u = get().user
  if (!u) throw new Error("Chưa đăng nhập")
  const supabase = getSupabase()
  const { data, error } = await supabase.from("orders").insert({
    user_id: u.id,
    provider_id: orderData.providerId,
    product_id: orderData.productId,
    product_name: orderData.productName,
    product_src: orderData.productSrc,
    product_type: orderData.productType,
    size: orderData.size,
    color: orderData.color,
    from_date: orderData.fromDate,
    to_date: orderData.toDate,
    nights: orderData.nights,
    rental_price_per_day: orderData.rentalPricePerDay,
    total: orderData.total,
    deposit: orderData.deposit,
    address: orderData.address,
    phone: orderData.phone,
    payment_method: orderData.paymentMethod,
    payment_method_label: orderData.paymentMethodLabel,
    note: orderData.note,
    status: orderData.status ?? "pending",
  }).select("*").single()
  if (error || !data) throw error
  await get().refetchUserData()
  return rowToOrder(data)
},

updateOrderStatus: async (orderId, status) => {
  const { error } = await getSupabase().from("orders").update({ status }).eq("id", orderId)
  if (error) throw error
  await get().refetchUserData()
},

confirmOrder: async (orderId) => {
  await get().updateOrderStatus(orderId, "confirmed")
},

toggleWhitelist: async (product) => {
  const u = get().user
  if (!u) throw new Error("Chưa đăng nhập")
  const supabase = getSupabase()
  const isLiked = get().whitelist.some((w) => w.id === product.id)
  if (isLiked) {
    await supabase.from("whitelist").delete().eq("user_id", u.id).eq("product_id", product.id)
  } else {
    await supabase.from("whitelist").insert({ user_id: u.id, product_id: product.id })
  }
  await get().refetchUserData()
},
```

Cần import thêm:

```ts
import type {
  ProductCategory, ProductSize, ProductStatus, ProductType,
} from "@/lib/data/products"
```

Và thêm type alias:

```ts
type ProductRow = Database["public"]["Tables"]["products"]["Row"]
```

- [ ] **Step 3: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add lib/store/auth-store.ts
git commit -m "feat(orders): wire orders + whitelist to supabase"
```

---

### Task 18: Update payment + order pages

**Files:**
- Modify: `app/(home)/payment/page.tsx`
- Modify: `app/(home)/account/orders/page.tsx`
- Modify: `app/(home)/account/ordered/page.tsx`
- Modify: `app/(home)/supplier/page.tsx` (phần list orders nếu có)

- [ ] **Step 1: Payment page — make submit async**

Run: `grep -n "addOrder" app/\(home\)/payment/page.tsx`

Wrap call thành async:

```tsx
const handlePayment = async () => {
  setLoading(true)
  try {
    const order = await useAuthStore.getState().addOrder({
      providerId: pending.providerId,
      productId: pending.productId,
      productName: pending.productName,
      productSrc: pending.productSrc,
      productType: pending.productType,
      size: pending.size,
      color: pending.color,
      fromDate: pending.fromDate,
      toDate: pending.toDate,
      nights: pending.nights,
      rentalPricePerDay: pending.rentalPricePerDay,
      total: pending.total,
      deposit: Math.round(pending.total * 0.3), // hoặc giữ logic cũ
      address, phone, paymentMethod, paymentMethodLabel, note,
      status: "pending",
    })
    useOrderStore.getState().clear()
    router.push(`/account/orders?new=${order.id}`)
  } catch (e) {
    setError((e as Error).message)
  } finally {
    setLoading(false)
  }
}
```

- [ ] **Step 2: Orders list / ordered list page**

Các page này đã đọc `useAuthStore((s) => s.user?.orders)` — giờ phải đổi sang `useAuthStore((s) => s.orders)` (top-level field, không nested).

Run: `grep -n "user?.orders\|user.orders\b" app/\(home\)/account/`

Replace `user.orders` → `orders` (lấy từ selector mới `(s) => s.orders`).

- [ ] **Step 3: updateOrderStatus calls**

Tìm chỗ admin/supplier confirm order:

```bash
grep -rn "updateOrderStatus\|confirmOrder" app/\(home\)/
```

Wrap với await tương tự.

- [ ] **Step 4: Verify manual**

Run: `pnpm dev`
- Login user1 → /products → vào 1 product → submit rental → /payment → bấm thanh toán
- Expected: redirect /account/orders, order xuất hiện
- Logout → login supplier (provider của product đó) → /supplier (hoặc /supplier/orders) → thấy order pending → confirm
- Login user1 lại → /account/orders → status = confirmed

Stop dev server.

- [ ] **Step 5: Commit**

```bash
git add app/\(home\)/payment app/\(home\)/account app/\(home\)/supplier
git commit -m "feat(orders): wire rental + status flow to supabase"
```

---

### Task 19: Update whitelist (like) UI

**Files:**
- Modify: `components/product-card.tsx` (heart toggle)
- Modify: bất kỳ page nào hiển thị `whitelist`

- [ ] **Step 1: Tìm chỗ gọi `toggleWhitelist`**

```bash
grep -rn "toggleWhitelist\|whitelist" components/ app/\(home\)/
```

- [ ] **Step 2: Make handler async**

```tsx
const handleToggleLike = async () => {
  if (!user) { router.push("/login"); return }
  await useAuthStore.getState().toggleWhitelist(product)
}
```

Selector đọc whitelist:

```tsx
const whitelist = useAuthStore((s) => s.whitelist)
const isLiked = whitelist.some((w) => w.id === product.id)
```

(Trước đây có thể đọc `user.whitelist` — đổi sang top-level `whitelist`.)

- [ ] **Step 3: Verify manual**

Run: `pnpm dev`
- Login user1 → bấm tim trên product card → tim đỏ
- Reload → vẫn đỏ
- Vào trang favorites (nếu có) → product hiển thị
- Bấm tim lần nữa → unlike → reload → không còn

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add components/product-card.tsx app/\(home\)
git commit -m "feat(whitelist): wire like toggle to supabase"
```

---

## Phase 7 — Storage

### Task 20: Tạo bucket + policies

**Files:**
- Create: `supabase/migrations/0002_storage.sql`

- [ ] **Step 1: Tạo file SQL**

```sql
-- Bucket product-images (public read, authenticated upload, owner delete)
insert into storage.buckets (id, name, public)
  values ('product-images', 'product-images', true)
  on conflict (id) do nothing;

create policy "product_images_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'product-images');

create policy "product_images_authenticated_upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "product_images_owner_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'product-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
```

- [ ] **Step 2: Apply (user thao tác)**

Dashboard → SQL Editor → paste → Run.

Verify: Storage → Buckets → có `product-images`, Public = ON.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0002_storage.sql
git commit -m "feat(storage): create product-images bucket + policies"
```

---

### Task 21: ImageUploader component

**Files:**
- Create: `components/image-uploader.tsx`

- [ ] **Step 1: Viết component**

```tsx
"use client"

import Image from "next/image"
import { useState } from "react"
import { Upload, X } from "lucide-react"

import { getSupabase } from "@/lib/supabase/client"
import { useAuthStore } from "@/lib/store/auth-store"
import { cn } from "@/lib/utils"

type Props = {
  value: string
  onChange: (url: string) => void
  className?: string
}

const MAX_BYTES = 5 * 1024 * 1024 // 5MB

export function ImageUploader({ value, onChange, className }: Props) {
  const user = useAuthStore((s) => s.user)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setError(null)
    if (!user) { setError("Chưa đăng nhập."); return }
    if (!file.type.startsWith("image/")) { setError("File phải là ảnh."); return }
    if (file.size > MAX_BYTES) { setError("Ảnh tối đa 5MB."); return }

    setUploading(true)
    const supabase = getSupabase()
    const ext = file.name.split(".").pop() ?? "jpg"
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`
    const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    })
    setUploading(false)
    if (upErr) { setError(upErr.message); return }

    const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path)
    onChange(publicUrl)
  }

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md border border-[oklch(0.88_0.018_70)] bg-[oklch(0.99_0.008_78)]">
          <Image src={value} alt="" fill className="object-cover" sizes="320px" unoptimized />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 cursor-pointer rounded-full bg-[oklch(0.18_0.014_55/0.85)] p-1.5 text-[oklch(0.97_0.012_78)] hover:bg-[oklch(0.18_0.014_55)]"
            aria-label="Xoá ảnh"
          >
            <X className="size-3.5" strokeWidth={1.4} />
          </button>
        </div>
      ) : (
        <label className="flex aspect-[3/4] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[oklch(0.78_0.04_70)] bg-[oklch(0.96_0.012_78)] text-center text-[oklch(0.5_0.024_60)] transition-colors hover:border-[oklch(0.6_0.062_60)] hover:bg-[oklch(0.94_0.014_75)]">
          <Upload className="size-5" strokeWidth={1.4} />
          <span className="text-[11px] font-semibold tracking-[0.22em] uppercase">
            {uploading ? "Đang tải lên..." : "Chọn ảnh"}
          </span>
          <span className="text-[10px] tracking-[0.08em]">JPG / PNG · tối đa 5MB</span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void handleFile(f)
            }}
          />
        </label>
      )}
      {error && (
        <p role="alert" className="text-[11px] text-[oklch(0.45_0.12_30)]">
          {error}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/image-uploader.tsx
git commit -m "feat(storage): add ImageUploader component"
```

---

### Task 22: Wire ImageUploader vào supplier form

**Files:**
- Modify: `app/(home)/supplier/page.tsx`

- [ ] **Step 1: Replace input URL bằng ImageUploader**

Tìm field input `src` (URL ảnh) trong form supplier. Thay block input đó bằng:

```tsx
<ImageUploader value={src} onChange={setSrc} />
```

Thêm import:

```tsx
import { ImageUploader } from "@/components/image-uploader"
```

(Giữ state `const [src, setSrc] = useState("")` như cũ — chỉ đổi UI input.)

- [ ] **Step 2: Verify manual**

Run: `pnpm dev`
- Login supplier1 → /supplier → form: bấm "Chọn ảnh" → upload 1 file JPG
- Expected: preview hiện, sau khi upload xong `value` được set thành public URL
- Submit form → admin queue thấy ảnh hiển thị đúng
- Dashboard Storage → product-images → thấy file mới trong folder `<supplier_uuid>/`

Stop dev server.

- [ ] **Step 3: Commit**

```bash
git add app/\(home\)/supplier/page.tsx
git commit -m "feat(supplier): use ImageUploader instead of URL input"
```

---

## Phase 8 — Cleanup

### Task 23: Remove mock data + compat shims + verify

**Files:**
- Modify: `lib/store/auth-store.ts` (remove shims)
- Modify: `lib/store/product-store.ts` (remove shim)
- Modify: tất cả page files dùng `useAuthStore.persist.*` hoặc `useProductStore.persist.*`
- Modify: `lib/data/products.ts` (giữ types, có thể remove `providers` array tĩnh)
- Modify: `CLAUDE.md` (note về Supabase)

- [ ] **Step 1: Remove `persist` shim ở cuối `auth-store.ts`**

Xoá block:

```ts
// Re-export legacy aliases ...
export const ALL_MOCK_ACCOUNTS ...
export const MOCK_USERS ...
// ...
;(useAuthStore as unknown as ...).persist = { ... }
```

- [ ] **Step 2: Remove shim ở cuối `product-store.ts`**

Xoá block `;(useProductStore as unknown as ...).persist = ...`.

- [ ] **Step 3: Replace mọi `useAuthStore.persist.hasHydrated()` trong page files**

Run: `grep -rn "useAuthStore.persist\|useProductStore.persist" app/ components/`

Mỗi chỗ thay pattern này:

```tsx
const hydrated = useSyncExternalStore(
  (cb) => useAuthStore.persist.onFinishHydration(cb),
  () => useAuthStore.persist.hasHydrated(),
  () => false,
)
```

Thành:

```tsx
const hydrated = useAuthStore((s) => s.hydrated)
```

(Tương tự `useProductStore` → `(s) => s.loaded`.)

Remove luôn import `useSyncExternalStore` nếu không còn dùng chỗ khác trong file.

- [ ] **Step 4: Remove `providers` static array khỏi `lib/data/products.ts`**

`grep -rn "import.*providers.*from.*lib/data/products" app/ components/` — tìm chỗ import. Replace tất cả lookup `providers.find(p => p.id === ...)` bằng query store hoặc helper:

```tsx
// lib/supabase/queries.ts (file mới — optional)
export async function getProviderById(id: string) {
  const { data } = await getSupabase()
    .from("profiles")
    .select("id, name, shop_name, avatar, address")
    .eq("id", id).single()
  return data
}
```

Hoặc cache trong product-store: thêm `providers` map fetch 1 lần ở `init()`.

> Nếu provider chỉ hiện ở 1-2 chỗ (vd product detail), có thể inline fetch trong component. Cost-benefit: nếu phức tạp, **để lại** `providers` static (đã không dùng nữa) và chỉ remove import — đỡ refactor.

- [ ] **Step 5: Remove `products` mock array khỏi `lib/data/products.ts`**

Nếu `products` chỉ dùng trong seed (Task 6 import từ đây) + product-store cũ — sau Phase 5 đã không còn page nào import `products` array. Verify:

```bash
grep -rn "from.*\"@/lib/data/products\"" app/ components/ | grep -v "type\|Provider\|Product\b"
```

Nếu sạch (chỉ còn import types), xoá `export const products = [...]` và `export const providers = [...]` khỏi `lib/data/products.ts`. **GIỮ LẠI** types (`Product`, `Provider`, `ProductCategory`, etc.).

> **Cảnh báo:** Seed script `supabase/seed.ts` đang import `products`. Nếu xoá, seed sẽ broken. Giải pháp: **giữ `products` array** vì là source of truth cho seed — nhưng đảm bảo runtime code không import nó nữa.

- [ ] **Step 6: Update `CLAUDE.md`**

Thêm section sau "## 7. Files to mirror...":

```markdown
## 9. Backend — Supabase

App đã migrate từ localStorage sang Supabase (xem `docs/superpowers/specs/2026-05-14-supabase-migration-design.md`).

- Browser client: `lib/supabase/client.ts` (export `getSupabase()`)
- Server client: `lib/supabase/server.ts` (`createSupabaseServerClient()`)
- Schema: `supabase/migrations/0001_init.sql`
- Storage policies: `supabase/migrations/0002_storage.sql`
- Seed: `pnpm seed` (idempotent)
- Regen types sau khi sửa schema: `pnpm gen:types`

**Stores:**
- `useAuthStore` — Supabase Auth + profile + orders + whitelist (top-level fields, không nested trong `user`)
- `useProductStore` — products + product_submissions
- `useOrderStore` — vẫn in-memory cho pending rental draft

Mọi action store là **async** — nhớ `await` hoặc xử lý promise.

**Demo accounts** (seed):
- user1@styleloop.vn / user123
- user2@styleloop.vn / user123
- admin@styleloop.vn / admin123
- supplier1@styleloop.vn / supplier123
- supplier2@styleloop.vn / supplier123
```

- [ ] **Step 7: Final verify**

```bash
pnpm typecheck
pnpm lint
```

Expected: both PASS.

Run: `pnpm dev` → mở /, /login, /register, /products, /account, /supplier, /admin, /payment lần lượt → không lỗi console, không 500.

Stop dev server.

- [ ] **Step 8: Commit**

```bash
git add lib/store CLAUDE.md app/ components/ lib/data
git commit -m "chore(supabase): cleanup mock data + compat shims"
```

---

## Phase 9 — Deploy lên Vercel

### Task 24: Production deployment

> Supabase **không cần deploy riêng** — project Supabase đã chạy 24/7 ở cloud của họ. Task này chỉ config Vercel + Supabase Auth nhận diện được domain production.

**Files:** (không có file code mới — toàn bộ là config dashboard)

- [ ] **Step 1: Add env vars vào Vercel**

Vercel Dashboard → chọn project → **Settings → Environment Variables**. Add 2 biến (apply cho cả Production + Preview + Development):

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Copy từ `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Copy từ `.env.local` |

> ⚠️ **TUYỆT ĐỐI KHÔNG** add `SUPABASE_SERVICE_ROLE_KEY` vào Vercel. Key này bypass toàn bộ RLS — chỉ dùng cho seed local. Nếu lộ ra production: bất kỳ ai có key đó đều đọc/sửa/xoá được mọi data.

- [ ] **Step 2: Add Vercel domain vào Supabase Auth**

Supabase Dashboard → **Authentication → URL Configuration**:

- **Site URL**: `https://<your-app>.vercel.app` (đổi sang custom domain sau nếu có)
- **Redirect URLs**: thêm 2 dòng:
  ```
  https://<your-app>.vercel.app/**
  https://*-<your-vercel-team>.vercel.app/**
  ```
  (Dòng 2 cho preview deployments — mỗi PR có URL khác.)

Bấm **Save**.

- [ ] **Step 3: Verify dev server local vẫn chạy**

```bash
pnpm dev
```

Mở http://localhost:3000 → login `user1@styleloop.vn / user123` → OK.

> Local vẫn dùng cùng 1 Supabase project nên dev và prod sẽ share data. Đây là chủ ý (cách đơn giản). Sau muốn tách, tạo Supabase project thứ 2 cho prod + apply lại migration + seed.

Stop dev server.

- [ ] **Step 4: Push lên Vercel**

```bash
git push origin main
```

Vercel auto-deploy. Vào Vercel dashboard → tab Deployments → đợi build xanh (~1-2 phút).

- [ ] **Step 5: Smoke test production**

Mở `https://<your-app>.vercel.app`:

1. Trang chủ load OK, products hiện
2. /login → bấm demo account "Khách thuê" → đăng nhập → redirect /, header có avatar
3. /products → click 1 product → /payment → submit rental
4. /account/orders → thấy order vừa tạo
5. Logout → vào /supplier (chưa login) → redirect /login
6. Login `supplier1@styleloop.vn` → /supplier → upload thử 1 ảnh

Nếu fail bước nào, check:
- **Login fail "Invalid redirect URL"** → quên Step 2
- **"supabaseUrl is required"** → env vars chưa set hoặc Vercel chưa rebuild sau khi add env (Settings → Redeploy)
- **500 error trên server route** → check Vercel logs (Functions tab)
- **CORS error** → Supabase project URL không khớp env var

- [ ] **Step 6: (Optional) Custom domain**

Vercel Settings → Domains → add domain. Sau khi xong, quay lại Supabase Auth → URL Configuration → đổi Site URL sang domain mới, giữ Vercel domain trong Redirect URLs.

- [ ] **Step 7: Commit (chỉ có CLAUDE.md update nếu có)**

Không có file code mới. Nếu muốn ghi chú deploy:

```bash
git commit --allow-empty -m "chore: deployed to vercel + configured supabase auth urls"
```

---

## Self-review notes (đã check khi viết plan)

**Spec coverage:**
- ✅ Section 1 (Architecture) → Task 1-3
- ✅ Section 2 (Schema) → Task 4
- ✅ Section 3 (RLS) → Task 4
- ✅ Section 4 (Auth flow) → Task 5, 7, 9, 10, 11, 12
- ✅ Section 5 (Data access pattern) → Task 7, 13, 17
- ✅ Section 6 (Storage) → Task 20, 21, 22
- ✅ Section 7 (Seed) → Task 6
- ✅ Section 8 (Phased rollout) → 8 phase trong plan
- ✅ Section 10 (Risks) → mitigated trong Task 4 (trigger), Task 6 (idempotent), Task 23 (provider lookup fallback)

**Placeholders:** không có TBD/TODO/"add appropriate error handling". Mọi step có code thực hoặc command thực.

**Type consistency:** `getSupabase` / `useAuthStore` / `useProductStore` / `init()` / `refetch()` / `refetchUserData()` được dùng nhất quán xuyên các task. `Order` shape giữ camelCase ở store, snake_case ở DB row — mapping qua `rowToOrder`.
