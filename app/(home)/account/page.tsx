"use client"

import { useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Package,
  Heart,
  Pencil,
  Check,
  X,
  Store,
  Shield,
} from "lucide-react"

import { useAuthStore, ROLE_LABEL } from "@/lib/store/auth-store"
import { useGetOrders } from "@/lib/queries/orders/useGetOrders"
import { useGetWhitelist } from "@/lib/queries/whitelist/useGetWhitelist"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// ─── Tokens ───────────────────────────────────────────────────────────────────

const TK = {
  bg:       "oklch(0.962 0.012 78)",
  card:     "oklch(0.99 0.004 80)",
  muted:    "oklch(0.97 0.008 78)",
  border:   "oklch(0.88 0.018 70)",
  sand:     "oklch(0.94 0.014 75)",
  ink:      "oklch(0.18 0.014 55)",
  sub:      "oklch(0.55 0.024 60)",
  label:    "oklch(0.45 0.022 58)",
  camel:    "oklch(0.6 0.062 60)",
  danger:   "oklch(0.45 0.12 30)",
  dangerBg: "oklch(0.96 0.04 30 / 0.4)",
}

function getInitials(name: string) {
  return name.split(" ").map((p) => p.trim()[0]).filter(Boolean).slice(-2).join("").toUpperCase()
}

// ─── Inline-editable field ────────────────────────────────────────────────────

function EditableField({
  label,
  value,
  placeholder,
  icon: Icon,
  type = "text",
  onSave,
}: {
  label: string
  value: string
  placeholder: string
  icon: React.ElementType
  type?: string
  onSave: (v: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  const commit = () => { onSave(draft.trim()); setEditing(false) }
  const cancel = () => { setDraft(value); setEditing(false) }

  return (
    <div
      className="flex items-center gap-4 rounded-xl px-4 py-3.5"
      style={{ background: TK.card, border: `1px solid ${TK.border}` }}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full" style={{ background: TK.sand }}>
        <Icon className="size-4" style={{ color: TK.camel }} strokeWidth={1.5} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="mb-0.5 text-[9px] font-bold tracking-[0.22em] uppercase" style={{ color: TK.sub }}>
          {label}
        </p>
        {editing ? (
          <input
            autoFocus
            type={type}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel() }}
            placeholder={placeholder}
            className="w-full bg-transparent text-[14px] font-medium outline-none"
            style={{ color: TK.ink }}
          />
        ) : (
          <p
            className="truncate text-[14px] font-medium"
            style={{ color: value ? TK.ink : TK.sub }}
          >
            {value || placeholder}
          </p>
        )}
      </div>

      {editing ? (
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={commit} aria-label="Lưu"
            className="flex size-7 cursor-pointer items-center justify-center rounded-full"
            style={{ background: TK.camel, color: "white" }}>
            <Check className="size-3.5" />
          </button>
          <button type="button" onClick={cancel} aria-label="Huỷ"
            className="flex size-7 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-[oklch(0.94_0.014_75)]"
            style={{ color: TK.danger }}>
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => { setDraft(value); setEditing(true) }} aria-label={`Sửa ${label}`}
          className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-[oklch(0.94_0.014_75)]"
          style={{ color: TK.sub }}>
          <Pencil className="size-3.5" />
        </button>
      )}
    </div>
  )
}

// ─── Read-only field ──────────────────────────────────────────────────────────

function ReadOnlyField({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div
      className="flex items-center gap-4 rounded-xl px-4 py-3.5"
      style={{ background: TK.muted, border: `1px solid ${TK.border}` }}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full" style={{ background: TK.sand }}>
        <Icon className="size-4" style={{ color: "oklch(0.65 0.018 60)" }} strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-0.5 text-[9px] font-bold tracking-[0.22em] uppercase" style={{ color: TK.sub }}>{label}</p>
        <p className="truncate text-[14px] font-medium" style={{ color: "oklch(0.4 0.018 58)" }}>{value}</p>
      </div>
      <span className="rounded-sm px-2 py-0.5 text-[9px] font-bold tracking-[0.14em] uppercase"
        style={{ background: TK.sand, color: TK.label }}>
        Cố định
      </span>
    </div>
  )
}

// ─── Change password ──────────────────────────────────────────────────────────

