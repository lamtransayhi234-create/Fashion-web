# Supplier Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Khi admin approve/reject sản phẩm supplier, supplier nhận được thông báo dạng list trên header (icon Bell + dropdown).

**Architecture:** Derive notifications từ bảng `product_submissions` sẵn có (thêm 1 column `reviewed_at`). Track read state bằng `localStorage` per user. UI mirror pattern pending orders dropdown. No new table, no realtime — chỉ cache + invalidate.

**Tech Stack:** Next.js 16 · React Query · Supabase · Zustand · date-fns · TanStack hooks · localStorage.

**Testing convention:** Không có test framework — verify bằng `pnpm typecheck` + manual smoke test trong browser.

**Spec gốc:** `docs/superpowers/specs/2026-05-15-supplier-notifications-design.md`

---

## Task 1: Migration — thêm `reviewed_at`

**Files:**
- Create: `supabase/migrations/0005_submission_reviewed_at.sql`

- [ ] **Step 1: Tạo file migration**

```sql
-- ============================================================
-- Thêm column reviewed_at vào product_submissions cho notification.
-- ============================================================

alter table public.product_submissions
  add column if not exists reviewed_at timestamptz;

-- Backfill: submission đã approve/reject trước đây không có timestamp review,
-- ước lượng = submitted_at để sort không lỗi.
update public.product_submissions
  set reviewed_at = submitted_at
  where upload_status in ('approved', 'rejected')
    and reviewed_at is null;
```

- [ ] **Step 2: User apply migration**

User vào Supabase Dashboard → SQL Editor → paste content → Run.
Expected: `Success. No rows returned.`
Verify: Table Editor → `product_submissions` → thấy cột `reviewed_at` mới. Vài row cũ đã có giá trị = submitted_at.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0005_submission_reviewed_at.sql
git commit -m "feat(notif): add reviewed_at column for submission timestamps"
```

---

## Task 2: Cập nhật TypeScript types

**Files:**
- Modify: `lib/supabase/types.ts`

- [ ] **Step 1: Thêm `reviewed_at` vào ProductSubmissionsRow**

Tìm block `type ProductSubmissionsRow = {` (gần đầu file, sau ProductsRow). Trước line `submitted_at:`, thêm:

```ts
  reviewed_at:    string | null
```

- [ ] **Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/types.ts
git commit -m "feat(notif): add reviewed_at to ProductSubmissionsRow type"
```

---

## Task 3: Thêm query key `notifications`

**Files:**
- Modify: `lib/queries/queryKeys.ts`

- [ ] **Step 1: Thêm `notifications` vào queryKeys**

Mở file. Sau block `providers: {...}`, trước dấu `} as const` cuối cùng, thêm dấu phẩy sau `providers` block rồi thêm:

```ts
  notifications: {
    all: ["notifications"] as const,
    supplier: (userId: string) =>
      [...queryKeys.notifications.all, "supplier", userId] as const,
  },
```

- [ ] **Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/queries/queryKeys.ts
git commit -m "feat(notif): add notifications query keys"
```

---

## Task 4: Hook `useGetSupplierNotifications`

**Files:**
- Create: `lib/queries/notifications/useGetSupplierNotifications.ts`

- [ ] **Step 1: Tạo file**

```ts
"use client"

import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/queries/queryKeys"
import { getSupabase } from "@/lib/supabase/client"
import { useAuthStore } from "@/lib/store/auth-store"

export type SupplierNotification = {
  id: string                          // submission id — unique enough cho React key
  type: "approved" | "rejected"
  productName: string
  productSrc: string
  rejectReason?: string
  reviewedAt: string                  // ISO timestamp
}

type Row = {
  id: string
  name: string
  src: string
  upload_status: "pending" | "approved" | "rejected"
  reject_reason: string | null
  reviewed_at: string | null
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
      return ((data ?? []) as Row[]).map((r) => ({
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

- [ ] **Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/queries/notifications/useGetSupplierNotifications.ts
git commit -m "feat(notif): add useGetSupplierNotifications hook"
```

---

## Task 5: Hook `useNotificationsLastSeen`

**Files:**
- Create: `lib/queries/notifications/useNotificationsLastSeen.ts`
- Create: `lib/queries/notifications/index.ts`

- [ ] **Step 1: Tạo `useNotificationsLastSeen.ts`**

```ts
"use client"

import { useCallback, useEffect, useState } from "react"

import { useAuthStore } from "@/lib/store/auth-store"

const KEY_PREFIX = "styleloop-supplier-notif-seen-"

/**
 * localStorage-backed "last seen" timestamp per user.
 * Notification được coi là unread khi reviewedAt > lastSeen.
 */
export function useNotificationsLastSeen() {
  const user = useAuthStore((s) => s.user)
  const [lastSeen, setLastSeen] = useState<number>(0)

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

- [ ] **Step 2: Tạo `index.ts` barrel**

```ts
export {
  useGetSupplierNotifications,
  type SupplierNotification,
} from "./useGetSupplierNotifications"
export { useNotificationsLastSeen } from "./useNotificationsLastSeen"
```

- [ ] **Step 3: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add lib/queries/notifications/useNotificationsLastSeen.ts lib/queries/notifications/index.ts
git commit -m "feat(notif): add useNotificationsLastSeen + barrel"
```

---

## Task 6: Update mutations (approve/reject) — set `reviewed_at` + invalidate notifications

**Files:**
- Modify: `lib/queries/products/useApproveProduct.ts`
- Modify: `lib/queries/products/useRejectProduct.ts`

- [ ] **Step 1: `useApproveProduct.ts` — thêm reviewed_at + invalidate notifications**

Tìm block `.update({ upload_status: "approved", product_id: productId } as never)` và thay bằng:

```ts
      .update({
        upload_status: "approved",
        product_id: productId,
        reviewed_at: new Date().toISOString(),
      } as never)
```

Tìm block `onSuccess: () => {...}` và update thành:

```ts
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.submissions.all })
      qc.invalidateQueries({ queryKey: queryKeys.products.all })
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all })
    },
```

- [ ] **Step 2: `useRejectProduct.ts` — thêm reviewed_at + invalidate notifications**

Tìm `.update({ upload_status: "rejected", reject_reason: reason } as never)` thay bằng:

```ts
      .update({
        upload_status: "rejected",
        reject_reason: reason,
        reviewed_at: new Date().toISOString(),
      } as never)
```

Update `onSuccess`:

```ts
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.submissions.all })
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all })
    },
