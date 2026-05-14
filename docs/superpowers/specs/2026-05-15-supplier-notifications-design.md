# Supplier Notifications — Design Spec

**Date:** 2026-05-15
**Status:** Approved

---

## Overview

Khi admin approve hoặc reject sản phẩm supplier đã đăng (qua `/admin`), supplier nhận được thông báo dạng list trên header. UI giống pattern pending orders đã có. Triển khai theo cách đơn giản nhất: không tạo bảng `notifications` riêng, mà derive trực tiếp từ `product_submissions` + dùng `localStorage` để track "đã đọc".

**Decisions từ brainstorming:**
- Storage: **Derive từ `product_submissions`** (cách dễ nhất, không cần table mới)
- UI: **Icon Bell riêng** cho supplier, đứng cạnh icon `ClipboardList` (pending orders)
- Scope: chỉ admin → supplier (1 chiều). Không có realtime, chỉ refetch khi mount

---

## 1. Schema Change

### Migration `0005_submission_reviewed_at.sql`

```sql
alter table public.product_submissions
  add column if not exists reviewed_at timestamptz;

-- Backfill: với những submission đã được approve/reject trước đó,
-- set reviewed_at = submitted_at (chấp nhận estimate vì không có lịch sử thực).
update public.product_submissions
  set reviewed_at = submitted_at
  where upload_status in ('approved', 'rejected')
    and reviewed_at is null;
```

Cập nhật `lib/supabase/types.ts`: thêm `reviewed_at: string | null` vào `ProductSubmissionsRow` (và Insert/Update tương ứng).

---

## 2. Mutation Updates

`lib/queries/products/useApproveProduct.ts` — update payload thêm `reviewed_at`:
```ts
.update({ upload_status: "approved", product_id: productId, reviewed_at: new Date().toISOString() } as never)
```

`lib/queries/products/useRejectProduct.ts` — tương tự:
```ts
.update({ upload_status: "rejected", reject_reason: reason, reviewed_at: new Date().toISOString() } as never)
```

Cả 2 mutation đã `invalidateQueries({ queryKey: queryKeys.submissions.all })` — query notifications dùng cùng key prefix nên auto refresh.

---

## 3. Query Hook

### `lib/queries/queryKeys.ts` — thêm

```ts
notifications: {
  all: ["notifications"] as const,
  supplier: (userId: string) => [...queryKeys.notifications.all, "supplier", userId] as const,
},
```

> Note: chia sẻ với submissions key qua queryKeys.submissions.all KHÔNG đủ để invalidate notifications. Mutation cần invalidate **cả** `submissions.all` **và** `notifications.all`.

### `lib/queries/notifications/useGetSupplierNotifications.ts`

```ts
"use client"

import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/queries/queryKeys"
import { getSupabase } from "@/lib/supabase/client"
import { useAuthStore } from "@/lib/store/auth-store"

export type SupplierNotification = {
  id: string                          // submission id (đủ unique cho key)
  type: "approved" | "rejected"
  productName: string
  productSrc: string
  rejectReason?: string
  reviewedAt: string                  // ISO timestamp
}

export function useGetSupplierNotifications() {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: queryKeys.notifications.supplier(user?.id ?? ""),
    enabled: !!user && user.role === "supplier",
    queryFn: async (): Promise<SupplierNotification[]> => {
      if (!user) return []
      const { data, error } = await getSupabase()
        .from("product_submissions")
        .select("id, name, src, upload_status, reject_reason, reviewed_at")
        .eq("supplier_id", user.id)
        .in("upload_status", ["approved", "rejected"])
        .not("reviewed_at", "is", null)
        .order("reviewed_at", { ascending: false })
        .limit(20)
      if (error) throw error
      return (data ?? []).map((r) => ({
        id: r.id,
        type: r.upload_status as "approved" | "rejected",
        productName: r.name,
        productSrc: r.src,
        rejectReason: r.reject_reason ?? undefined,
        reviewedAt: r.reviewed_at!,
      }))
    },
  })
}
```

### `lib/queries/notifications/useNotificationsLastSeen.ts`

