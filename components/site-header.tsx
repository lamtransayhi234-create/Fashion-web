"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import {
  ArrowRight,
  Bell,
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Package,
  Plus,
  Search,
  Shield,
  ShoppingBag,
  Store,
  User,
  UserPlus,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { ROLE_LABEL, useAuthStore } from "@/lib/store/auth-store"

type NavItem = {
  label: string
  href: string
  matchPrefix?: string
  hasMenu?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Sản phẩm", href: "/shop", matchPrefix: "/shop", hasMenu: true },
  { label: "Tin tức", href: "/news", matchPrefix: "/news" },
  { label: "Giới thiệu", href: "/about", matchPrefix: "/about" },
]

const SHOP_CATEGORIES: { label: string; href: string; tag?: string }[] = [
  { label: "Váy dự tiệc", href: "/shop?c=vay-du-tiec" },
  { label: "Áo croptop", href: "/shop?c=ao-croptop" },
  { label: "Đồ đi biển", href: "/shop?c=do-di-bien" },
  { label: "Y2K Style", href: "/shop?c=y2k", tag: "HOT" },
  { label: "Vintage 90s", href: "/shop?c=vintage" },
  { label: "Xem tất cả danh mục", href: "/shop" },
]

function isActive(pathname: string, item: NavItem): boolean {
  if (item.href === "/") return pathname === "/"
  if (item.matchPrefix) return pathname.startsWith(item.matchPrefix)
  return pathname === item.href
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

export function SiteHeader() {
  const pathname = usePathname() ?? "/"
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileShopOpen, setMobileShopOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement | null>(null)

  // Auth — guard against SSR/hydration mismatch by reading after mount
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const hydrated = useSyncExternalStore(
    (cb) => useAuthStore.persist.onFinishHydration(cb),
    () => useAuthStore.persist.hasHydrated(),
    () => false
  )
  const authed = hydrated && isAuthenticated && !!user

  // Close account dropdown on outside click / esc
  useEffect(() => {
    if (!accountOpen) return
    function handleClick(e: MouseEvent) {
      if (
        accountRef.current &&
        !accountRef.current.contains(e.target as Node)
      ) {
        setAccountOpen(false)
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAccountOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleKey)
    }
  }, [accountOpen])

  const closeMobile = () => setMobileOpen(false)

  const handleLogout = () => {
    logout()
    setAccountOpen(false)
    setMobileOpen(false)
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[oklch(0.86_0.018_70)]/70 bg-[oklch(0.965_0.012_78)]/85 backdrop-blur-xl">
      {/* Promo strip */}
      <div className="flex items-center justify-center gap-2 bg-[oklch(0.18_0.014_55)] px-3 py-1.5 text-center text-[11px] font-semibold tracking-[0.18em] text-[oklch(0.94_0.014_75)] uppercase">
        <Heart className="size-3 shrink-0 fill-[oklch(0.78_0.04_70)] stroke-[oklch(0.78_0.04_70)]" />
        <span className="truncate">
          Freeship cho đơn đầu tiên — dùng code
          <span className="mx-1 inline-flex rounded-sm bg-[oklch(0.6_0.062_60)] px-2 py-0.5 font-bold tracking-[0.22em] text-white">
            HELLOLOOP
          </span>
        </span>
      </div>

      <nav className="mx-auto flex max-w-screen-2xl items-center justify-between gap-2 px-4 py-3 lg:gap-4 lg:px-8">
        {/* LEFT — hamburger (mobile) + logo + nav (desktop) */}
        <div className="flex items-center gap-2 lg:gap-8">
          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="size-10 shrink-0 cursor-pointer rounded-full text-[oklch(0.34_0.03_55)] hover:bg-[oklch(0.91_0.022_75)] hover:text-[oklch(0.6_0.062_60)] lg:hidden"
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </Button>

          <Link
            href="/"
            aria-label="StyleLoop — về trang chủ"
            onClick={closeMobile}
            className="group flex shrink-0 items-baseline gap-1.5 transition-transform duration-300 hover:scale-[1.02]"
          >
            <span className="font-display text-2xl font-black tracking-[0.05em] text-[oklch(0.18_0.014_55)] uppercase lg:text-[26px]">
              Style
            </span>
            <span className="font-display text-2xl font-medium tracking-tight text-[oklch(0.6_0.062_60)] italic lg:text-[26px]">
              Loop
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item)
              return (
                <div key={item.label} className="group/nav relative">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-1 px-4 py-2 text-[13px] font-medium tracking-[0.04em] transition-colors duration-200",
                      active
                        ? "text-[oklch(0.18_0.014_55)]"
                        : "text-[oklch(0.4_0.024_55)] hover:text-[oklch(0.18_0.014_55)]"
                    )}
                  >
                    {item.label}
                    {item.hasMenu && (
                      <ChevronDown className="size-3.5 opacity-60 transition-transform duration-200 group-hover/nav:rotate-180" />
                    )}
                    {active && (
                      <span
                        aria-hidden
                        className="absolute right-3 -bottom-0.5 left-3 h-px bg-[oklch(0.6_0.062_60)]"
                      />
                    )}
                  </Link>

                  {item.hasMenu && (
                    <div className="invisible absolute top-full left-0 z-50 pt-3 opacity-0 transition-[opacity,transform] duration-200 group-hover/nav:visible group-hover/nav:translate-y-0 group-hover/nav:opacity-100">
                      <div className="w-60 overflow-hidden rounded-md border border-[oklch(0.86_0.018_70)] bg-[oklch(0.99_0.008_78)] p-2 shadow-[0_24px_60px_-20px_oklch(0.34_0.03_55/0.3)] backdrop-blur-xl">
                        <p className="px-3 pt-1.5 pb-2 text-[10px] font-semibold tracking-[0.22em] text-[oklch(0.55_0.024_60)] uppercase">
                          Danh mục
                        </p>
                        {SHOP_CATEGORIES.map((cat, idx) => (
                          <Link
                            key={cat.label}
                            href={cat.href}
                            className={cn(
                              "flex items-center justify-between rounded-sm px-3 py-2 text-[13px] font-medium transition-colors duration-200",
                              idx === SHOP_CATEGORIES.length - 1
                                ? "mt-1 border-t border-[oklch(0.9_0.014_72)] pt-2.5 text-[oklch(0.6_0.062_60)] hover:bg-[oklch(0.94_0.014_75)]"
                                : "text-[oklch(0.34_0.03_55)] hover:bg-[oklch(0.94_0.014_75)] hover:text-[oklch(0.6_0.062_60)]"
                            )}
                          >
                            <span>{cat.label}</span>
                            {cat.tag && (
                              <span className="rounded-sm bg-[oklch(0.6_0.062_60)] px-1.5 py-0.5 text-[9px] font-bold tracking-[0.18em] text-white">
                                {cat.tag}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT — actions */}
        <div className="flex items-center gap-1 lg:gap-2">
          {/* Search — desktop inline */}
          <div className="relative hidden lg:block">
            <Input
              type="text"
              placeholder="Tìm váy, croptop, Y2K..."
              aria-label="Tìm sản phẩm"
              className="w-60 rounded-full border border-[oklch(0.86_0.018_70)] bg-[oklch(0.99_0.008_78)] px-5 py-2 pr-10 text-[13px] text-[oklch(0.24_0.018_55)] shadow-none transition-colors placeholder:text-[oklch(0.55_0.024_60)] focus-visible:border-[oklch(0.6_0.062_60)] focus-visible:ring-2 focus-visible:ring-[oklch(0.6_0.062_60/0.18)]"
            />
            <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[oklch(0.5_0.024_60)]" />
          </div>

          {/* Search — mobile icon */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Tìm kiếm"
            className="size-10 cursor-pointer rounded-full text-[oklch(0.34_0.03_55)] hover:bg-[oklch(0.91_0.022_75)] hover:text-[oklch(0.6_0.062_60)] lg:hidden"
          >
            <Search className="size-5" />
          </Button>

          {/* Giỏ hàng */}
          <Link href="/cart" aria-label="Giỏ hàng" onClick={closeMobile}>
            <Button
              variant="ghost"
              size="icon"
              className="relative size-10 cursor-pointer rounded-full text-[oklch(0.34_0.03_55)] hover:bg-[oklch(0.91_0.022_75)] hover:text-[oklch(0.6_0.062_60)]"
            >
              <ShoppingBag className="size-5" />
              <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[oklch(0.6_0.062_60)] text-[10px] font-bold text-white ring-2 ring-[oklch(0.965_0.012_78)]">
                2
              </span>
            </Button>
          </Link>

          {/* Thông báo — desktop only, only when logged in */}
          {authed && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Thông báo"
              className="relative hidden size-10 cursor-pointer rounded-full text-[oklch(0.34_0.03_55)] hover:bg-[oklch(0.91_0.022_75)] hover:text-[oklch(0.6_0.062_60)] lg:inline-flex"
            >
              <Bell className="size-5" />
              <span className="absolute top-2 right-2 size-1.5 rounded-full bg-[oklch(0.6_0.062_60)] ring-2 ring-[oklch(0.965_0.012_78)]" />
            </Button>
          )}

          {/* ───────── Tài khoản ───────── */}
          {!authed ? (
            <div className="ml-1 flex items-center gap-1.5 sm:gap-2">
              {/* ── Mobile: dropdown menu ── */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    aria-label="Tài khoản"
                    className="ribbon-tan size-10 cursor-pointer rounded-full sm:hidden"
                  >
                    <UserPlus className="size-4" strokeWidth={1.6} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={10}
                  className="w-56 rounded-md border-[oklch(0.86_0.018_70)] bg-[oklch(0.99_0.008_78)] shadow-[0_24px_60px_-20px_oklch(0.34_0.03_55/0.35)]"
                >
                  <DropdownMenuLabel className="text-[10px] font-semibold tracking-[0.32em] text-[oklch(0.55_0.024_60)] uppercase">
                    Tài khoản
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[oklch(0.9_0.014_72)]" />
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer rounded-sm py-2.5 text-[13px] font-medium text-[oklch(0.34_0.03_55)] focus:bg-[oklch(0.94_0.014_75)] focus:text-[oklch(0.6_0.062_60)]"
                  >
                    <Link
                      href="/login"
                      onClick={closeMobile}
                      className="flex items-center gap-3"
                    >
                      <LogIn className="size-4 opacity-70" strokeWidth={1.4} />
                      Đăng nhập
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer rounded-sm py-2.5 text-[13px] font-medium text-[oklch(0.18_0.014_55)] focus:bg-[oklch(0.94_0.014_75)] focus:text-[oklch(0.6_0.062_60)]"
                  >
                    <Link
                      href="/register"
                      onClick={closeMobile}
                      className="flex items-center gap-3"
                    >
                      <UserPlus
                        className="size-4 text-[oklch(0.6_0.062_60)]"
                        strokeWidth={1.4}
                      />
                      <span>Đăng ký</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* ── sm+: full pair as before ── */}
              <Link
                href="/login"
                onClick={closeMobile}
                className="hidden sm:block"
              >
                <Button
                  variant="outline"
                  className="h-9 cursor-pointer rounded-full border border-[oklch(0.18_0.014_55)]! bg-transparent px-4 text-[11px] font-semibold tracking-[0.18em] text-[oklch(0.18_0.014_55)] uppercase transition-colors duration-200 hover:border-[oklch(0.6_0.062_60)]! hover:bg-transparent hover:text-[oklch(0.6_0.062_60)] md:px-5 md:text-[12px] md:tracking-[0.22em]"
                >
                  Đăng nhập
                </Button>
              </Link>
              <Link
                href="/register"
                onClick={closeMobile}
                className="hidden sm:block"
              >
                <Button className="group/reg ribbon-tan h-9 cursor-pointer rounded-full pr-3 pl-4 text-[11px] font-semibold tracking-[0.18em] uppercase md:pr-3.5 md:pl-5 md:text-[12px] md:tracking-[0.22em]">
                  Đăng ký
                  <ArrowRight
                    className="size-3.5 transition-transform duration-300 ease-out group-hover/reg:translate-x-0.5"
                    strokeWidth={1.6}
                  />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="relative ml-1" ref={accountRef}>
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                aria-label="Tài khoản của tôi"
                onClick={() => setAccountOpen((v) => !v)}
                className="cursor-pointer rounded-full focus-visible:ring-2 focus-visible:ring-[oklch(0.6_0.062_60/0.45)] focus-visible:outline-none"
              >
                <Avatar className="size-9 ring-1 ring-[oklch(0.78_0.04_70)] ring-offset-2 ring-offset-[oklch(0.965_0.012_78)] transition-transform duration-300 hover:scale-105 lg:size-10">
                  {user?.avatar && (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  )}
                  <AvatarFallback className="bg-[oklch(0.86_0.034_70)] text-[12px] font-semibold tracking-wider text-[oklch(0.34_0.03_55)]">
                    {user ? getInitials(user.name) : "SL"}
                  </AvatarFallback>
                </Avatar>
              </button>

              {/* Dropdown */}
              <div
                role="menu"
                className={cn(
                  "absolute top-full right-0 z-50 mt-2 w-72 origin-top-right overflow-hidden rounded-md border border-[oklch(0.86_0.018_70)] bg-[oklch(0.99_0.008_78)] shadow-[0_24px_60px_-20px_oklch(0.34_0.03_55/0.35)] backdrop-blur-xl transition-[opacity,transform] duration-200",
                  accountOpen
                    ? "visible translate-y-0 opacity-100"
                    : "invisible -translate-y-1 opacity-0"
                )}
              >
                {/* Profile head */}
                <div className="flex items-center gap-3 border-b border-[oklch(0.9_0.014_72)] bg-[oklch(0.97_0.012_78)] px-4 py-3.5">
                  <Avatar className="size-11 ring-1 ring-[oklch(0.78_0.04_70)]">
                    {user?.avatar && (
                      <AvatarImage src={user.avatar} alt={user.name} />
                    )}
                    <AvatarFallback className="bg-[oklch(0.86_0.034_70)] text-[13px] font-semibold text-[oklch(0.34_0.03_55)]">
                      {user ? getInitials(user.name) : "SL"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-[15px] font-medium text-[oklch(0.18_0.014_55)]">
                      {user?.name}
                    </p>
                    <p className="truncate text-[11px] text-[oklch(0.5_0.024_60)]">
                      {user?.email}
                    </p>
                    {user && (
                      <span className="mt-1 inline-flex items-center gap-1 rounded-sm bg-[oklch(0.6_0.062_60)] px-1.5 py-0.5 text-[9px] font-bold tracking-[0.22em] text-white uppercase">
                        {user.role === "admin" && (
                          <Shield className="size-2.5" />
                        )}
                        {user.role === "supplier" && (
                          <Store className="size-2.5" />
                        )}
                        {user.role === "user" && <User className="size-2.5" />}
                        {ROLE_LABEL[user.role]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-1.5">
                  <Link
                    href="/account"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-[13px] font-medium text-[oklch(0.34_0.03_55)] transition-colors hover:bg-[oklch(0.94_0.014_75)] hover:text-[oklch(0.6_0.062_60)]"
                  >
                    <User className="size-4 opacity-70" strokeWidth={1.4} />
                    Tài khoản của tôi
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-[13px] font-medium text-[oklch(0.34_0.03_55)] transition-colors hover:bg-[oklch(0.94_0.014_75)] hover:text-[oklch(0.6_0.062_60)]"
                  >
                    <Package className="size-4 opacity-70" strokeWidth={1.4} />
                    Đơn thuê của tôi
                  </Link>

                  {user?.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-[13px] font-medium text-[oklch(0.34_0.03_55)] transition-colors hover:bg-[oklch(0.94_0.014_75)] hover:text-[oklch(0.6_0.062_60)]"
                    >
                      <LayoutDashboard
                        className="size-4 opacity-70"
                        strokeWidth={1.4}
                      />
                      Bảng điều khiển
                    </Link>
                  )}

                  {user?.role === "supplier" && (
                    <Link
                      href="/supplier"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-[13px] font-medium text-[oklch(0.34_0.03_55)] transition-colors hover:bg-[oklch(0.94_0.014_75)] hover:text-[oklch(0.6_0.062_60)]"
                    >
                      <Store className="size-4 opacity-70" strokeWidth={1.4} />
                      Cửa hàng của tôi
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 flex w-full cursor-pointer items-center gap-3 border-t border-[oklch(0.9_0.014_72)] px-3 pt-3 pb-2.5 text-[13px] font-medium text-[oklch(0.45_0.06_30)] transition-colors hover:bg-[oklch(0.94_0.014_75)] hover:text-[oklch(0.55_0.12_30)]"
                  >
                    <LogOut className="size-4 opacity-70" strokeWidth={1.4} />
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ─── Mobile drawer ─── */}
      <div
        className={cn(
          "overflow-hidden border-t border-[oklch(0.86_0.018_70)]/70 bg-[oklch(0.99_0.008_78)] backdrop-blur-xl transition-[max-height,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden",
          mobileOpen ? "max-h-[85vh] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="space-y-1 px-4 pt-3 pb-5">
          {/* Mobile search */}
          <div className="relative mb-3">
            <Input
              type="text"
              placeholder="Tìm váy, croptop, Y2K..."
              aria-label="Tìm sản phẩm"
              className="w-full rounded-full border border-[oklch(0.86_0.018_70)] bg-white px-5 py-2.5 pr-10 text-sm shadow-none"
            />
            <Search className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-[oklch(0.5_0.024_60)]" />
          </div>

          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item)
            if (item.hasMenu) {
              return (
                <div key={item.label}>
                  <button
                    type="button"
                    onClick={() => setMobileShopOpen((v) => !v)}
                    aria-expanded={mobileShopOpen}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between rounded-sm px-4 py-3 text-[14px] font-medium tracking-[0.04em] transition-colors duration-200",
                      active
                        ? "bg-[oklch(0.94_0.014_75)] text-[oklch(0.18_0.014_55)]"
                        : "text-[oklch(0.34_0.03_55)] hover:bg-[oklch(0.94_0.014_75)]"
                    )}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "size-4 opacity-70 transition-transform duration-200",
                        mobileShopOpen && "rotate-180"
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-[max-height,opacity] duration-300",
                      mobileShopOpen
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="mt-1 ml-2 space-y-0.5 border-l border-[oklch(0.86_0.018_70)] pl-3">
                      {SHOP_CATEGORIES.map((cat) => (
                        <Link
                          key={cat.label}
                          href={cat.href}
                          onClick={closeMobile}
                          className="flex items-center justify-between rounded-sm px-3 py-2 text-[13px] font-medium text-[oklch(0.4_0.024_55)] transition-colors hover:bg-[oklch(0.94_0.014_75)] hover:text-[oklch(0.6_0.062_60)]"
                        >
                          <span>{cat.label}</span>
                          {cat.tag && (
                            <span className="rounded-sm bg-[oklch(0.6_0.062_60)] px-1.5 py-0.5 text-[9px] font-bold tracking-[0.18em] text-white">
                              {cat.tag}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )
            }
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMobile}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center rounded-sm px-4 py-3 text-[14px] font-medium tracking-[0.04em] transition-colors duration-200",
                  active
                    ? "bg-[oklch(0.94_0.014_75)] text-[oklch(0.18_0.014_55)]"
                    : "text-[oklch(0.34_0.03_55)] hover:bg-[oklch(0.94_0.014_75)]"
                )}
              >
                {item.label}
              </Link>
            )
          })}

          {/* Auth block (mobile) */}
          <div className="mt-4 border-t border-[oklch(0.9_0.014_72)] pt-4">
            {!authed ? (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={closeMobile}>
                  <Button
                    variant="outline"
                    className="h-auto w-full cursor-pointer rounded-full border border-[oklch(0.34_0.03_55)] bg-transparent px-5 py-3 text-[12px] font-semibold tracking-[0.22em] uppercase hover:bg-[oklch(0.18_0.014_55)] hover:text-[oklch(0.97_0.012_78)]"
                  >
                    <LogIn className="size-4" />
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/register" onClick={closeMobile}>
                  <Button className="ribbon-tan h-auto w-full cursor-pointer rounded-full px-5 py-3 text-[12px] font-semibold tracking-[0.22em] uppercase">
                    <UserPlus className="size-4" />
                    Đăng ký tài khoản
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-2 pb-3">
                  <Avatar className="size-11 ring-1 ring-[oklch(0.78_0.04_70)]">
                    {user?.avatar && (
                      <AvatarImage src={user.avatar} alt={user.name} />
                    )}
                    <AvatarFallback className="bg-[oklch(0.86_0.034_70)] text-[13px] font-semibold text-[oklch(0.34_0.03_55)]">
                      {user ? getInitials(user.name) : "SL"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-[15px] font-medium text-[oklch(0.18_0.014_55)]">
                      {user?.name}
                    </p>
                    <p className="truncate text-[11px] text-[oklch(0.5_0.024_60)]">
                      {user && ROLE_LABEL[user.role]}
                    </p>
                  </div>
                </div>
                <Link
                  href="/account"
                  onClick={closeMobile}
                  className="flex items-center gap-3 rounded-sm px-4 py-3 text-[14px] font-medium text-[oklch(0.34_0.03_55)] hover:bg-[oklch(0.94_0.014_75)]"
                >
                  <User className="size-4 opacity-70" strokeWidth={1.4} />
                  Tài khoản của tôi
                </Link>
                <Link
                  href="/account/orders"
                  onClick={closeMobile}
                  className="flex items-center gap-3 rounded-sm px-4 py-3 text-[14px] font-medium text-[oklch(0.34_0.03_55)] hover:bg-[oklch(0.94_0.014_75)]"
                >
                  <Package className="size-4 opacity-70" strokeWidth={1.4} />
                  Đơn thuê của tôi
                </Link>
                {user?.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={closeMobile}
                    className="flex items-center gap-3 rounded-sm px-4 py-3 text-[14px] font-medium text-[oklch(0.34_0.03_55)] hover:bg-[oklch(0.94_0.014_75)]"
                  >
                    <LayoutDashboard
                      className="size-4 opacity-70"
                      strokeWidth={1.4}
                    />
                    Bảng điều khiển
                  </Link>
                )}
                {user?.role === "supplier" && (
                  <Link
                    href="/supplier"
                    onClick={closeMobile}
                    className="flex items-center gap-3 rounded-sm px-4 py-3 text-[14px] font-medium text-[oklch(0.34_0.03_55)] hover:bg-[oklch(0.94_0.014_75)]"
                  >
                    <Store className="size-4 opacity-70" strokeWidth={1.4} />
                    Cửa hàng của tôi
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-sm px-4 py-3 text-[14px] font-medium text-[oklch(0.45_0.06_30)] hover:bg-[oklch(0.94_0.014_75)]"
                >
                  <LogOut className="size-4 opacity-70" strokeWidth={1.4} />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>

          {/* CTA — Cho thuê đồ (mobile) */}
          {authed && (
            <Link
              href="/account/owner/new"
              onClick={closeMobile}
              className="mt-3 block"
            >
              <Button className="ribbon-tan h-auto w-full cursor-pointer rounded-full px-5 py-3 text-[13px] font-semibold tracking-[0.12em] uppercase">
                <Plus className="size-4" />
                Cho thuê đồ
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