```

- [ ] **Step 3: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add lib/queries/products/useApproveProduct.ts lib/queries/products/useRejectProduct.ts
git commit -m "feat(notif): record reviewed_at + invalidate notifications on approve/reject"
```

---

## Task 7: UI — thêm Bell icon dropdown vào `site-header.tsx`

**Files:**
- Modify: `components/site-header.tsx`

- [ ] **Step 1: Thêm imports**

Tìm dòng `import { ROLE_LABEL, useAuthStore } from "@/lib/store/auth-store"`. Sau đó (trước import `useGetSubmissions`), thêm:

```tsx
import {
  useGetSupplierNotifications,
  useNotificationsLastSeen,
} from "@/lib/queries/notifications"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
```

Trong import `lucide-react`, đảm bảo có `Bell` (nếu chưa có, thêm vào alphabetically).

- [ ] **Step 2: Thêm helper `formatRelative` ngoài component**

Trước dòng `export function SiteHeader()`, thêm:

```tsx
function formatRelative(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: vi })
}
```

- [ ] **Step 3: Thêm state + data hooks trong SiteHeader**

Tìm dòng `const [supplierOrdersOpen, setSupplierOrdersOpen] = useState(false)`. Sau dòng đó, thêm:

```tsx
  const [notifOpen, setNotifOpen] = useState(false)
```

Tìm block:
```tsx
  const { data: submittedProducts = [] } = useGetSubmissions()
```
Sau block đó, thêm:

```tsx
  const { data: notifications = [] } = useGetSupplierNotifications()
  const { isUnread, markAllSeen } = useNotificationsLastSeen()
  const unreadNotifCount = notifications.filter((n) => isUnread(n.reviewedAt)).length
```

- [ ] **Step 4: Render Bell icon + dropdown trong header**

Tìm block JSX bắt đầu bằng `{authed && user?.role === "supplier" && (` (khoảng line 580). NGAY SAU `<>` mở đầu (trước `<DropdownMenu open={supplierDropdownOpen}`), insert block sau:

