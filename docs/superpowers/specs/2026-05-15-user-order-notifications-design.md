# User Order Notifications — Design Spec

**Status:** Approved 2026-05-15
**Scope:** Hiển thị thông báo cho khách (role `user`) mỗi khi supplier (provider) đổi trạng thái đơn hàng (confirmed / completed / cancelled).

---

## 1. Bối cảnh

Hệ thống đã có 1 luồng notification: **admin duyệt/từ chối product_submission của supplier** → bell hiện cho supplier. Pattern hiện tại:

- Không có bảng `notifications` riêng — derive thẳng từ bảng nghiệp vụ (`product_submissions`) + cột `reviewed_at` (migration 0005).
- Hook `useGetSupplierNotifications` query trực tiếp.
- "Last seen" lưu localStorage per-user (`useNotificationsLastSeen`).
- Bell UI nằm trong `components/site-header.tsx`, gated `user?.role === "supplier"`, gồm 1 dropdown (desktop) + 1 sheet (mobile).

Spec này thêm luồng tương đương cho **khách** (role `user`), tái dùng cùng pattern.

---

## 2. Quyết định chính

| Chủ đề | Quyết định |
|---|---|
| Trigger | Supplier (hoặc admin) đổi `orders.status` sang `confirmed` / `completed` / `cancelled`. |
| Người nhận | Khách (`user_id` của đơn). |
| Lưu trữ | Derive từ bảng `orders` — thêm cột `status_updated_at` + DB trigger. Không tạo bảng `notifications` riêng. |
| 1 đơn = 1 notif | Chỉ giữ trạng thái mới nhất. Nếu pending→confirmed→completed thì notif là "Đã hoàn tất". Lịch sử chi tiết xem ở `/account/ordered`. |
| Read state | localStorage per `(scope, userId)`, scope = `supplier` \| `user`. |
| Polling | `refetchInterval: 60_000` (1 phút) — near-real-time không cần Supabase Realtime. |
| Bell visibility | `user.role === "supplier" \|\| user.role === "user"`. Admin không có bell. |
| Out of scope | Cancel reason, admin bell, Realtime, email/push, lịch sử transition đầy đủ, per-notif read. |

---

## 3. Data layer

### 3.1 Migration `supabase/migrations/0006_order_status_updated_at.sql`

```sql
-- Add column + trigger to track when orders.status changes (notification flow for users)
alter table public.orders
  add column if not exists status_updated_at timestamptz;

create or replace function public.set_order_status_updated_at()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    new.status_updated_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists orders_status_updated_at_trg on public.orders;
create trigger orders_status_updated_at_trg
  before update on public.orders
  for each row execute function public.set_order_status_updated_at();

-- Backfill: đơn đã không còn pending nhưng chưa có timestamp → dùng created_at để sort không lỗi.
update public.orders
  set status_updated_at = created_at
  where status <> 'pending' and status_updated_at is null;
```

**Tại sao trigger DB, không phải app code:** atomic với change, bao luôn trường hợp admin direct update qua dashboard, không phụ thuộc mọi consumer phải nhớ set timestamp.

### 3.2 Type — `lib/queries/notifications/types.ts`

Thêm:
```ts
export type UserOrderNotification = {
  id: string                                       // order id
  status: "confirmed" | "completed" | "cancelled"
  productName: string
  productSrc: string
  statusUpdatedAt: string                          // ISO timestamp
}
```

### 3.3 Hook — `lib/queries/notifications/useGetUserOrderNotifications.ts`

- `enabled: !!user && user.role === "user"`
- Query `orders` của user hiện tại, `select id, product_name, product_src, status, status_updated_at`
- Filter: `.neq("status", "pending")` + `.not("status_updated_at", "is", null)`
- Order `status_updated_at desc`, limit 20
- `refetchInterval: 60_000` để gần real-time

### 3.4 Query key — `lib/queries/queryKeys.ts`

```ts
notifications: {
  all: ["notifications"] as const,
  supplier: (uid: string) => [...notifications.all, "supplier", uid] as const,
  userOrders: (uid: string) => [...notifications.all, "userOrders", uid] as const,
}
```

