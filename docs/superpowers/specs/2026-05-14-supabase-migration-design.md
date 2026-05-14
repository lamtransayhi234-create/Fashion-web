# Supabase Migration — Design Spec

**Date:** 2026-05-14
**Status:** Approved

---

## Overview

Chuyển toàn bộ persistence layer của StyleLoop từ Zustand `persist` (localStorage) sang Supabase (Postgres + Auth + Storage). Giữ nguyên shape của Zustand store hiện tại, chỉ thay nguồn dữ liệu. Mục tiêu: nhiều user dùng chung database thật, password được hash, supplier upload ảnh thật, order/whitelist sync giữa các thiết bị.

**Decisions từ brainstorming:**
- Backend: **Supabase** (Postgres SQL hợp với data quan hệ + RLS cho role-based access)
- Scope: **Full migrate** — Auth + Products + Submissions + Orders + Whitelist
- Auth: **Supabase Auth chuẩn** (email/password, tắt email confirmation cho dễ dev)
- Seed: **5 demo account** (2 user + 2 supplier + 1 admin) + toàn bộ mock products (~30), products được remap đều về 2 supplier seed. Tài khoản khác user tự tạo qua UI register.
- Storage: **Có** — supplier upload ảnh thật thay vì paste URL

---

## 1. High-level Architecture

```
Next.js App Router (client + server components)
        │
        ├─── @supabase/ssr           (Server Component / Route Handler client)
        └─── @supabase/supabase-js   (Browser client, dùng trong Zustand stores)
                │
                ▼
        ┌───────────────────────────┐
        │  Supabase project         │
        │  ─ Postgres (5 bảng)      │
        │  ─ Auth (email/password)  │
        │  ─ Storage (1 bucket)     │
        │  ─ RLS policies           │
        └───────────────────────────┘
```

**Packages mới:**
- `@supabase/supabase-js`
- `@supabase/ssr`

