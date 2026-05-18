"use client"

import { useEffect, useMemo } from "react"
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

export default function AdminUsersPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const hydrated = useAuthStore((s) => s.hydrated)

  const { data: rows = [], isLoading } = useGetAdminUsers()

  const stats = useMemo(() => {
    const userCount = rows.filter((r) => r.role === "user").length
    const supplierCount = rows.filter((r) => r.role === "supplier").length
    return { userCount, supplierCount }
  }, [rows])

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
                  <div className="flex min-w-0 items-center gap-3">
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
      </div>
    </main>
  )
}