### 3.5 Invalidation — `useUpdateOrderStatus.ts`

Hiện đang invalidate `queryKeys.orders.all` khi mutation thành công. Bổ sung invalidate `queryKeys.notifications.all` để nếu user đang mở bell trong cùng browser (vd: dev test với 2 role), bell update ngay.

### 3.6 Refactor — `useNotificationsLastSeen(scope)`

Nhận thêm tham số `scope: "supplier" | "user"`. Storage key đổi từ `styleloop-supplier-notif-seen-{uid}` → `styleloop-notif-seen-{scope}-{uid}`. Supplier hiện tại sẽ reset (1 lần) — chấp nhận vì là cosmetic state.

---

## 4. UI — `components/site-header.tsx`

### 4.1 Gate

Hiện: `{authed && user?.role === "supplier" && (...bell blocks...)}`
Mới: `{authed && (user?.role === "supplier" || user?.role === "user") && (...bell blocks...)}`

### 4.2 Chọn dataset theo role

```tsx
const isSupplier = user?.role === "supplier"
const { data: supplierNotifs = [] } = useGetSupplierNotifications()
const { data: userOrderNotifs = [] } = useGetUserOrderNotifications()
const notifScope = isSupplier ? "supplier" : "user"
const { isUnread, markAllSeen } = useNotificationsLastSeen(notifScope)
```

Mỗi notif (cả 2 luồng) chuẩn hoá thành 1 "view model" chung trước khi render:

```ts
type NotifVM = {
  id: string
  href: string                                      // điều hướng khi click
  productName: string
  productSrc: string
  timestamp: string                                 // ISO
  badgeLabel: string                                // "Được duyệt" / "Đã xác nhận" / ...
  badgeStyle: "approved" | "rejected" | "neutral"   // map sang class
  detail?: string                                   // optional sub line (reject reason)
}
```

### 4.3 Mapping (user side)

| status | badgeLabel | badgeStyle | href |
|---|---|---|---|
| `confirmed` | "Đã xác nhận" | `approved` (xanh/tan nhạt) | `/account/ordered` |
| `completed` | "Đã hoàn tất" | `neutral` (camel/tan) | `/account/ordered` |
| `cancelled` | "Đã huỷ" | `rejected` (espresso) | `/account/ordered` |

### 4.4 Badge count

`notifications.filter(vm => isUnread(vm.timestamp)).length` — giống supplier logic, không phải `notifications.length`.

---

## 5. Edge cases

- User logout/login khác account → query key + storage key đều theo `user.id` → tự reset.
- Đơn bị xoá → notif biến mất sau lần refetch tiếp theo.
- Race confirmed → completed trong < 60s → poll tick tiếp theo cập nhật badge sáng lại.
- Admin direct update orders → trigger DB chạy → user vẫn nhận notif.
- `pending` không bao giờ tạo notif (filter ở query).

---

## 6. Files touched

| File | Loại |
|---|---|
| `supabase/migrations/0006_order_status_updated_at.sql` | new |
| `lib/queries/notifications/types.ts` | edit (+UserOrderNotification) |
| `lib/queries/notifications/useGetUserOrderNotifications.ts` | new |
| `lib/queries/notifications/useNotificationsLastSeen.ts` | edit (+scope) |
| `lib/queries/notifications/index.ts` | edit (export) |
| `lib/queries/queryKeys.ts` | edit (+userOrders) |
| `lib/queries/orders/useUpdateOrderStatus.ts` | edit (invalidate notifications) |
| `components/site-header.tsx` | edit (bell cho role=user, view-model thống nhất) |

---

## 7. Out of scope (v1)

- Cancel reason text (cần thêm cột + UI cho supplier nhập)
- Bell cho admin
- Supabase Realtime push
- Email/SMS/push notification
- Notification cho whitelist out-of-stock / supplier message / v.v.
- Lịch sử transition đầy đủ
- Mark-as-read từng notif (chỉ có mark-all-seen)