```ts
"use client"

import { useEffect, useState, useCallback } from "react"

import { useAuthStore } from "@/lib/store/auth-store"

const KEY_PREFIX = "styleloop-supplier-notif-seen-"

/**
 * localStorage-backed "last seen" timestamp per user.
 * isUnread(notification) = notification.reviewedAt > lastSeen.
 */
export function useNotificationsLastSeen() {
  const user = useAuthStore((s) => s.user)
  const [lastSeen, setLastSeen] = useState<number>(0)

  // Đọc từ localStorage khi user thay đổi (login/logout)
  useEffect(() => {
    if (!user) {
      setLastSeen(0)
      return
    }
    const stored = window.localStorage.getItem(KEY_PREFIX + user.id)
    setLastSeen(stored ? Date.parse(stored) : 0)
  }, [user])

  const markAllSeen = useCallback(() => {
    if (!user) return
    const now = new Date().toISOString()
    window.localStorage.setItem(KEY_PREFIX + user.id, now)
    setLastSeen(Date.parse(now))
  }, [user])

  const isUnread = useCallback(
    (reviewedAt: string) => Date.parse(reviewedAt) > lastSeen,
    [lastSeen],
  )

  return { lastSeen, markAllSeen, isUnread }
}
```

### `lib/queries/notifications/index.ts`

```ts
export { useGetSupplierNotifications } from "./useGetSupplierNotifications"
export type { SupplierNotification } from "./useGetSupplierNotifications"
export { useNotificationsLastSeen } from "./useNotificationsLastSeen"
```

---

## 4. UI — `components/site-header.tsx`

### State + data
Thêm bên cạnh `pendingOrders`:

```tsx
const { data: notifications = [] } = useGetSupplierNotifications()
const { isUnread, markAllSeen } = useNotificationsLastSeen()
const unreadNotifCount = notifications.filter((n) => isUnread(n.reviewedAt)).length
const [notifOpen, setNotifOpen] = useState(false)
```

### Icon trong header (chỉ render khi `user.role === "supplier"`)

Đặt **trước** `ClipboardList` (notifications quan trọng hơn về visual hierarchy):

```tsx
<DropdownMenu
  open={notifOpen}
  onOpenChange={(open) => {
    setNotifOpen(open)
    if (open) markAllSeen()       // mở dropdown = đã thấy hết
  }}
>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon" aria-label="Thông báo"
      className="relative hidden size-10 cursor-pointer rounded-full text-[oklch(0.34_0.03_55)] hover:bg-[oklch(0.91_0.022_75)] hover:text-[oklch(0.6_0.062_60)] lg:inline-flex">
      <Bell className="size-5" strokeWidth={1.4} />
      {unreadNotifCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[oklch(0.55_0.18_28)] text-[10px] font-bold text-white ring-2 ring-[oklch(0.965_0.012_78)]">
          {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
        </span>
      )}
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" sideOffset={10}
    className="w-80 rounded-md border border-[oklch(0.86_0.018_70)] bg-[oklch(0.99_0.008_78)] p-0 shadow-[0_24px_60px_-20px_oklch(0.34_0.03_55/0.3)]">
    {/* Header */}
    <div className="flex items-center justify-between border-b border-[oklch(0.9_0.014_72)] px-4 py-3">
      <p className="text-[10px] font-semibold tracking-[0.28em] text-[oklch(0.4_0.024_55)] uppercase">
        ✦ Thông báo
      </p>
      {notifications.length > 0 && (
        <span className="text-[11px] text-[oklch(0.55_0.024_60)]">
          {notifications.length} tin
        </span>
      )}
    </div>

    {/* Empty state hoặc list */}
    {notifications.length === 0 ? (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <Bell className="size-8 text-[oklch(0.78_0.04_70)]" strokeWidth={1.2} />
        <p className="text-[12px] text-[oklch(0.55_0.024_60)]">Chưa có thông báo</p>
      </div>
    ) : (
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.map((n) => {
          const unread = isUnread(n.reviewedAt)
          const isApproved = n.type === "approved"
          return (
            <Link
              key={n.id}
              href="/supplier"
              onClick={() => setNotifOpen(false)}
              className={cn(
                "relative flex items-start gap-3 border-b border-[oklch(0.95_0.012_76)] px-3 py-2.5 transition-colors last:border-0 hover:bg-[oklch(0.97_0.012_78)]",
                unread && "bg-[oklch(0.96_0.012_78)]",
              )}
            >
              {unread && (
                <span className="absolute top-3.5 left-1.5 size-1.5 rounded-full bg-[oklch(0.6_0.062_60)]" />
              )}
              <div className="size-12 shrink-0 overflow-hidden rounded-md bg-[oklch(0.94_0.014_75)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={n.productSrc} alt={n.productName} className="size-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-[oklch(0.18_0.014_55)]">
                  {n.productName}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5">
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.12em] uppercase",
                    isApproved
                      ? "bg-[oklch(0.91_0.022_75)] text-[oklch(0.34_0.03_55)]"
                      : "bg-[oklch(0.18_0.014_55)] text-[oklch(0.94_0.014_75)]",
                  )}>
                    {isApproved ? "Được duyệt" : "Từ chối"}
                  </span>
                  <span className="text-[11px] text-[oklch(0.55_0.024_60)]">
                    {formatRelative(n.reviewedAt)}
                  </span>
                </p>
                {!isApproved && n.rejectReason && (
                  <p className="mt-1 truncate text-[11px] italic text-[oklch(0.55_0.024_60)]">
                    Lý do: {n.rejectReason}
                  </p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    )}

    {/* Footer */}
    {notifications.length > 0 && (
      <div className="border-t border-[oklch(0.9_0.014_72)] p-2">
        <Link href="/supplier" onClick={() => setNotifOpen(false)}
          className="flex w-full items-center justify-center rounded-sm py-2 text-[11px] font-semibold tracking-[0.14em] text-[oklch(0.6_0.062_60)] uppercase transition-colors hover:bg-[oklch(0.94_0.014_75)]">
          Xem tất cả →
        </Link>
      </div>
    )}
  </DropdownMenuContent>
</DropdownMenu>
```

