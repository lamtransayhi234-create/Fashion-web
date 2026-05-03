"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Eye, EyeOff, Lock, Mail, Phone, Store, StoreIcon, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { type UserRole, useAuthStore } from "@/lib/store/auth-store"

type RegisterRole = Exclude<UserRole, "admin">

const ROLE_OPTIONS: {
  value: RegisterRole
  label: string
  desc: string
  icon: typeof User
}[] = [
  {
    value: "user",
    label: "Khách thuê",
    desc: "Thuê & mua đồ từ cộng đồng.",
    icon: User,
  },
  {
    value: "supplier",
    label: "Nhà cung cấp",
    desc: "Mở gian hàng cho thuê tủ đồ.",
    icon: Store,
  },
]

export default function RegisterPage() {
  const router = useRouter()
  const register = useAuthStore((s) => s.register)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [role, setRole] = useState<RegisterRole>("user")
  const [shopName, setShopName] = useState("")
  const [phone, setPhone] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
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
    const res = register({
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

  return (
    <section className="grid min-h-[calc(100vh-3.6rem)] grid-cols-1 bg-[oklch(0.962_0.012_78)] lg:grid-cols-2">
      {/* ── Image side ── */}
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&q=85&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 h-full w-full object-cover grayscale-[0.08] saturate-[0.92]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-tr from-[oklch(0.18_0.014_55/0.45)] via-[oklch(0.18_0.014_55/0.05)] to-transparent"
        />
        <div className="absolute bottom-10 left-10 max-w-sm text-[oklch(0.97_0.012_78)]">
          <p className="text-[10px] font-semibold tracking-[0.32em] uppercase opacity-80">
            ✦ StyleLoop
          </p>
          <p className="mt-3 font-display text-[22px] leading-[1.3] italic">
            Phong cách không thuộc về ai — nó được trao tay, qua nhiều người.
          </p>
        </div>
      </div>

      {/* ── Form side ── */}
      <div className="flex items-center justify-center px-6 py-14 sm:px-10 lg:px-16">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[oklch(0.6_0.062_60)]" />
            <span className="text-[10px] font-semibold tracking-[0.32em] text-[oklch(0.55_0.024_60)] uppercase">
              ✦ Đăng ký
            </span>
          </div>

          <h1 className="mt-4 font-display text-[40px] leading-[1.05] font-medium tracking-[-0.01em] text-[oklch(0.18_0.014_55)] sm:text-[48px]">
            Tạo{" "}
            <em className="font-normal italic text-[oklch(0.6_0.062_60)]">
              tài khoản.
            </em>
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[oklch(0.48_0.022_60)]">
            Chọn loại tài khoản phù hợp — có thể đổi sau, không cần vội.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* ── Role chooser ── */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold tracking-[0.28em] text-[oklch(0.4_0.024_55)] uppercase">
                Loại tài khoản
              </p>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {ROLE_OPTIONS.map((opt) => {
                  const Icon = opt.icon
                  const active = role === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRole(opt.value)}
                      aria-pressed={active}
                      className={cn(
                        "group flex cursor-pointer items-center gap-3 rounded-md border px-3.5 py-2.5 text-left transition-colors",
                        active
                          ? "border-[oklch(0.6_0.062_60)] bg-[oklch(0.94_0.014_75)]"
                          : "border-[oklch(0.88_0.018_70)] bg-[oklch(0.99_0.008_78)] hover:border-[oklch(0.78_0.04_70)] hover:bg-[oklch(0.96_0.012_78)]"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors",
                          active
                            ? "border-[oklch(0.6_0.062_60)] bg-[oklch(0.6_0.062_60)] text-white"
                            : "border-[oklch(0.86_0.018_70)] bg-white text-[oklch(0.5_0.024_60)]"
                        )}
                      >
                        <Icon className="size-4" strokeWidth={1.4} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold tracking-[0.02em] text-[oklch(0.24_0.018_55)]">
                          {opt.label}
                        </p>
                        <p className="truncate text-[11px] text-[oklch(0.5_0.024_60)]">
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="text-[10px] font-semibold tracking-[0.28em] text-[oklch(0.4_0.024_55)] uppercase"
              >
                Họ và tên
              </label>
              <div className="relative">
                <User
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[oklch(0.55_0.024_60)]"
                  strokeWidth={1.4}
                />
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Bảo Linh"
                  className="h-11 w-full rounded-full border border-[oklch(0.86_0.018_70)] bg-[oklch(0.99_0.008_78)] pl-10 pr-4 text-[14px] text-[oklch(0.24_0.018_55)] outline-none placeholder:text-[oklch(0.6_0.024_60)] focus:border-[oklch(0.6_0.062_60)] focus:ring-2 focus:ring-[oklch(0.6_0.062_60/0.18)]"
                />
              </div>
            </div>

            {/* Shop name + phone (supplier) */}
            {role === "supplier" && (
              <>
                <div className="animate-in fade-in slide-in-from-top-1 space-y-1.5 duration-300">
                  <label
                    htmlFor="shopName"
                    className="text-[10px] font-semibold tracking-[0.28em] text-[oklch(0.4_0.024_55)] uppercase"
                  >
                    Tên cửa hàng
                  </label>
                  <div className="relative">
                    <StoreIcon
                      className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[oklch(0.55_0.024_60)]"
                      strokeWidth={1.4}
                    />
                    <input
                      id="shopName"
                      type="text"
                      required
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="Bảo Closet"
                      className="h-11 w-full rounded-full border border-[oklch(0.86_0.018_70)] bg-[oklch(0.99_0.008_78)] pl-10 pr-4 text-[14px] text-[oklch(0.24_0.018_55)] outline-none placeholder:text-[oklch(0.6_0.024_60)] focus:border-[oklch(0.6_0.062_60)] focus:ring-2 focus:ring-[oklch(0.6_0.062_60/0.18)]"
                    />
                  </div>
                </div>

                <div className="animate-in fade-in slide-in-from-top-1 space-y-1.5 duration-300">
                  <label
                    htmlFor="phone"
                    className="text-[10px] font-semibold tracking-[0.28em] text-[oklch(0.4_0.024_55)] uppercase"
                  >
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone
                      className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[oklch(0.55_0.024_60)]"
                      strokeWidth={1.4}
                    />
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0901 234 567"
                      className="h-11 w-full rounded-full border border-[oklch(0.86_0.018_70)] bg-[oklch(0.99_0.008_78)] pl-10 pr-4 text-[14px] text-[oklch(0.24_0.018_55)] outline-none placeholder:text-[oklch(0.6_0.024_60)] focus:border-[oklch(0.6_0.062_60)] focus:ring-2 focus:ring-[oklch(0.6_0.062_60/0.18)]"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-[10px] font-semibold tracking-[0.28em] text-[oklch(0.4_0.024_55)] uppercase"
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[oklch(0.55_0.024_60)]"
                  strokeWidth={1.4}
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ban@styleloop.vn"
                  className="h-11 w-full rounded-full border border-[oklch(0.86_0.018_70)] bg-[oklch(0.99_0.008_78)] pl-10 pr-4 text-[14px] text-[oklch(0.24_0.018_55)] outline-none placeholder:text-[oklch(0.6_0.024_60)] focus:border-[oklch(0.6_0.062_60)] focus:ring-2 focus:ring-[oklch(0.6_0.062_60/0.18)]"
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-[10px] font-semibold tracking-[0.28em] text-[oklch(0.4_0.024_55)] uppercase"
                  >
                    Mật khẩu
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    className="cursor-pointer p-0.5 text-[oklch(0.5_0.024_60)] transition-colors hover:text-[oklch(0.6_0.062_60)]"
                  >
                    {showPw ? (
                      <EyeOff className="size-3.5" strokeWidth={1.4} />
                    ) : (
                      <Eye className="size-3.5" strokeWidth={1.4} />
                    )}
                  </button>
                </div>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[oklch(0.55_0.024_60)]"
                    strokeWidth={1.4}
                  />
                  <input
                    id="password"
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="h-11 w-full rounded-full border border-[oklch(0.86_0.018_70)] bg-[oklch(0.99_0.008_78)] pl-10 pr-4 text-[14px] text-[oklch(0.24_0.018_55)] outline-none placeholder:text-[oklch(0.6_0.024_60)] focus:border-[oklch(0.6_0.062_60)] focus:ring-2 focus:ring-[oklch(0.6_0.062_60/0.18)]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="confirm"
                  className="text-[10px] font-semibold tracking-[0.28em] text-[oklch(0.4_0.024_55)] uppercase"
                >
                  Xác nhận
                </label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[oklch(0.55_0.024_60)]"
                    strokeWidth={1.4}
                  />
                  <input
                    id="confirm"
                    type={showPw ? "text" : "password"}
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Nhập lại"
                    className="h-11 w-full rounded-full border border-[oklch(0.86_0.018_70)] bg-[oklch(0.99_0.008_78)] pl-10 pr-4 text-[14px] text-[oklch(0.24_0.018_55)] outline-none placeholder:text-[oklch(0.6_0.024_60)] focus:border-[oklch(0.6_0.062_60)] focus:ring-2 focus:ring-[oklch(0.6_0.062_60/0.18)]"
                  />
                </div>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-md border border-[oklch(0.78_0.12_30/0.4)] bg-[oklch(0.96_0.04_30/0.4)] px-3.5 py-2.5 text-[12px] font-medium text-[oklch(0.45_0.12_30)]"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="ribbon-tan h-auto w-full cursor-pointer rounded-full px-8 py-3.5 text-[12px] font-semibold tracking-[0.22em] uppercase"
            >
              {loading ? "Đang xử lý..." : "Tạo tài khoản"}
            </Button>
          </form>

          <p className="mt-6 text-center text-[12px] text-[oklch(0.5_0.024_60)]">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="font-semibold text-[oklch(0.6_0.062_60)] hover:underline"
            >
              Đăng nhập tại đây
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