function ChangePassword({ onSave }: { onSave: (pw: string) => void }) {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [show, setShow] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const submit = async () => {
    setError(null)
    if (!current || !next || !confirm) { setError("Vui lòng điền đầy đủ."); return }
    if (next.length < 6) { setError("Mật khẩu mới phải có ít nhất 6 ký tự."); return }
    if (next !== confirm) { setError("Xác nhận không khớp."); return }
    // Supabase không expose password hiện tại — re-auth bằng signIn để verify
    const u = useAuthStore.getState().user
    if (!u) { setError("Chưa đăng nhập."); return }
    const reauth = await useAuthStore.getState().login(u.email, current)
    if (!reauth.success) { setError("Mật khẩu hiện tại không đúng."); return }
    const res = await useAuthStore.getState().changePassword(next)
    if (!res.success) { setError(res.message ?? "Đổi mật khẩu thất bại."); return }
    onSave(next)
    setCurrent(""); setNext(""); setConfirm("")
    setOpen(false); setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const fields = [
    { key: "current", label: "Mật khẩu hiện tại", val: current, set: setCurrent, ph: "Nhập mật khẩu hiện tại" },
    { key: "next",    label: "Mật khẩu mới",       val: next,    set: setNext,    ph: "Tối thiểu 6 ký tự" },
    { key: "confirm", label: "Xác nhận",            val: confirm, set: setConfirm, ph: "Nhập lại mật khẩu mới" },
  ]

  return (
    <div className="overflow-hidden rounded-xl" style={{ border: `1px solid ${TK.border}` }}>
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center gap-4 px-4 py-3.5 transition-colors hover:bg-[oklch(0.97_0.012_78)]"
        style={{ background: TK.card }}>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full" style={{ background: TK.sand }}>
          <Lock className="size-4" style={{ color: TK.camel }} strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="mb-0.5 text-[9px] font-bold tracking-[0.22em] uppercase" style={{ color: TK.sub }}>Mật khẩu</p>
          <p className="text-[14px] font-medium" style={{ color: TK.ink }}>
            {success ? "✓ Đã cập nhật" : "••••••••"}
          </p>
        </div>
        <Pencil className="size-3.5 shrink-0" style={{ color: TK.sub }} />
      </button>

      {open && (
        <div className="space-y-3 border-t px-4 py-4" style={{ borderColor: TK.border, background: TK.muted }}>
          {fields.map(({ key, label, val, set, ph }) => (
            <div key={key} className="space-y-1">
              <label className="text-[10px] font-semibold tracking-[0.22em] uppercase" style={{ color: TK.label }}>{label}</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  placeholder={ph}
                  className="h-10 w-full rounded-full border px-4 pr-10 text-[13px] outline-none"
                  style={{ border: `1px solid ${TK.border}`, background: TK.card, color: TK.ink }}
                />
                {key === "confirm" && (
                  <button type="button" onClick={() => setShow((v) => !v)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer" style={{ color: TK.sub }}>
                    {show ? <EyeOff className="size-4" strokeWidth={1.4} /> : <Eye className="size-4" strokeWidth={1.4} />}
                  </button>
                )}
              </div>
            </div>
          ))}

          {error && (
            <p className="rounded-md px-3 py-2 text-[12px] font-medium" style={{ background: TK.dangerBg, color: TK.danger }}>{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" onClick={submit}
              className="ribbon-tan h-9 flex-1 cursor-pointer rounded-full text-[11px] font-bold tracking-[0.16em] uppercase">
              Cập nhật
            </Button>
            <button type="button" onClick={() => { setOpen(false); setError(null) }}
              className="h-9 cursor-pointer rounded-full px-4 text-[11px] font-semibold transition-colors hover:bg-[oklch(0.94_0.014_75)]"
              style={{ color: TK.label }}>
              Huỷ
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[10px] font-bold tracking-[0.28em] uppercase" style={{ color: TK.label }}>
      {children}
    </p>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const { data: orders = [] } = useGetOrders()
  const { data: whitelist = [] } = useGetWhitelist()
  const hydrated = useSyncExternalStore(
    (cb) => useAuthStore.persist.onFinishHydration(cb),
    () => useAuthStore.persist.hasHydrated(),
    () => false
  )

  if (!hydrated) return null
  if (!user) { router.replace("/login"); return null }

  const RoleIcon = user.role === "admin" ? Shield : user.role === "supplier" ? Store : User

  return (
    <main className="min-h-[calc(100vh-3.6rem)]" style={{ background: TK.bg }}>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">

        {/* Eyebrow */}
        <div className="mb-8 flex items-center gap-3">
          <span className="h-px w-8" style={{ background: TK.camel }} />
          <span className="text-[10px] font-semibold tracking-[0.32em] uppercase" style={{ color: TK.sub }}>
            ✦ Tài khoản
          </span>
        </div>

        {/* Avatar + name */}
        <div className="mb-8 flex items-center gap-5">
          <Avatar className="size-20 ring-2 ring-[oklch(0.78_0.04_70)] ring-offset-2 ring-offset-[oklch(0.962_0.012_78)]">
            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
            <AvatarFallback className="text-[18px] font-semibold" style={{ background: "oklch(0.86 0.034 70)", color: "oklch(0.34 0.03 55)" }}>
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-display text-[28px] font-medium leading-tight tracking-tight" style={{ color: TK.ink }}>
              {user.name}
            </h1>
            <div className="mt-1 flex items-center gap-1.5">
              <RoleIcon className="size-3.5" style={{ color: TK.camel }} strokeWidth={1.6} />
              <span className="text-[12px] font-medium" style={{ color: TK.sub }}>
                {ROLE_LABEL[user.role]}
              </span>
            </div>
          </div>
        </div>

        {/* Quick stats — user only */}
        {user.role === "user" && (
          <>
            <div className="mb-8 grid grid-cols-2 gap-3">
              <Link href="/account/orders"
                className="group flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all hover:-translate-y-0.5"
                style={{ background: TK.card, border: `1px solid ${TK.border}`, boxShadow: "0 4px 16px -8px oklch(0.34 0.03 55 / 0.1)" }}>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full" style={{ background: TK.sand }}>
                  <Package className="size-5" style={{ color: TK.camel }} strokeWidth={1.4} />
                </div>
                <div>
                  <p className="font-display text-[22px] font-bold leading-none" style={{ color: TK.ink }}>{orders.length}</p>
                  <p className="mt-0.5 text-[11px]" style={{ color: TK.sub }}>Đơn thuê</p>
                </div>
              </Link>
              <div className="flex items-center gap-3 rounded-xl px-4 py-3.5"
                style={{ background: TK.card, border: `1px solid ${TK.border}`, boxShadow: "0 4px 16px -8px oklch(0.34 0.03 55 / 0.1)" }}>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full" style={{ background: TK.sand }}>
                  <Heart className="size-5" style={{ color: TK.camel }} strokeWidth={1.4} />
                </div>
                <div>
                  <p className="font-display text-[22px] font-bold leading-none" style={{ color: TK.ink }}>{whitelist.length}</p>
                  <p className="mt-0.5 text-[11px]" style={{ color: TK.sub }}>Yêu thích</p>
                </div>
              </div>
            </div>
            <div className="editorial-rule mb-8" />
          </>
        )}

        {/* ── Thông tin cá nhân ── */}
        <div className="mb-6 space-y-2">
          <SectionLabel>Thông tin cá nhân</SectionLabel>

          <EditableField label="Họ và tên" value={user.name} placeholder="Nhập họ và tên" icon={User}
            onSave={(v) => v && updateProfile({ name: v })} />

          <ReadOnlyField label="Email" value={user.email} icon={Mail} />

          {/* Supplier-only fields */}
          {user.role === "supplier" && (
            <>
              <EditableField label="Tên cửa hàng" value={(user as { shopName?: string }).shopName ?? ""} placeholder="Chưa cập nhật"
                icon={Store} onSave={(v) => updateProfile({ shopName: v })} />
              <EditableField label="Số điện thoại" value={user.phone ?? ""} placeholder="Chưa cập nhật"
                icon={Phone} type="tel" onSave={(v) => updateProfile({ phone: v })} />
              <EditableField label="Địa chỉ" value={user.address ?? ""} placeholder="Chưa cập nhật"
                icon={MapPin} onSave={(v) => updateProfile({ address: v })} />
            </>
          )}
        </div>

        {/* ── Bảo mật ── */}
        <div>
          <SectionLabel>Bảo mật</SectionLabel>
          <ChangePassword onSave={() => {/* handled inside ChangePassword via changePassword action */}} />
        </div>

      </div>
    </main>
  )
}
