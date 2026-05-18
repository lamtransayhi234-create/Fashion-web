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
