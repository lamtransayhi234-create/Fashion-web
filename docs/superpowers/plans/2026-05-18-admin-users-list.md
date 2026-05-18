# Admin Users & Suppliers List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/admin/users` route for admin to list user & supplier accounts, filter by role, search by name/email, and hard-delete an account via server route with service-role key.

**Architecture:** Client page fetches profiles via TanStack Query (filtered to `user`/`supplier` at DB). Delete proxies through a Next.js route handler (`app/api/admin/users/[id]`) that re-verifies admin role server-side then calls `auth.admin.deleteUser()` with the service-role key. Cascade rules (migration 0004) clean up products/orders/whitelist automatically.

**Tech Stack:** Next.js 16 (route handlers) · React 19 · TanStack Query · Supabase JS (browser + service-role) · Tailwind · lucide-react · Zustand (auth session).

**Testing convention:** No test framework installed. Verify each task with `pnpm typecheck` + manual smoke in browser. Match existing pattern from `docs/superpowers/plans/2026-05-15-supplier-notifications.md`.

**Spec gốc:** `docs/superpowers/specs/2026-05-18-admin-users-list-design.md`

---

## File map

**Tạo mới:**
- `lib/queries/users/useGetAdminUsers.ts`
- `lib/queries/users/useDeleteUser.ts`
- `lib/queries/users/index.ts`
- `app/api/admin/users/[id]/route.ts`
- `components/skeletons/admin-users-skeleton.tsx`
- `app/(home)/admin/users/page.tsx`

**Sửa:**
- `lib/queries/queryKeys.ts` (thêm `users` block)
- `components/skeletons/index.ts` (export skeleton)
- `components/site-header.tsx` (thêm link nav admin — 2 vị trí)

**User action (không phải code):**
- Thêm `SUPABASE_SERVICE_ROLE_KEY` vào `.env.local`

---

## Task 1: Thêm env var SUPABASE_SERVICE_ROLE_KEY

Không có file code — user thực hiện thủ công.

- [ ] **Step 1: User lấy service-role key**

Vào Supabase Dashboard → Project Settings → API → mục **"Project API keys"** → copy giá trị **`service_role`** (KHÔNG phải `anon`).

- [ ] **Step 2: Thêm vào `.env.local`**

Mở `/Users/tien/Desktop/Outsource/fashion-web/.env.local` (nếu chưa có thì tạo). Thêm dòng (KHÔNG có prefix `NEXT_PUBLIC_`):

```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...    # paste giá trị từ Step 1
```

- [ ] **Step 3: Verify .env.local nằm trong .gitignore**

Run: `grep -E "^\.env" /Users/tien/Desktop/Outsource/fashion-web/.gitignore`
Expected: thấy dòng `.env*` hoặc `.env.local`. Nếu KHÔNG có → STOP, thêm `.env*` vào `.gitignore` trước khi tiếp tục (service-role key tuyệt đối không được commit).

- [ ] **Step 4: Restart dev server**

Kill `pnpm dev` đang chạy và chạy lại. Next.js chỉ đọc `.env.local` lúc khởi động.

Không commit — env file là local.

---

## Task 2: Thêm query key `users`

**Files:**
- Modify: `lib/queries/queryKeys.ts`

- [ ] **Step 1: Thêm `users` block vào factory**

Trong file `lib/queries/queryKeys.ts`, sau block `notifications: { ... }` (line ~35) và TRƯỚC dấu `} as const`, thêm dấu phẩy cuối block `notifications` rồi paste:

```ts
  users: {
    all: ["users"] as const,
    list: () => [...queryKeys.users.all, "list"] as const,
  },
```

Block hoàn chỉnh phải kết thúc dạng:

```ts
  notifications: {
    ...
  },
  users: {
    all: ["users"] as const,
    list: () => [...queryKeys.users.all, "list"] as const,
  },
} as const
```

- [ ] **Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/queries/queryKeys.ts
git commit -m "feat(admin-users): add users query key factory"
```

---

## Task 3: Tạo hook `useGetAdminUsers`

**Files:**
- Create: `lib/queries/users/useGetAdminUsers.ts`

- [ ] **Step 1: Viết hook**

```ts
"use client"

import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/queries/queryKeys"
import { getSupabase } from "@/lib/supabase/client"