```tsx
              {/* ── Bell — Thông báo duyệt sản phẩm ── */}
              <DropdownMenu
                open={notifOpen}
                onOpenChange={(open) => {
                  setNotifOpen(open)
                  if (open) markAllSeen()
                }}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Thông báo"
                    className="relative hidden size-10 cursor-pointer rounded-full text-[oklch(0.34_0.03_55)] hover:bg-[oklch(0.91_0.022_75)] hover:text-[oklch(0.6_0.062_60)] lg:inline-flex"
                  >
                    <Bell className="size-5" strokeWidth={1.4} />
                    {unreadNotifCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[oklch(0.55_0.18_28)] text-[10px] font-bold text-white ring-2 ring-[oklch(0.965_0.012_78)]">
                        {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={10}
                  className="w-80 rounded-md border border-[oklch(0.86_0.018_70)] bg-[oklch(0.99_0.008_78)] p-0 shadow-[0_24px_60px_-20px_oklch(0.34_0.03_55/0.3)]"
                >
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
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-10 text-center">
                      <Bell
                        className="size-8 text-[oklch(0.78_0.04_70)]"
                        strokeWidth={1.2}
                      />
                      <p className="text-[12px] text-[oklch(0.55_0.024_60)]">
                        Chưa có thông báo
                      </p>
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
                              "relative flex items-start gap-3 border-b border-[oklch(0.95_0.012_76)] px-3 py-2.5 pl-5 transition-colors last:border-0 hover:bg-[oklch(0.97_0.012_78)]",
                              unread && "bg-[oklch(0.96_0.012_78)]",
                            )}
                          >
                            {unread && (
                              <span className="absolute top-3.5 left-1.5 size-1.5 rounded-full bg-[oklch(0.6_0.062_60)]" />
                            )}
                            <div className="size-12 shrink-0 overflow-hidden rounded-md bg-[oklch(0.94_0.014_75)]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={n.productSrc}
                                alt={n.productName}
                                className="size-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] font-medium text-[oklch(0.18_0.014_55)]">
                                {n.productName}
                              </p>
                              <p className="mt-0.5 flex items-center gap-1.5">
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.12em] uppercase",
                                    isApproved
                                      ? "bg-[oklch(0.91_0.022_75)] text-[oklch(0.34_0.03_55)]"
                                      : "bg-[oklch(0.18_0.014_55)] text-[oklch(0.94_0.014_75)]",
                                  )}
                                >
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
                  {notifications.length > 0 && (
                    <div className="border-t border-[oklch(0.9_0.014_72)] p-2">
                      <Link
                        href="/supplier"
                        onClick={() => setNotifOpen(false)}
                        className="flex w-full items-center justify-center rounded-sm py-2 text-[11px] font-semibold tracking-[0.14em] text-[oklch(0.6_0.062_60)] uppercase transition-colors hover:bg-[oklch(0.94_0.014_75)]"
                      >
                        Xem tất cả →
                      </Link>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

```

- [ ] **Step 5: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 6: Manual smoke test**

Run: `pnpm dev`

Flow test:
1. Login `supplier1@styleloop.vn / supplier123` → /supplier → submit 1 sản phẩm mới (paste URL ảnh bất kỳ + điền form)
2. Logout, login `admin@styleloop.vn / admin123` → /admin → thấy submission mới → bấm **Approve**
3. Logout, login lại supplier1 → mở header → **thấy Bell icon có badge đỏ "1"**
4. Click Bell → dropdown hiện 1 notification "Được duyệt" với tên sản phẩm + thời gian "vài giây trước"
5. Đóng dropdown → mở lại → badge đã biến mất (mark all seen)
6. Submit thêm 1 sản phẩm khác → admin **Reject** với reason "Ảnh không rõ" → supplier login → Bell badge "1" → click → notification "Từ chối — Lý do: Ảnh không rõ"

Stop dev server.

- [ ] **Step 7: Commit**

```bash
git add components/site-header.tsx
git commit -m "feat(notif): add Bell notification dropdown for suppliers"
```

---

## Self-review notes (đã check khi viết plan)

**Spec coverage:**
- ✅ Section 1 (Schema) → Task 1, 2
- ✅ Section 2 (Mutation updates) → Task 6
- ✅ Section 3 (Query hook) → Task 4, 5
- ✅ Section 4 (UI site-header) → Task 7
- ✅ Section 5 (Cache invalidation) → Task 6
- ✅ Section 6 (Out of scope) — không có task nào, đúng

**Placeholders:** Không có TBD / "add appropriate error handling" / "similar to Task N". Mỗi step có code cụ thể hoặc command rõ ràng.

**Type consistency:**
- `SupplierNotification` shape consistent giữa Task 4 (định nghĩa) và Task 7 (dùng `n.type`, `n.productName`, `n.productSrc`, `n.rejectReason`, `n.reviewedAt`, `n.id`).
- `queryKeys.notifications.all` — đặt ở Task 3, dùng ở Task 6 (`invalidateQueries`).
- `useGetSupplierNotifications` + `useNotificationsLastSeen` — barrel export ở Task 5, dùng ở Task 7.
- `isUnread`, `markAllSeen` — return từ hook Task 5, dùng ở Task 7.
