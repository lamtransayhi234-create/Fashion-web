# Admin — Users & Suppliers Management Page

**Status:** Approved 2026-05-18 (pending implementation)
**Owner:** Admin role
**Scope:** New route `/admin/users` for admin to list, filter, search, and delete user / supplier accounts.

---

## 1. Goal

Cho phép admin xem toàn bộ tài khoản `user` và `supplier` trong hệ thống, lọc theo role, tìm theo tên/email, và **xoá vĩnh viễn** một tài khoản (cùng dữ liệu cascade liên quan).

Trang admin hiện tại (`app/(home)/admin/page.tsx`) chỉ làm việc duyệt sản phẩm; trang mới là một surface độc lập, không thay đổi trang cũ.

## 2. Non-goals (v1)

- Cột thống kê số products / orders trên từng row.
- Pagination, sort UI (list nhỏ → fetch hết + filter client-side).
- Tạo / sửa user thủ công (đã có register flow công khai cho user/supplier).
- Bulk delete.
- Audit log của hành động xoá.
- Soft delete / khôi phục tài khoản đã xoá.
- Quản lý role giữa admin với nhau (admin bị ẩn khỏi danh sách hoàn toàn).

## 3. Architecture overview

### 3.1 Files

**Tạo mới:**
- `app/(home)/admin/users/page.tsx` — client page, table + filter + search + delete dialog.
- `app/api/admin/users/[id]/route.ts` — server `DELETE` endpoint dùng service-role key.
- `lib/queries/users/useGetAdminUsers.ts` — fetch list profiles (role ≠ admin).
- `lib/queries/users/useDeleteUser.ts` — mutation gọi DELETE endpoint trên.
- `lib/queries/users/index.ts` — barrel.
- `components/skeletons/admin-users-skeleton.tsx` — match table layout.

**Sửa:**
- `lib/queries/queryKeys.ts` — thêm `users` block.
- `components/skeletons/index.ts` — export `AdminUsersSkeleton`.
- `components/site-header.tsx` — thêm link "Quản lý người dùng" vào admin nav.

### 3.2 Data layer

**Query keys** (extend factory):

```ts
users: {
  all: ["users"] as const,
  list: () => [...queryKeys.users.all, "list"] as const,
},
```

**`useGetAdminUsers()`:**

```ts
export type AdminUserRow = {
  id: string
  email: string
  name: string
  role: "user" | "supplier"   // admin filtered out at query
  avatar: string | null
  shop_name: string | null
  created_at: string
}

export function useGetAdminUsers() {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: async (): Promise<AdminUserRow[]> => {
      const { data, error } = await getSupabase()
        .from("profiles")
        .select("id, email, name, role, avatar, shop_name, created_at")
        .in("role", ["user", "supplier"])
        .order("created_at", { ascending: false })
      if (error) throw error
      return (data ?? []) as AdminUserRow[]
    },
    staleTime: 60 * 1000,
  })
}
```

Lý do filter `role` ở DB: RLS `profiles_select_authenticated` cho mọi authenticated đọc, nên cần filter để admin không thấy admin khác và payload nhỏ hơn.

**`useDeleteUser()`:**

```ts
export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "delete_failed")
      return json
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.all }),
  })
}
```

### 3.3 Server route — `app/api/admin/users/[id]/route.ts`

Xử lý 3 bước:
1. Verify caller session + role admin (cookie-based, `createSupabaseServerClient`).
2. Self-delete guard (`caller.id === id` → 400).
3. Gọi `supabase.auth.admin.deleteUser(id)` qua client service-role.

```ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin")
    return NextResponse.json({ error: "forbidden" }, { status: 403 })

  if (user.id === id)
    return NextResponse.json({ error: "cannot_delete_self" }, { status: 400 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
```

### 3.4 Cascade behavior (sẵn có từ migration 0004)

```
auth.users  (DELETE)
  └─ CASCADE → public.profiles
       ├─ CASCADE  → products             (supplier's listings)
       ├─ CASCADE  → product_submissions  (supplier's submissions)
       ├─ CASCADE  → orders.user_id        (orders placed by user)
       ├─ SET NULL → orders.provider_id    (preserve buyer's order; snapshot fields keep display data)
       └─ CASCADE  → whitelist             (user's wishlist)
```