### Helper `formatRelative`

Dùng `date-fns/formatDistance` (đã có dep `date-fns`):

```tsx
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"

function formatRelative(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: vi })
}
```

Output: "2 giờ trước", "3 ngày trước", v.v.

---

## 5. Cache Invalidation

Đảm bảo khi admin approve/reject:
- Invalidate `queryKeys.submissions.all` → /admin page refresh
- Invalidate `queryKeys.notifications.all` → supplier's Bell badge refresh (nếu supplier đang online cùng lúc, tab khác)

Update `useApproveProduct.ts` + `useRejectProduct.ts`:
```ts
onSuccess: () => {
  qc.invalidateQueries({ queryKey: queryKeys.submissions.all })
  qc.invalidateQueries({ queryKey: queryKeys.products.all })   // chỉ cho approve
  qc.invalidateQueries({ queryKey: queryKeys.notifications.all })
}
```

---

## 6. Out of Scope (lần này)

- ❌ Realtime push (Supabase Realtime subscription) — vẫn dùng cache + invalidate
- ❌ Email notification — backend ko gửi mail
- ❌ Admin/User notifications (chỉ supplier nhận)
- ❌ Persistent `notifications` table với read state cross-device — local storage thôi, mỗi device 1 trạng thái
- ❌ Mark individual as read — chỉ "mark all" khi mở dropdown
- ❌ Filter / paginate — limit 20 most recent là đủ

---

## 7. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Supplier dùng 2 thiết bị — đọc trên 1, vẫn unread trên thiết bị khác | Acceptable cho v1. Nâng cấp sau với DB-backed read state nếu cần. |
| Backfill update `reviewed_at = submitted_at` không chính xác về thời điểm review | Estimate đủ tốt cho dữ liệu cũ (chỉ ảnh hưởng sort thứ tự, không sai logic) |
| Bell + ClipboardList trên mobile có thể chiếm chỗ | Chỉ render trên `lg:` (giống pattern hiện tại), mobile dùng sheet/drawer riêng. Lần này không xử lý mobile dropdown — chỉ icon, click → /supplier. |
| Race: admin click reject 2 lần liên tiếp | RLS đã có policy "chỉ update pending" — lần 2 sẽ no-op. Notification tạo 1 lần. |