export type AdminUserRow = {
  id: string
  email: string
  name: string
  role: "user" | "supplier"
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

- [ ] **Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/queries/users/useGetAdminUsers.ts
git commit -m "feat(admin-users): add useGetAdminUsers hook"
```

---

## Task 4: Tạo hook `useDeleteUser`

**Files:**
- Create: `lib/queries/users/useDeleteUser.ts`

- [ ] **Step 1: Viết hook**

```ts
"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/queries/queryKeys"

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
      const json: { ok?: boolean; error?: string } = await res.json()
      if (!res.ok) throw new Error(json.error || "delete_failed")
      return json
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.all })
    },
  })
}
```

- [ ] **Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/queries/users/useDeleteUser.ts
git commit -m "feat(admin-users): add useDeleteUser mutation hook"
```

---

## Task 5: Tạo barrel `lib/queries/users/index.ts`

**Files:**
- Create: `lib/queries/users/index.ts`

- [ ] **Step 1: Tạo file**

```ts
export { useGetAdminUsers } from "./useGetAdminUsers"
export type { AdminUserRow } from "./useGetAdminUsers"
export { useDeleteUser } from "./useDeleteUser"
```

- [ ] **Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/queries/users/index.ts
git commit -m "feat(admin-users): add users queries barrel"
```

---

## Task 6: Tạo server route `DELETE /api/admin/users/[id]`

**Files:**
- Create: `app/api/admin/users/[id]/route.ts`

- [ ] **Step 1: Viết route handler**

```ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // 1. Verify caller session
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  // 2. Verify caller role = admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()
  if (profileError || profile?.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  // 3. Self-delete guard
  if (user.id === id) {
    return NextResponse.json(
      { error: "cannot_delete_self" },
      { status: 400 },
    )
  }

  // 4. Hard delete via service-role admin client
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json(
      { error: "service_role_key_missing" },
      { status: 500 },
    )
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Smoke test (unauthenticated)**

Run:
```bash
curl -i -X DELETE http://localhost:3000/api/admin/users/00000000-0000-0000-0000-000000000000
```
Expected: `HTTP/1.1 401` với body `{"error":"unauthorized"}`.

(Cần `pnpm dev` đang chạy. Nếu chưa thì bỏ qua step này và chuyển sang manual QA ở Task 14.)

- [ ] **Step 4: Commit**

```bash
git add app/api/admin/users/[id]/route.ts
git commit -m "feat(admin-users): add DELETE /api/admin/users/[id] server route"
```

---

## Task 7: Tạo `AdminUsersSkeleton`

**Files:**
- Create: `components/skeletons/admin-users-skeleton.tsx`
- Modify: `components/skeletons/index.ts`

- [ ] **Step 1: Tạo skeleton**

```tsx
import { Skeleton } from "@/components/ui/skeleton"

/**
 * /admin/users skeleton — list of user/supplier rows in a table.
 */
export function AdminUsersSkeleton() {
  return (
    <div className="min-h-screen bg-[oklch(0.962_0.012_78)]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* Eyebrow */}
        <div className="mb-6 flex items-center gap-3">
          <span className="h-px w-8 bg-[oklch(0.6_0.062_60)]" />
          <Skeleton className="h-3 w-32 rounded-sm" />
        </div>

        {/* Heading */}
        <div className="mb-10 flex items-center gap-4">
          <Skeleton className="size-14 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-64 rounded-sm" />
            <Skeleton className="h-3 w-40 rounded-sm" />
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-md bg-[oklch(0.99_0.008_78)] p-4 ring-1 ring-[oklch(0.88_0.018_70)]"
            >
              <Skeleton className="mx-auto h-8 w-12 rounded-sm" />
              <Skeleton className="mx-auto mt-2 h-3 w-20 rounded-sm" />
            </div>
          ))}
        </div>

        {/* Filter row */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-10 w-full rounded-full sm:w-72" />
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-md bg-[oklch(0.99_0.008_78)] ring-1 ring-[oklch(0.88_0.018_70)]">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_1fr_120px_120px_60px] gap-3 border-b border-[oklch(0.88_0.018_70)] px-5 py-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-3 rounded-sm" />
            ))}
          </div>
          {/* Body rows */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_1fr_120px_120px_60px] items-center gap-3 border-b border-[oklch(0.88_0.018_70)]/60 px-5 py-3 last:border-0"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 shrink-0 rounded-full" />
                <Skeleton className="h-4 w-32 rounded-sm" />
              </div>
              <Skeleton className="h-4 w-40 rounded-sm" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-20 rounded-sm" />
              <Skeleton className="size-8 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Export trong barrel**

Trong file `components/skeletons/index.ts`, sau dòng `export { AdminSkeleton } from "./admin-skeleton"`, thêm:

```ts
export { AdminUsersSkeleton } from "./admin-users-skeleton"
```

- [ ] **Step 3: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/skeletons/admin-users-skeleton.tsx components/skeletons/index.ts
git commit -m "feat(admin-users): add AdminUsersSkeleton"
```

---

## Task 8: Tạo trang `/admin/users` — skeleton shell + auth guard

Bước này tạo file `page.tsx` với auth guard, heading, render skeleton khi loading. Chưa có table, filter, dialog — chỉ shell.

**Files:**
- Create: `app/(home)/admin/users/page.tsx`

- [ ] **Step 1: Tạo shell page**

```tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Shield, Users } from "lucide-react"

import { useAuthStore } from "@/lib/store/auth-store"
import { useGetAdminUsers } from "@/lib/queries/users"
import { AdminUsersSkeleton } from "@/components/skeletons"

// ─── Tokens ───────────────────────────────────────────────────────────────────

const TK = {
  bg: "oklch(0.962 0.012 78)",
  card: "oklch(0.99 0.008 78)",
  muted: "oklch(0.94 0.014 75)",
  border: "oklch(0.88 0.018 70)",
  ink: "oklch(0.18 0.014 55)",
  sub: "oklch(0.55 0.024 60)",
  camel: "oklch(0.6 0.062 60)",
  sand: "oklch(0.94 0.014 75)",
  label: "oklch(0.45 0.022 58)",
  danger: "oklch(0.5 0.12 25)",
  dangerBg: "oklch(0.92 0.08 25)",
}

export default function AdminUsersPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const hydrated = useAuthStore((s) => s.hydrated)

  const { data: rows = [], isLoading } = useGetAdminUsers()

  useEffect(() => {
    if (!hydrated) return
    if (!user) router.replace("/login")
    else if (user.role !== "admin") router.replace("/")
  }, [hydrated, user, router])

  if (!hydrated || isLoading) return <AdminUsersSkeleton />
  if (!user || user.role !== "admin") return <AdminUsersSkeleton />

  return (
    <main style={{ background: TK.bg, minHeight: "calc(100vh - 3.6rem)" }}>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* Eyebrow */}
        <div className="mb-6 flex items-center gap-3">
          <span className="h-px w-8" style={{ background: TK.camel }} />
          <span
            className="text-[10px] font-semibold tracking-[0.32em] uppercase"
            style={{ color: TK.sub }}
          >
            ✦ Quản trị viên ✦
          </span>
        </div>

        {/* Heading */}
        <div className="mb-10 flex items-center gap-4">
          <div
            className="flex size-14 shrink-0 items-center justify-center rounded-full"
            style={{ background: TK.sand }}
          >
            <Shield
              className="size-6"
              style={{ color: TK.camel }}
              strokeWidth={1.4}
            />
          </div>
          <div>
            <h1
              className="font-display text-[32px] leading-tight font-medium tracking-tight"
              style={{ color: TK.ink }}
            >
              Quản lý người dùng
            </h1>
            <p className="mt-0.5 text-[13px]" style={{ color: TK.sub }}>
              {user.name} · Quản trị viên
            </p>
          </div>
        </div>

        {/* Empty placeholder — sẽ thay bằng stats/filter/table ở task sau */}
        <div
          className="flex flex-col items-center gap-4 rounded-md py-24 text-center"
          style={{ background: TK.card, border: `1px solid ${TK.border}` }}
        >
          <div
            className="flex size-20 items-center justify-center rounded-full"
            style={{ background: TK.sand }}
          >
            <Users
              className="size-8"
              style={{ color: TK.sub }}
              strokeWidth={1.2}
            />
          </div>
          <p className="text-[14px]" style={{ color: TK.sub }}>
            ✦ {rows.length} tài khoản đã load (UI sắp tới)
          </p>
        </div>
      </div>
    </main>
  )
}
```

Note: chỉ import `useEffect` ngay; `useMemo` / `useState` sẽ thêm dần ở task sau khi dùng.

- [ ] **Step 2: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Manual smoke test**

Mở `pnpm dev`. Login admin (`admin@styleloop.vn` / `admin123`). Vào `http://localhost:3000/admin/users`.
Expected: thấy heading "Quản lý người dùng" + placeholder "{N} tài khoản đã load" với N > 0. Skeleton hiện trước rồi mới render thật.

Logout, vào lại URL → redirect `/login`. Login bằng user thường → redirect `/`.

- [ ] **Step 4: Commit**

```bash
git add app/\(home\)/admin/users/page.tsx
git commit -m "feat(admin-users): scaffold /admin/users page with auth guard"
```

---

## Task 9: Thay placeholder bằng stat cards + table render

Thay khối placeholder ở Task 8 bằng 2 stat card (count theo role) + table render đầy đủ rows. Chưa có filter/search/delete — chỉ render hết.

**Files:**
- Modify: `app/(home)/admin/users/page.tsx`

- [ ] **Step 1: Thêm `useMemo` vào import react**

Trong file `app/(home)/admin/users/page.tsx`, sửa dòng import từ:

```tsx
import { useEffect } from "react"
```

thành:

```tsx
import { useEffect, useMemo } from "react"
```

- [ ] **Step 2: Thêm helper format date trên đầu file**

Trong `app/(home)/admin/users/page.tsx`, ngay trước `export default function AdminUsersPage()`, thêm:

```tsx
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  })
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p.trim()[0])
    .filter(Boolean)
    .slice(-2)
    .join("")
    .toUpperCase()
}

const ROLE_BADGE = {
  user: {
    bg: TK.sand,
    text: TK.ink,
    label: "Khách thuê",
  },
  supplier: {
    bg: TK.camel,
    text: "oklch(0.97 0.012 78)",
    label: "Cung cấp",
  },
} as const
```

(Đặt sau `const TK = {...}` để dùng được `TK.sand` / `TK.ink` / `TK.camel`.)

- [ ] **Step 3: Thêm derived stats sau khi gọi hook**

Trong `AdminUsersPage`, sau dòng `const { data: rows = [], isLoading } = useGetAdminUsers()` và TRƯỚC `useEffect`, thêm:

```tsx
const stats = useMemo(() => {
  const userCount = rows.filter((r) => r.role === "user").length
  const supplierCount = rows.filter((r) => r.role === "supplier").length
  return { userCount, supplierCount }
}, [rows])
```

- [ ] **Step 4: Thay placeholder block bằng stats + table**

Xoá toàn bộ block `{/* Empty placeholder ... */}` đến hết `</div>` đóng. Thay bằng:

```tsx
{/* Stats */}
<div className="mb-8 grid grid-cols-2 gap-3">
  {[
    { label: "Khách thuê", value: stats.userCount },
    { label: "Cung cấp", value: stats.supplierCount },
  ].map((s) => (
    <div
      key={s.label}
      className="rounded-md p-4 text-center"
      style={{ background: TK.card, border: `1px solid ${TK.border}` }}
    >
      <p
        className="font-display text-[28px] font-bold"
        style={{ color: TK.ink }}
      >
        {s.value}
      </p>
      <p
        className="text-[11px] font-semibold tracking-[0.14em] uppercase"
        style={{ color: TK.sub }}
      >
        {s.label}
      </p>
    </div>
  ))}
</div>

{/* Table */}
{rows.length === 0 ? (
  <div
    className="flex flex-col items-center gap-4 rounded-md py-24 text-center"
    style={{ background: TK.card, border: `1px solid ${TK.border}` }}
  >
    <div
      className="flex size-20 items-center justify-center rounded-full"
      style={{ background: TK.sand }}
    >
      <Users
        className="size-8"
        style={{ color: TK.sub }}
        strokeWidth={1.2}
      />
    </div>
    <h2
      className="font-display text-[22px] font-medium"
      style={{ color: TK.ink }}
    >
      Chưa có người dùng nào
    </h2>
  </div>
) : (
  <div
    className="overflow-hidden rounded-md"
    style={{ background: TK.card, border: `1px solid ${TK.border}` }}
  >
    {/* Header row */}
    <div
      className="hidden grid-cols-[1.6fr_1.6fr_120px_120px_56px] gap-3 border-b px-5 py-3 sm:grid"
      style={{ borderColor: TK.border }}
    >
      {["Người dùng", "Email", "Role", "Tham gia", ""].map((h, i) => (
        <span
          key={i}
          className="text-[10px] font-semibold tracking-[0.22em] uppercase"
          style={{ color: TK.label }}
        >
          {h}
        </span>
      ))}
    </div>
    {/* Body rows */}
    {rows.map((r) => {
      const badge = ROLE_BADGE[r.role]
      return (
        <div
          key={r.id}
          className="grid grid-cols-[1fr_56px] items-center gap-3 border-b px-5 py-3 last:border-0 sm:grid-cols-[1.6fr_1.6fr_120px_120px_56px]"
          style={{ borderColor: TK.border }}
        >
          {/* Người dùng */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-[12px] font-semibold"
              style={{
                background: TK.sand,
                color: TK.ink,
                border: `1px solid ${TK.border}`,
              }}
            >
              {r.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.avatar}
                  alt={r.name}
                  className="size-full object-cover"
                />
              ) : (
                getInitials(r.name)
              )}
            </div>
            <div className="min-w-0">
              <p
                className="truncate text-[13px] font-medium"
                style={{ color: TK.ink }}
              >
                {r.name}
              </p>
              {r.shop_name && (
                <p
                  className="truncate text-[11px]"
                  style={{ color: TK.sub }}
                >
                  {r.shop_name}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <p
            className="hidden truncate text-[12px] sm:block"
            style={{ color: TK.sub }}
          >
            {r.email}
          </p>

          {/* Role badge */}
          <span
            className="hidden w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase sm:inline-flex"
            style={{ background: badge.bg, color: badge.text }}
          >
            {badge.label}
          </span>

          {/* Tham gia */}
          <p
            className="hidden text-[12px] sm:block"
            style={{ color: TK.sub }}
          >
            {fmtDate(r.created_at)}
          </p>

          {/* Action — sẽ wire ở task sau */}
          <button
            type="button"
            disabled
            className="flex size-8 items-center justify-center rounded-md opacity-30"
            style={{ color: TK.danger }}
            aria-label="Xoá (sắp sẵn sàng)"
          >
            <span className="text-[14px]">🗑</span>
          </button>
        </div>
      )
    })}
  </div>
)}
```

- [ ] **Step 5: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 6: Manual smoke test**

Reload `/admin/users` trong browser.
Expected:
- 2 stat card hiển thị đúng số user / supplier (đếm theo seed: thường là 2 user + 2 supplier).
- Table có header row uppercase tracking + body row mỗi user/supplier (avatar fallback initial khi null, email, role badge đúng màu, ngày dd/MM/yy).
- Trash button hiện ra disabled (opacity 30%).
- Trên mobile (resize browser nhỏ), 3 cột Email / Role / Tham gia ẩn đi, chỉ còn Người dùng + action.

- [ ] **Step 7: Commit**

```bash
git add app/\(home\)/admin/users/page.tsx
git commit -m "feat(admin-users): render stat cards and full users table"
```

---

## Task 10: Thêm filter chips + search input

**Files:**
- Modify: `app/(home)/admin/users/page.tsx`

- [ ] **Step 1: Cập nhật imports**

Sửa 2 dòng import ở đầu file:

```tsx
import { useEffect, useMemo, useState } from "react"
```

```tsx
import { Search, Shield, Users } from "lucide-react"
```

- [ ] **Step 2: Thêm state cho filter + search**

Trong `AdminUsersPage`, sau dòng `const { data: rows = [], isLoading } = useGetAdminUsers()`, thêm:

```tsx
const [selectedRole, setSelectedRole] = useState<"all" | "user" | "supplier">(
  "all",
)
const [searchQuery, setSearchQuery] = useState("")
```

- [ ] **Step 3: Thêm filtered list dùng useMemo**

Ngay sau block `const stats = useMemo(...)`, thêm:

```tsx
const filteredRows = useMemo(() => {
  const q = searchQuery.trim().toLowerCase()
  return rows.filter((r) => {
    if (selectedRole !== "all" && r.role !== selectedRole) return false
    if (!q) return true
    return (
      r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
    )
  })
}, [rows, selectedRole, searchQuery])
```

- [ ] **Step 4: Thay `rows.map(...)` thành `filteredRows.map(...)` trong table body**

Tìm chỗ `{rows.map((r) => {` trong block table body và đổi thành:

```tsx
{filteredRows.map((r) => {
```

Cũng đổi điều kiện empty state: tìm `{rows.length === 0 ? (` và đổi thành:

```tsx
{filteredRows.length === 0 ? (
```

Trong block empty state, thêm logic phân biệt: thay heading hardcode bằng:

```tsx
<h2
  className="font-display text-[22px] font-medium"
  style={{ color: TK.ink }}
>
  {rows.length === 0
    ? "Chưa có người dùng nào"
    : "Không tìm thấy người dùng phù hợp"}
</h2>
```

- [ ] **Step 5: Thêm filter row TRƯỚC table block**

Ngay TRƯỚC dòng `{filteredRows.length === 0 ? (`, thêm filter row:

```tsx
{/* Filter row */}
<div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  {/* Role chips */}
  <div
    className="flex gap-1 rounded-full p-1"
    style={{ background: TK.muted, border: `1px solid ${TK.border}` }}
  >
    {(
      [
        { key: "all", label: "Tất cả" },
        { key: "user", label: "Khách thuê" },
        { key: "supplier", label: "Cung cấp" },
      ] as const
    ).map((c) => (
      <button
        key={c.key}
        type="button"
        onClick={() => setSelectedRole(c.key)}
        className="rounded-full px-4 py-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase transition-all"
        style={{
          background: selectedRole === c.key ? TK.ink : "transparent",
          color: selectedRole === c.key ? "oklch(0.97 0.012 78)" : TK.sub,
        }}
      >
        {c.label}
      </button>
    ))}
  </div>

  {/* Search */}
  <div
    className="relative flex items-center sm:w-72"
    style={{
      background: TK.card,
      border: `1px solid ${TK.border}`,
      borderRadius: 9999,
    }}
  >
    <Search
      className="ml-3 size-4 shrink-0"
      style={{ color: TK.sub }}
      strokeWidth={1.4}
    />
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Tìm theo tên / email"
      className="w-full bg-transparent px-3 py-2 text-[13px] outline-none"
      style={{ color: TK.ink }}
    />
  </div>
</div>
```

- [ ] **Step 6: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 7: Manual smoke test**

Reload trang. Test:
- Click "Khách thuê" → chỉ row role=user hiện.
- Click "Cung cấp" → chỉ supplier hiện.
- Click "Tất cả" → tất cả lại.
- Search "bảo" (hoặc tên có trong seed) → match name.
- Search "supplier1@" → match email.
- Search "xxxnotexist" → empty state "Không tìm thấy người dùng phù hợp".

- [ ] **Step 8: Commit**

```bash
git add app/\(home\)/admin/users/page.tsx
git commit -m "feat(admin-users): add role filter chips and search input"
```

---

## Task 11: Wire delete dialog + mutation + toast

**Files:**
- Modify: `app/(home)/admin/users/page.tsx`

- [ ] **Step 1: Import thêm icon Trash2 + hook**

Sửa dòng import lucide-react:

```tsx
import { Search, Shield, Trash2, Users } from "lucide-react"
```

Sửa dòng import `@/lib/queries/users`:

```tsx
import { useDeleteUser, useGetAdminUsers } from "@/lib/queries/users"
import type { AdminUserRow } from "@/lib/queries/users"
```

- [ ] **Step 2: Thêm Dialog component nội bộ trên đầu file**

Trước `export default function AdminUsersPage()`, sau block `const ROLE_BADGE = ...`, thêm:

```tsx
function Dialog({
  onBackdrop,
  children,
}: {
  onBackdrop: () => void
  children: React.ReactNode
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        background: "oklch(0.18 0.014 55 / 0.55)",
        backdropFilter: "blur(6px)",
      }}
      onClick={onBackdrop}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-md"
        style={{
          background: TK.card,
          border: `1px solid ${TK.border}`,
          boxShadow: "0 32px 80px -20px oklch(0.18 0.014 55 / 0.4)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 w-full" style={{ background: TK.camel }} />
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Thêm state cho dialog + toast + mutation**

Trong `AdminUsersPage`, sau `const [searchQuery, setSearchQuery] = useState("")`, thêm:

```tsx
const deleteMutation = useDeleteUser()
const [deleteDialog, setDeleteDialog] = useState<{
  open: boolean
  target: AdminUserRow | null
}>({ open: false, target: null })
const [toast, setToast] = useState<string | null>(null)

function showToast(msg: string) {
  setToast(msg)
  setTimeout(() => setToast(null), 3000)
}

async function confirmDelete() {
  if (!deleteDialog.target) return
  const name = deleteDialog.target.name
  try {
    await deleteMutation.mutateAsync(deleteDialog.target.id)
    setDeleteDialog({ open: false, target: null })
    showToast(`Đã xoá tài khoản ${name}`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : "delete_failed"
    showToast(`Xoá thất bại: ${msg}`)
  }
}
```

- [ ] **Step 4: Thay trash button placeholder thành nút active**

Tìm block `<button type="button" disabled ... aria-label="Xoá (sắp sẵn sàng)">` trong table body và thay bằng:

```tsx
<button
  type="button"
  onClick={() => setDeleteDialog({ open: true, target: r })}
  className="flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-[oklch(0.92_0.08_25/0.3)]"
  style={{ color: TK.danger }}
  aria-label={`Xoá ${r.name}`}
>
  <Trash2 className="size-4" strokeWidth={1.4} />
</button>
```

- [ ] **Step 5: Thêm dialog + toast render ngay đầu `<main>`**

Tìm dòng `<main style={{ background: TK.bg, ...`. Ngay SAU thẻ mở `<main ...>`, thêm:

```tsx
{/* Toast */}
{toast && (
  <div
    className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-full px-6 py-3 text-[13px] font-semibold shadow-lg"
    style={{ background: TK.ink, color: "oklch(0.97 0.012 78)" }}
  >
    {toast}
  </div>
)}

{/* Delete dialog */}
{deleteDialog.open && deleteDialog.target && (
  <Dialog
    onBackdrop={() => setDeleteDialog({ open: false, target: null })}
  >
    <div className="px-8 py-8">
      <div
        className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full"
        style={{ background: TK.dangerBg }}
      >
        <Trash2
          className="size-7"
          style={{ color: TK.danger }}
          strokeWidth={1.6}
        />
      </div>
      <h2
        className="text-center font-display text-[22px] font-medium"
        style={{ color: TK.ink }}
      >
        Xoá tài khoản người dùng?
      </h2>
      <p
        className="mt-2 text-center text-[13px]"
        style={{ color: TK.sub }}
      >
        Hành động không thể hoàn tác. Toàn bộ dữ liệu của{" "}
        <span className="font-semibold" style={{ color: TK.ink }}>
          {deleteDialog.target.name}
        </span>{" "}
        sẽ bị xoá vĩnh viễn.
      </p>
      <div className="mt-7 flex gap-3">
        <button
          type="button"
          onClick={confirmDelete}
          disabled={deleteMutation.isPending}
          className="flex-1 rounded-full py-3 text-[12px] font-bold tracking-[0.14em] uppercase transition-all disabled:opacity-40"
          style={{ background: TK.danger, color: "white" }}
        >
          {deleteMutation.isPending ? "Đang xoá..." : "Xác nhận xoá"}
        </button>
        <button
          type="button"
          onClick={() =>
            setDeleteDialog({ open: false, target: null })
          }
          disabled={deleteMutation.isPending}
          className="flex-1 rounded-full py-3 text-[12px] font-semibold transition-opacity hover:opacity-70 disabled:opacity-40"
          style={{
            border: `1px solid ${TK.border}`,
            color: TK.sub,
            background: "transparent",
          }}
        >
          Đóng
        </button>
      </div>
    </div>
  </Dialog>
)}
```

- [ ] **Step 6: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 7: Manual smoke test (cẩn thận — sẽ xoá thật)**

Chuẩn bị: trước khi test, có thể seed lại với `pnpm seed` để có user/supplier mới (idempotent với account chính).

- Click 🗑 trên 1 supplier có ít product → dialog hiện, đúng tên.
- Click "Đóng" → dialog đóng, không xoá.
- Click lại 🗑 → "Xác nhận xoá" → label đổi "Đang xoá..." → toast "Đã xoá tài khoản X" → row biến mất khỏi list.
- Vào `/shop` (`/products`) → products của supplier đó không còn (cascade).
- Logout admin, login lại bằng supplier đã xoá → fail (account không tồn tại).
- Test edge: nếu có cách edit URL fetch DELETE với id admin (hoặc tự gọi `fetch('/api/admin/users/<admin-id>', {method:'DELETE'})` trong console khi đang login admin) → toast "Xoá thất bại: cannot_delete_self".

- [ ] **Step 8: Commit**

```bash
git add app/\(home\)/admin/users/page.tsx
git commit -m "feat(admin-users): wire delete dialog, mutation, and toast"
```

---

## Task 12: Thêm link nav `/admin/users` vào header

Header có 2 chỗ render menu admin (mobile sheet + desktop account dropdown). Thêm link vào cả hai.

**Files:**
- Modify: `components/site-header.tsx`

- [ ] **Step 1: Thêm link trong mobile sheet menu (~line 477)**

Tìm block array bắt đầu line ~465 (trong mobile menu Sheet):

```tsx
{
  href: "/admin",
  icon: LayoutDashboard,
  label: "Bảng điều khiển",
  show: user?.role === "admin",
},
```

NGAY SAU object này, thêm object mới:

```tsx
{
  href: "/admin/users",
  icon: Users,
  label: "Quản lý người dùng",
  show: user?.role === "admin",
},
```

- [ ] **Step 2: Thêm link trong desktop account dropdown (~line 1647)**

Tìm block array bắt đầu line ~1634 (trong desktop dropdown):

```tsx
{
  href: "/admin",
  icon: LayoutDashboard,
  label: "Quản lý sản phẩm",
  show: user?.role === "admin",
},
```

NGAY SAU object này, thêm object mới:

```tsx
{
  href: "/admin/users",
  icon: Users,
  label: "Quản lý người dùng",
  show: user?.role === "admin",
},
```

- [ ] **Step 3: Thêm `Users` vào import lucide-react**

Ở đầu file (~line 6-27), tìm dòng import lucide-react. Đã có `User` từ trước — thêm `Users` (plural) vào danh sách:

```tsx
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Heart,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Package,
  Plus,
  Search,
  Shield,
  Store,
  User,
  Users,
  UserPlus,
  X,
} from "lucide-react"
```

- [ ] **Step 4: Verify typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 5: Manual smoke test**

Login admin. Trên desktop, click avatar/account ở góc phải header → dropdown hiện. Thấy 2 entry: "Quản lý sản phẩm" và "Quản lý người dùng" (icon Users). Click "Quản lý người dùng" → điều hướng tới `/admin/users`.

Trên mobile (resize browser nhỏ), mở hamburger menu → cũng thấy 2 entry, click hoạt động.

- [ ] **Step 6: Commit**

```bash
git add components/site-header.tsx
git commit -m "feat(admin-users): add header nav link for admin users page"
```

---

## Task 13: Full QA pass

Không có code thay đổi. Đi qua toàn bộ checklist trong spec section 7 và check off từng case.

- [ ] **Step 1: Run typecheck cuối**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: PASS (hoặc chỉ warning về `// eslint-disable-next-line` đã inline).

- [ ] **Step 3: QA matrix**

Login admin và test:

- [ ] `/admin/users` → list user + supplier, KHÔNG có admin nào.
- [ ] Logout, vào `/admin/users` → redirect `/login`.
- [ ] Login user thường, vào `/admin/users` → redirect `/`.
- [ ] Filter "Khách thuê" → chỉ role=user.
- [ ] Filter "Cung cấp" → chỉ role=supplier.
- [ ] Search "bảo" (hoặc tên có trong seed) → match name case-insensitive.
- [ ] Search "supplier1@" → match email case-insensitive.
- [ ] Stat cards đếm theo role TỔNG (không phụ thuộc filter).
- [ ] Skeleton render trước khi data về.
- [ ] Xoá 1 supplier → confirm → row biến mất, products của họ cũng biến mất ở `/products`. Cố login lại bằng email đó → fail.
- [ ] Xoá 1 user → confirm → row biến mất, orders của họ biến mất.
- [ ] Trong DevTools console (khi đang login admin), chạy:
  ```js
  fetch('/api/admin/users/00000000-0000-0000-0000-000000000000', { method: 'DELETE' }).then(r => r.json()).then(console.log)
  ```
  Expected: `{error: "..."}` (500 vì id không tồn tại — acceptable; quan trọng là không crash).
- [ ] Cố `curl -X DELETE http://localhost:3000/api/admin/users/<any>` không cookie → 401.
- [ ] Toast hiện 3 giây rồi tắt.

- [ ] **Step 4: Push branch (nếu user yêu cầu)**

Hỏi user có muốn push branch lên remote / mở PR không. Default: KHÔNG push tự động (theo CLAUDE-level guideline về destructive/visible actions).

---

## Notes

- **Service-role key safety:** Sau khi xong, search code base lần cuối để chắc chắn không có chỗ nào reference `SUPABASE_SERVICE_ROLE_KEY` ngoài `app/api/admin/users/[id]/route.ts`:
  ```bash
  grep -rn "SUPABASE_SERVICE_ROLE_KEY" --include="*.ts" --include="*.tsx" /Users/tien/Desktop/Outsource/fashion-web/
  ```
  Expected: chỉ 1 match trong file route trên.
- **Cascade behavior:** Migration `0004_profile_fk_on_delete.sql` đã set CASCADE/SET NULL. Không cần migration mới.
- **No new dependencies:** Không cần `pnpm add` gì cả — `@supabase/supabase-js` đã có sẵn.