**Env vars** (`.env.local`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (chỉ dùng cho seed script, **không commit**)

**File mới:**
- `lib/supabase/client.ts` — browser client (dùng cho client component + Zustand)
- `lib/supabase/server.ts` — server component client (dùng cookies)
- `lib/supabase/types.ts` — auto-generated từ `supabase gen types typescript`
- `supabase/migrations/0001_init.sql` — schema + RLS + trigger
- `supabase/seed.ts` — script seed mock data
- `.env.local.example` — template env

---

## 2. Database Schema (5 bảng)

### 2.1 Enums

```sql
CREATE TYPE user_role     AS ENUM ('user', 'admin', 'supplier');
CREATE TYPE order_status  AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE upload_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE payment_method AS ENUM ('bank', 'momo');
CREATE TYPE product_status AS ENUM ('available', 'out_of_stock');
```

### 2.2 `profiles`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | FK → `auth.users(id)` ON DELETE CASCADE |
| email | text NOT NULL | |
| name | text NOT NULL | |
| role | user_role NOT NULL DEFAULT 'user' | |
| phone | text | |
| address | text | |
| avatar | text | URL hoặc data: URL |
| shop_name | text | chỉ supplier |
| permissions | text[] | chỉ admin |
| created_at | timestamptz DEFAULT now() | |

**Trigger:** `handle_new_user()` — khi `auth.users` insert, tự tạo row trong `profiles` (đọc `name`, `role`, `shop_name`, `phone` từ `raw_user_meta_data`).

> Profile của supplier đóng vai trò luôn của "provider" — bỏ bảng `providers` riêng. Code hiện tại đã dùng `providerId = supplierId` nên không cần migrate logic.

### 2.3 `products`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK DEFAULT gen_random_uuid() | |
| src | text NOT NULL | URL ảnh (sau khi upload Storage) |
| name | text NOT NULL | |
| brand_price | numeric NOT NULL | |
| rental_price | numeric NOT NULL | |
| status | product_status DEFAULT 'available' | |
| description | text | |
| category | text NOT NULL | |
| type | text NOT NULL | |
| sizes | text[] NOT NULL | |
| color | text | |
| tags | text[] | |
| rating | smallint CHECK (rating IN (4,5)) | |
| provider_id | uuid NOT NULL | FK → `profiles(id)` |
| created_at | timestamptz DEFAULT now() | |

> `category`, `type`, `sizes` để text/text[] (không enum) vì list expand thường xuyên — validate ở app layer như hiện tại.

### 2.4 `product_submissions`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK DEFAULT gen_random_uuid() | |
| supplier_id | uuid NOT NULL | FK → `profiles(id)` |
| src | text NOT NULL | |
| name | text NOT NULL | |
| brand_price | numeric NOT NULL | |
| rental_price | numeric NOT NULL | |
| description | text | |
| category | text NOT NULL | |
| type | text NOT NULL | |
| sizes | text[] NOT NULL | |
| color | text | |
| tags | text[] | |
| upload_status | upload_status DEFAULT 'pending' | |
| reject_reason | text | |
| submitted_at | timestamptz DEFAULT now() | |
| product_id | uuid | FK → `products(id)`, nullable, set khi approve |

### 2.5 `orders`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK DEFAULT gen_random_uuid() | |
| user_id | uuid NOT NULL | FK → `profiles(id)` |
| provider_id | uuid NOT NULL | FK → `profiles(id)` |
| product_id | uuid NOT NULL | FK → `products(id)` |
| product_name | text NOT NULL | snapshot |
| product_src | text NOT NULL | snapshot |
| product_type | text NOT NULL | snapshot |
| size | text NOT NULL | |
| color | text | |
| from_date | date NOT NULL | |
| to_date | date NOT NULL | |
| nights | integer NOT NULL | |
| rental_price_per_day | numeric NOT NULL | snapshot giá tại lúc đặt |
| total | numeric NOT NULL | |
| deposit | numeric NOT NULL | |
| address | text NOT NULL | |
| phone | text NOT NULL | |
| payment_method | payment_method NOT NULL | |
| payment_method_label | text NOT NULL | |
| note | text | |
| status | order_status DEFAULT 'pending' | |
| created_at | timestamptz DEFAULT now() | |

> Snapshot field (`product_name`, `product_src`, `rental_price_per_day`...) giữ lại để order không bị thay đổi giá khi supplier update product sau.

### 2.6 `whitelist`

| Column | Type | Notes |
|---|---|---|
| user_id | uuid NOT NULL | FK → `profiles(id)` |
| product_id | uuid NOT NULL | FK → `products(id)` |
| created_at | timestamptz DEFAULT now() | |
| | | **PRIMARY KEY (user_id, product_id)** |

---

## 3. RLS Policies

Bật RLS cho **tất cả** bảng. Helper SQL function:

```sql
CREATE FUNCTION current_role() RETURNS user_role
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;
```

| Bảng | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | Authenticated: tất cả | Trigger only | Owner (id = auth.uid) | Admin |
| `products` | Public: status = 'available'; Authenticated: tất cả | Admin (approve flow) | Owner (provider_id = auth.uid) hoặc Admin | Admin |
| `product_submissions` | Owner (supplier_id = auth.uid) hoặc Admin | Owner | Owner (chỉ khi `upload_status = 'pending'`) hoặc Admin | Admin |
| `orders` | Owner (user_id = auth.uid) hoặc Provider (provider_id = auth.uid) hoặc Admin | Authenticated (user_id = auth.uid) | Provider hoặc Admin (đổi status) | Admin |
| `whitelist` | Owner | Owner | — | Owner |

---

## 4. Auth Flow

### 4.1 Settings trong Supabase Dashboard
- Email/password provider: **ON**
- Email confirmations: **OFF** (cho dev — sẽ bật lại khi production)
- Site URL: `http://localhost:3000`

### 4.2 Register

```ts
await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { name, role, shop_name, phone }  // → raw_user_meta_data
  }
})
```

Trigger `handle_new_user()` tự tạo row trong `profiles` lấy từ `raw_user_meta_data`.

### 4.3 Login / Logout

```ts
await supabase.auth.signInWithPassword({ email, password })
await supabase.auth.signOut()
```

### 4.4 Session hydration

Trong `lib/store/auth-store.ts`:
- Bỏ `persist` middleware
- Thêm `init()` action:
  - Gọi `supabase.auth.getSession()` → nếu có session, fetch `profiles` row → set `user`
  - Subscribe `supabase.auth.onAuthStateChange()` để sync state khi token refresh / logout từ tab khác
- Gọi `init()` 1 lần ở root layout (client provider component)

---

## 5. Data Access Pattern

**Nguyên tắc:** giữ shape của Zustand store hiện tại, chỉ thay nguồn data. Mỗi action giờ là async (gọi Supabase trước, update local state sau).

### 5.1 `auth-store` (mới)

```ts
type AuthState = {
  isAuthenticated: boolean
  user: PublicUser | null
  loading: boolean

  init: () => Promise<void>          // gọi 1 lần khi app mount
  login: (email, password) => Promise<Result>
  register: (input) => Promise<Result>
  logout: () => Promise<void>
  updateProfile: (patch) => Promise<void>

  addOrder: (data) => Promise<Order>
  updateOrderStatus: (id, status) => Promise<void>
  toggleWhitelist: (product) => Promise<void>

  // Derived data fetched on demand
  orders: Order[]
  whitelist: Product[]
  refetchOrdersAndWhitelist: () => Promise<void>
}
```

- Bỏ field `users: AuthUser[]` (DB nắm) và `currentUserId`
- `addOrder` insert vào `orders` table, sau đó refetch list
- `toggleWhitelist` insert/delete row trong `whitelist`, refetch
- Khi role là `admin` hoặc `supplier`, `refetchOrdersAndWhitelist` query thêm orders liên quan

### 5.2 `product-store` (mới)

```ts
type ProductState = {
  allProducts: Product[]
  submittedProducts: SubmittedProduct[]
  loading: boolean

  init: () => Promise<void>          // fetch products + submissions
  submitProduct: (data, supplier) => Promise<void>
  approveProduct: (id) => Promise<void>
  rejectProduct: (id, reason) => Promise<void>
}
```

- Bỏ field `dynamicProviders` (không còn cần — provider info nằm trong `profiles`)
- `init` fetch `products` (public read) + `product_submissions` (RLS filter theo role)
- `approveProduct` server-side: insert vào `products` + update `product_submissions.upload_status` + set `product_id`

### 5.3 `order-store` (KHÔNG đổi)

`pending: PendingRental | null` chỉ là draft state trước khi user submit — vẫn in-memory, không cần persist hay Supabase.

### 5.4 Provider info trên UI

Bất cứ chỗ nào hiện đang lookup `providers` array tĩnh → đổi thành query `profiles` where `role = 'supplier'`. Có thể tạo helper:

```ts
// lib/supabase/queries.ts
export async function getProviderById(id: string) {
  return supabase.from('profiles').select('id, name, shop_name, avatar, address').eq('id', id).single()
}
```

---

## 6. Storage — Image Upload

### 6.1 Bucket

- Tên: `product-images`
- Public: **YES** (read public, upload authenticated)

### 6.2 Storage policies

```sql
-- Anyone can read
CREATE POLICY "Public read" ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Only authenticated users can upload
CREATE POLICY "Authenticated upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Owner can delete their own files
CREATE POLICY "Owner delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

Path convention: `product-images/{supplier_id}/{uuid}-{filename}` — RLS lấy `supplier_id` từ first folder để check ownership.

### 6.3 Component mới

`components/image-uploader.tsx`:
- Input file (accept `image/*`)
- Preview thumbnail
- Upload via `supabase.storage.from('product-images').upload(...)` → return public URL
- Loading state + error handling
- Dùng trong `app/(home)/supplier/page.tsx` thay cho input URL hiện tại

---

## 7. Seed Script

`supabase/seed.ts` — Node script chạy với `SUPABASE_SERVICE_ROLE_KEY`:

### 7.1 Demo accounts (5 accounts cố định)

| Mock ID | Role | Email | Password | Tên / Shop |
|---|---|---|---|---|
| `u-001` | user | `user1@styleloop.vn` | `user123` | Linh Nguyễn |
| `u-002` | user | `user2@styleloop.vn` | `user123` | Trang Phạm |
| `a-001` | admin | `admin@styleloop.vn` | `admin123` | Vincent Lê |
| `s-001` | supplier | `supplier1@styleloop.vn` | `supplier123` | Bảo Lê / *Bảo Closet* |
| `s-002` | supplier | `supplier2@styleloop.vn` | `supplier123` | Yến Vũ / *Yến Vintage* |

Các tài khoản còn lại (user3, supplier3..5) trong MOCK arrays cũ **không seed** — user tự tạo thêm qua UI register nếu cần.

### 7.2 Script logic

1. Tạo 5 auth user qua Admin API:
   ```ts
   supabase.auth.admin.createUser({
     email, password,
     email_confirm: true,
     user_metadata: { mock_id, name, role, shop_name, phone, address, avatar }
   })
   ```
   - Trigger `handle_new_user()` tự tạo profile tương ứng
   - Lưu `user_metadata.mock_id` để mapping ở bước sau

2. Build map `mock_id → uuid_mới`. 2 supplier có id mới là `S1_UUID`, `S2_UUID`.

3. Đọc `products` từ `lib/data/products.ts`, **remap `providerId`** về 2 supplier seed bằng round-robin theo `mock_supplier_id`:
   - `s-001` → `S1_UUID`
   - `s-002` → `S2_UUID`
   - `s-003`, `s-004`, `s-005` → phân bổ luân phiên về `S1_UUID` / `S2_UUID` (vd: s-003→S1, s-004→S2, s-005→S1)
   - Mục đích: tất cả ~30 products có valid FK, mỗi supplier seed có data hiển thị trên trang shop

4. Batch insert ~30 products vào `products` table với `provider_id` đã remap.

Chạy: `pnpm tsx supabase/seed.ts`

**Idempotent:** Script check email exists (qua `supabase.auth.admin.listUsers`) trước khi tạo; nếu đã tồn tại thì skip user, vẫn upsert products theo tên (unique check).

---

## 8. Phased Rollout

Làm tuần tự, mỗi phase test xong mới qua phase sau:

| Phase | Nội dung | Verify |
|---|---|---|
| 1. **Setup** | Tạo project Supabase, install `@supabase/supabase-js` + `@supabase/ssr`, env vars, file `lib/supabase/client.ts` + `server.ts` | `supabase.from('_').select()` chạy không lỗi connection |
| 2. **Schema + RLS** | Viết `supabase/migrations/0001_init.sql`, apply lên project. Generate types: `pnpm dlx supabase gen types typescript --project-id=... > lib/supabase/types.ts` | Bảng + policies hiện trong dashboard |
| 3. **Seed** | Viết `supabase/seed.ts`, chạy seed | Đếm rows: 5 profiles (2 user + 2 supplier + 1 admin), ~30 products phân bổ về 2 supplier |
| 4. **Auth migrate** | Thay `auth-store.ts` Zustand: bỏ `persist`, dùng Supabase Auth. Update `register/page.tsx`, `login/page.tsx`, `account/page.tsx`, các nơi gọi `useAuthStore.persist.*` | Login bằng `user1@styleloop.vn` / `user123` thành công, refresh page vẫn login |
| 5. **Products + Submissions** | Thay `product-store.ts`. Update `app/(home)/products/`, `product/[id]/`, `admin/`, `supplier/` để gọi store async | List products hiện đúng, supplier submit pending, admin approve → xuất hiện trong shop |
| 6. **Orders + Whitelist** | Phần logic order/whitelist trong `auth-store` chuyển sang gọi Supabase. Update `payment/`, `account/orders/`, `account/ordered/`, like button | Đặt thuê 1 sản phẩm → record trong DB; like → row trong `whitelist` |
| 7. **Storage** | Tạo bucket + policies, viết `ImageUploader` component, gắn vào supplier form | Upload ảnh thật, URL hiển thị trên admin queue |
| 8. **Cleanup** | Bỏ `MOCK_*` arrays, bỏ tất cả import `lib/data/products.ts` ngoài seed, xoá field `users: AuthUser[]` còn sót, update `CLAUDE.md` ghi chú Supabase | `pnpm typecheck` + `pnpm lint` xanh |

---

## 9. Out of Scope (lần này)

- ❌ Email confirmation / forgot password flow (bật sau)
- ❌ OAuth (Google, Facebook) — chỉ email/password
- ❌ Server Actions để mutate — vẫn dùng client-side mutations qua Zustand
- ❌ Real-time subscriptions (order status update live) — fetch-on-mount là đủ
- ❌ Pagination cho products — tải hết 1 lần (~30 sản phẩm)
- ❌ Search server-side — vẫn filter client như hiện tại

Các mục này có thể thêm sau khi flow chính ổn định.

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Mock product IDs (prod-001...) bị thay bằng uuid mới → link `/product/[id]` cũ vỡ | Seed script ghi log mapping `old_id → new_uuid` để debug; UI luôn dùng id từ DB |
| RLS policy quá chặt → user không xem được data của mình | Test từng policy bằng SQL editor với `set role authenticated` + `set request.jwt.claims = ...` trước khi tích hợp UI |
| Trigger `handle_new_user` fail → user tạo được auth nhưng không có profile | Thêm `EXCEPTION WHEN ...` log, và check `profiles` exist sau `signUp` ở client; nếu thiếu thì retry insert |
| Service role key lộ trong git | Thêm `.env.local` vào `.gitignore` (verify), commit `.env.local.example` không có secret |
| Refactor lớn → break feature đang hoạt động | Phased rollout (8 phase), mỗi phase có verify cụ thể; commit từng phase riêng |
