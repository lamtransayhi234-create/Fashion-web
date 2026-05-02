"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"
import { Eye, EyeOff, Lock, Mail, Shield, Store, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/store/auth-store"
import { cn } from "@/lib/utils"

const DEMO_ACCOUNTS = [
  {
    role: "Khách thuê",
    icon: User,
    email: "user1@styleloop.vn",
    password: "user123",
  },
  {
    role: "Quản trị",
    icon: Shield,
    email: "admin@styleloop.vn",
    password: "admin123",
  },
  {
    role: "Cung cấp",
    icon: Store,
    email: "supplier1@styleloop.vn",
    password: "supplier123",
  },
]

function LoginInner() {
  const router = useRouter()
  const search = useSearchParams()
  const redirect = search?.get("redirect") || "/"
  const login = useAuthStore((s) => s.login)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const res = login(email, password)
    setLoading(false)
    if (!res.success) {
      setError(res.message)
      return
    }
    router.push(redirect)
  }

  const fillDemo = (acc: (typeof DEMO_ACCOUNTS)[number]) => {
    setEmail(acc.email)
    setPassword(acc.password)
    setError(null)
  }

  return (
    <section className="grid min-h-[calc(100vh-3.6rem)] grid-cols-1 bg-[oklch(0.962_0.012_78)] lg:grid-cols-2">
      {/* ── Image side ── */}
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=1400&q=85&auto=format&fit=crop"
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
            Tủ đồ xoay vòng — mặc chất, tiết kiệm, bền vững.
          </p>
        </div>
      </div>

      {/* ── Form side ── */}
      <div className="flex items-center justify-center px-6 py-14 sm:px-10 lg:px-16">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-2 duration-500">
          {/* Eyebrow */}
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[oklch(0.6_0.062_60)]" />
            <span className="text-[10px] font-semibold tracking-[0.32em] text-[oklch(0.55_0.024_60)] uppercase">
              ✦ Đăng nhập
            </span>
          </div>

          {/* Headline */}
          <h1 className="mt-4 font-display text-[40px] leading-[1.05] font-medium tracking-[-0.01em] text-[oklch(0.18_0.014_55)] sm:text-[48px]">
            Chào mừng{" "}
            <em className="font-normal italic text-[oklch(0.6_0.062_60)]">
              trở lại.
            </em>
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[oklch(0.48_0.022_60)]">
            Nhập email và mật khẩu để truy cập tài khoản của bạn.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-[10px] font-semibold tracking-[0.28em] text-[oklch(0.4_0.024_55)] uppercase"
                >
                  Mật khẩu
                </label>
                <Link
                  href="#"
                  className="text-[11px] font-medium text-[oklch(0.6_0.062_60)] hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[oklch(0.55_0.024_60)]"
                  strokeWidth={1.4}
                />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-full border border-[oklch(0.86_0.018_70)] bg-[oklch(0.99_0.008_78)] pl-10 pr-11 text-[14px] text-[oklch(0.24_0.018_55)] outline-none placeholder:text-[oklch(0.6_0.024_60)] focus:border-[oklch(0.6_0.062_60)] focus:ring-2 focus:ring-[oklch(0.6_0.062_60/0.18)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-full p-1.5 text-[oklch(0.5_0.024_60)] transition-colors hover:bg-[oklch(0.91_0.022_75)] hover:text-[oklch(0.6_0.062_60)]"
                >
                  {showPw ? (
                    <EyeOff className="size-4" strokeWidth={1.4} />
                  ) : (
                    <Eye className="size-4" strokeWidth={1.4} />
                  )}
                </button>
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
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
          </form>

          <p className="mt-6 text-center text-[12px] text-[oklch(0.5_0.024_60)]">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="font-semibold text-[oklch(0.6_0.062_60)] hover:underline"
            >
              Đăng ký miễn phí
            </Link>
          </p>

          {/* ── Demo accounts ── */}
          <div className="mt-8 border-t border-[oklch(0.88_0.018_70)] pt-5">
            <p className="text-[10px] font-semibold tracking-[0.28em] text-[oklch(0.55_0.024_60)] uppercase">
              Tài khoản demo · bấm để điền
            </p>
            <div className="mt-3 grid gap-1.5 sm:grid-cols-3">
              {DEMO_ACCOUNTS.map((acc) => {
                const Icon = acc.icon
                const filled =
                  email === acc.email && password === acc.password
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => fillDemo(acc)}
                    className={cn(
                      "group flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2.5 text-left transition-colors",
                      filled
                        ? "border-[oklch(0.6_0.062_60)] bg-[oklch(0.94_0.014_75)]"
                        : "border-[oklch(0.88_0.018_70)] bg-[oklch(0.99_0.008_78)] hover:border-[oklch(0.78_0.04_70)] hover:bg-[oklch(0.96_0.012_78)]"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0 transition-colors",
                        filled
                          ? "text-[oklch(0.6_0.062_60)]"
                          : "text-[oklch(0.5_0.024_60)] group-hover:text-[oklch(0.6_0.062_60)]"
                      )}
                      strokeWidth={1.4}
                    />
                    <span className="truncate text-[11px] font-semibold tracking-[0.04em] text-[oklch(0.24_0.018_55)]">
                      {acc.role}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  )
}