Không cần migration mới.

### 3.5 Environment

Thêm vào `.env.local` (server-only, KHÔNG có prefix `NEXT_PUBLIC_`):

```
SUPABASE_SERVICE_ROLE_KEY=<lấy từ Supabase Dashboard → Project Settings → API → service_role>
```

Sau khi thêm: restart `pnpm dev`.

## 4. UI design

Tuân theo CLAUDE.md — Playfair Display, palette beige/tan/espresso, hairline borders, slim radii, uppercase tracking labels.

### 4.1 Layout

```
─ ✦ QUẢN TRỊ VIÊN ✦ ─

[Shield icon]  Quản lý người dùng
                {admin.name} · Quản trị viên

┌────────────────┐  ┌────────────────┐
│   {N} KHÁCH    │  │   {N} CUNG     │   ← 2 mini stat cards
│      THUÊ      │  │      CẤP       │
└────────────────┘  └────────────────┘

[Tất cả] [Khách thuê] [Cung cấp]    🔍 Tìm theo tên / email

┌─────────────────────────────────────────────────────────────────┐
│ NGƯỜI DÙNG          EMAIL              ROLE       THAM GIA   ⋯  │
├─────────────────────────────────────────────────────────────────┤
│ 🟤 Bảo Nguyễn       supplier1@...     SUPPLIER   12/02/26   🗑  │
│    Bảo Closet                                                    │
├─────────────────────────────────────────────────────────────────┤
│ 🟤 An Nguyễn        user1@...         USER       05/04/26   🗑  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Column spec

| Col | Content |
|---|---|
| Người dùng | Avatar (size-10, ring-1 beige) + tên (espresso, font-medium). Với supplier: thêm `shop_name` dòng secondary (sub color, text-[11px]). |
| Email | Mono-ish via Playfair regular, sub color. |
| Role | Pill badge uppercase `tracking-[0.14em]`. `user` → sand bg + espresso. `supplier` → camel bg + cream. |
| Tham gia | Date `dd/MM/yy` Vietnamese locale. |
| Action | Icon-only `Trash2` (size-4, stroke 1.4) trong button `rounded-md` hover bg warm-red translucent. |

### 4.3 Filter + search

- 3 chips: "Tất cả" / "Khách thuê" / "Cung cấp". Active = espresso bg + cream text. Inactive = transparent + hairline border.
- Search input: `rounded-full`, icon `Search` lucide, debounce không cần (client filter trực tiếp).
- Logic: `useMemo` filter `data` theo `selectedRole` ('all' | 'user' | 'supplier') + `searchQuery` (match `name.toLowerCase()` hoặc `email.toLowerCase()`).

### 4.4 Stat cards

2 card (KHÁCH THUÊ / CUNG CẤP) hiển thị tổng count theo role trên **toàn list** (không phụ thuộc filter), pattern card editorial: white surface, ring-1 beige, slim radius, value text-[28px] Playfair bold, label uppercase tracking-[0.14em].

### 4.5 Delete dialog (simple)

Dùng `Dialog` component pattern y hệt `app/(home)/admin/page.tsx:234-264`:
- Camel ribbon trên cùng.
- Icon `Trash2` trong vòng tròn warm-red (`oklch(0.92 0.08 25)`).
- Tiêu đề Playfair `text-[22px] font-medium`: "Xoá tài khoản người dùng?"
- Mô tả 13px sub: "Hành động không thể hoàn tác. Toàn bộ dữ liệu của **{name}** sẽ bị xoá vĩnh viễn."
- 2 nút: "Xác nhận xoá" (bg warm-red, white text) + "Đóng" (outline).
- Khi `mutation.isPending`: disable nút confirm + label đổi "Đang xoá...".

### 4.6 States

| State | Render |
|---|---|
| `!hydrated \|\| isLoading` | `<AdminUsersSkeleton />` |
| `!user \|\| user.role !== 'admin'` | redirect — `useEffect` giống admin page hiện tại |
| `data.length === 0` | Empty state: icon `Users` trong vòng tròn sand, "Chưa có người dùng nào" |
| Filter rỗng kết quả | Empty state: "Không tìm thấy người dùng phù hợp với bộ lọc" |
| Delete success | Toast espresso "Đã xoá tài khoản {name}" (pattern toast của admin page) |
| Delete fail | Toast warm-red "Xoá thất bại: {error}" |

### 4.7 Skeleton

`AdminUsersSkeleton`: lặp 6 row giả lập. Mỗi row layout giống thật: pulse circle (avatar) + 4 pulse bars (name/email/role/date) + 1 pulse square (action). Hairline divider giữa rows. Cũng render 2 stat-card pulse ở trên.

### 4.8 Header nav

Trong `components/site-header.tsx`, ở phần dropdown / link cho admin:
- Nếu đã có dropdown menu → thêm `DropdownMenuItem` "Quản lý người dùng" → `/admin/users`.
- Nếu chỉ có 1 link "Quản trị" → giữ "Duyệt sản phẩm" cho `/admin`, thêm "Quản lý người dùng" cho `/admin/users` thành dropdown 2 mục.

Exact pattern sẽ verify khi đọc file ở implementation.

## 5. Auth & security

| Layer | Check |
|---|---|
| Client page | `useEffect` → nếu `!user` redirect `/login`, nếu `user.role !== 'admin'` redirect `/`. Giống `app/(home)/admin/page.tsx:297-301`. |
| Server route | Verify session + profile.role = admin + `caller.id !== target.id`. |
| RLS | `profiles_delete_admin` cho phép admin delete profile row, nhưng route dùng service-role nên RLS bypassed — chấp nhận được vì check role thủ công ở server. |
| Service role key | Chỉ tồn tại trong env server (không prefix `NEXT_PUBLIC_`). Không bao giờ import vào client bundle. |
| Self-delete | Block ở server (400 `cannot_delete_self`). Client ẩn admin khỏi list nên không có nút xoá admin nào hiện ra. |

## 6. Error handling

| Case | Behavior |
|---|---|
| Network fail khi fetch list | Query error → render empty state + toast (TanStack Query mặc định retry 3 lần) |
| 401 / 403 từ DELETE | Toast "Bạn không có quyền". Không invalidate. |
| 400 `cannot_delete_self` | Toast "Không thể tự xoá chính mình". (Edge case — UI đã ẩn admin) |
| 500 từ service-role | Toast "Xoá thất bại: {message}". |

## 7. Testing checklist

- [ ] Admin login → vào `/admin/users` thấy list user + supplier, không thấy admin nào.
- [ ] User thường login → vào `/admin/users` → redirect `/`.
- [ ] Chưa login → vào `/admin/users` → redirect `/login`.
- [ ] Filter "Khách thuê" → chỉ rows role=user.
- [ ] Filter "Cung cấp" → chỉ rows role=supplier.
- [ ] Search "bảo" → match name (case-insensitive).
- [ ] Search "supplier1@" → match email (case-insensitive).
- [ ] Xoá 1 supplier có products → confirm dialog → products của supplier đó biến mất khỏi `/shop`, orders cũ của buyer còn nhưng tên supplier null/snapshot.
- [ ] Xoá 1 user có orders → confirm → orders của user đó biến mất, không ảnh hưởng supplier.
- [ ] User đã bị xoá thử login lại → thất bại (auth account không còn).
- [ ] Cố curl DELETE /api/admin/users/{any} không cookie → 401.
- [ ] Cố curl DELETE với cookie của user thường → 403.
- [ ] Stat cards count đúng theo role tổng (không bị filter).
- [ ] Skeleton render đủ 1 chu kỳ trước khi data về.
- [ ] Toast success / fail hoạt động.

## 8. Open questions

Không có — tất cả quyết định đã được chốt qua brainstorming.

## 9. References

- Existing admin page: `app/(home)/admin/page.tsx`
- Supabase setup: `docs/superpowers/specs/2026-05-14-supabase-migration-design.md`
- Cascade migration: `supabase/migrations/0004_profile_fk_on_delete.sql`
- Design system: `CLAUDE.md`
