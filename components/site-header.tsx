"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState, useCallback } from "react"
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
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { ROLE_LABEL, useAuthStore } from "@/lib/store/auth-store"
import { useGetSubmissions } from "@/lib/queries/products/useGetSubmissions"
import { useGetOrders } from "@/lib/queries/orders/useGetOrders"
import { useGetWhitelist } from "@/lib/queries/whitelist/useGetWhitelist"
import { useToggleWhitelist } from "@/lib/queries/whitelist/useToggleWhitelist"
import {
  useGetSupplierNotifications,
  useNotificationsLastSeen,
} from "@/lib/queries/notifications"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import Image from "next/image"

type NavItem = {
  label: string
  href: string
  matchPrefix?: string
  hasMenu?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: "Trang chủ", href: "/" },
  {
    label: "Sản phẩm",
    href: "/products",
    matchPrefix: "/products",
    hasMenu: true,
  },
  { label: "Tin tức", href: "/news", matchPrefix: "/news" },
  { label: "Giới thiệu", href: "/about", matchPrefix: "/about" },
]

function typeHref(type: string) {
  return `/products?${new URLSearchParams({ type }).toString()}`
}

const SHOP_CATEGORIES: { label: string; href: string }[] = [
  { label: "Váy & Đầm", href: typeHref("Váy & Đầm") },
  { label: "Áo kiểu", href: typeHref("Áo kiểu") },
  { label: "Chân váy", href: typeHref("Chân váy") },
  { label: "Set", href: typeHref("Set") },
  { label: "Giày Dép", href: typeHref("Giày Dép") },
  { label: "Mũ & Nón", href: typeHref("Mũ & Nón") },
  { label: "Trang sức", href: typeHref("Trang sức") },
  { label: "Xem tất cả sản phẩm", href: "/products" },
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

function formatRelative(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: vi })
}

export function SiteHeader() {
  const pathname = usePathname() ?? "/"
  const router = useRouter()

  const [mobileShopOpen, setMobileShopOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [accountOpen, setAccountOpen] = useState(false)
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [supplierOrdersOpen, setSupplierOrdersOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifSheetOpen, setNotifSheetOpen] = useState(false)
  const [supplierDropdownOpen, setSupplierDropdownOpen] = useState(false)
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false)
  const [adminSheetOpen, setAdminSheetOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement | null>(null)
  const searchRef = useRef<HTMLInputElement | null>(null)

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const toggleWhitelist = useToggleWhitelist()
  const { data: wishlist = [] } = useGetWhitelist()
  const { data: orders = [] } = useGetOrders()
  const pendingOrders =
    user?.role === "supplier"
      ? orders.filter((o) => o.providerId === user.id && o.status === "pending")
      : []
  const pendingOrderCount = pendingOrders.length

  const { data: submittedProducts = [] } = useGetSubmissions()
  const pendingProducts = submittedProducts.filter(
    (p) => p.uploadStatus === "pending"
  )
  const pendingProductCount = pendingProducts.length

  // Bell notifications cho supplier (admin approve/reject sản phẩm)
  const { data: notifications = [] } = useGetSupplierNotifications()
  const { isUnread, markAllSeen } = useNotificationsLastSeen()
  const unreadNotifCount = notifications.filter((n) => isUnread(n.reviewedAt)).length

  const hydrated = useAuthStore((s) => s.hydrated)
  const authed = hydrated && isAuthenticated && !!user

  // Close account dropdown on outside click / esc
  useEffect(() => {
    if (!accountOpen) return
    function handleClick(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node))
        setAccountOpen(false)
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

  // Auto-focus search input when mobile search opens
  useEffect(() => {
    if (mobileSearchOpen) {
      setTimeout(() => searchRef.current?.focus(), 150)
    }
  }, [mobileSearchOpen])

  const handleLogout = () => {
    logout()
    setAccountOpen(false)
    // router.push("/")
  }

  const handleSearch = useCallback(
    (value: string) => {
      const kw = value.trim()
      if (!kw) return
      router.push(`/products?keyword=${encodeURIComponent(kw)}`)
      setMobileSearchOpen(false)
      setSearchValue("")
    },
    [router]
  )

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

      {/* ── Mobile search — fixed overlay covering header ── */}
      <div
        className={cn(
          "fixed inset-x-0 top-0 z-[60] flex items-center gap-2 border-b border-[oklch(0.86_0.018_70)] bg-[oklch(0.965_0.012_78)] px-4 backdrop-blur-xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] lg:hidden",
          mobileSearchOpen
            ? "pointer-events-auto translate-y-0"
            : "pointer-events-none -translate-y-full"
        )}
        style={{ height: "var(--header-h, 100px)" }}
      >
        <button
          type="button"
          onClick={() => {
            setMobileSearchOpen(false)
            setSearchValue("")
          }}
          className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-[oklch(0.34_0.03_55)] transition-colors hover:bg-[oklch(0.91_0.022_75)]"
          aria-label="Đóng tìm kiếm"
        >
          <ArrowLeft className="size-5" />
        </button>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSearch(searchValue)
          }}
          className="flex flex-1 items-center gap-2"
        >
          <Input
            ref={searchRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Tìm váy, croptop, Y2K..."
            className="flex-1 rounded-full border border-[oklch(0.86_0.018_70)] bg-[oklch(0.99_0.008_78)] px-4 text-[13px] text-[oklch(0.24_0.018_55)] shadow-none placeholder:text-[oklch(0.55_0.024_60)] focus-visible:border-[oklch(0.6_0.062_60)] focus-visible:ring-2 focus-visible:ring-[oklch(0.6_0.062_60/0.18)]"
          />
          <Button
            type="submit"
            className="ribbon-tan shrink-0 cursor-pointer rounded-full px-4 py-2 text-[11px] font-bold tracking-[0.18em] uppercase"
          >
            <Search className="size-4" />
            Tìm
          </Button>
        </form>
      </div>

      <nav className="mx-auto flex max-w-screen-2xl items-center justify-between gap-2 px-4 py-3 lg:gap-4 lg:px-8">
        {/* LEFT — Sheet (mobile) + logo + nav (desktop) */}
        <div className="flex items-center gap-2 lg:gap-8">
          {/* ── Mobile menu — shadcn Sheet ── */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Mở menu"
                className="size-10 shrink-0 cursor-pointer rounded-full text-[oklch(0.34_0.03_55)] hover:bg-[oklch(0.91_0.022_75)] hover:text-[oklch(0.6_0.062_60)] lg:hidden"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>

            <SheetContent
              showCloseButton={false}
              side="left"
              className="w-[80vw] max-w-[320px] border-r border-[oklch(0.86_0.018_70)] bg-[oklch(0.99_0.008_78)] p-0"
            >
              {/* Sheet header */}
              <div className="flex items-center justify-between border-b border-[oklch(0.86_0.018_70)] px-5 py-4">
                <Link href="/" className="flex items-baseline gap-1">
                  <span className="font-display text-xl font-black tracking-[0.05em] text-[oklch(0.18_0.014_55)] uppercase">
                    Style
                  </span>
                  <span className="font-display text-xl font-medium text-[oklch(0.6_0.062_60)] italic">
                    Loop
                  </span>
                </Link>
                <SheetClose asChild>
                  <button className="flex size-8 cursor-pointer items-center justify-center rounded-full text-[oklch(0.34_0.03_55)] transition-colors hover:bg-[oklch(0.91_0.022_75)]">
                    <X className="size-4" />
                  </button>
                </SheetClose>
              </div>

              {/* Nav items — NO search here */}
              <div className="overflow-y-auto px-3 py-3">
                {NAV_ITEMS.map((item) => {
                  const active = isActive(pathname, item)
                  if (item.hasMenu) {
                    return (
                      <div key={item.label}>
                        <button
                          type="button"
                          onClick={() => setMobileShopOpen((v) => !v)}
                          className={cn(
                            "flex w-full cursor-pointer items-center justify-between rounded-md px-4 py-3 text-[14px] font-medium tracking-[0.04em] transition-colors",
                            active
                              ? "bg-[oklch(0.94_0.014_75)] text-[oklch(0.18_0.014_55)]"
                              : "text-[oklch(0.34_0.03_55)] hover:bg-[oklch(0.94_0.014_75)]"
                          )}
                        >
                          <span>{item.label}</span>
                          <ChevronDown
                            className={cn(
                              "size-4 opacity-60 transition-transform duration-200",
                              mobileShopOpen && "rotate-180"
                            )}
                          />
                        </button>
                        <div
                          className={cn(
                            "overflow-hidden transition-[max-height,opacity] duration-200",
                            mobileShopOpen
                              ? "max-h-80 opacity-100"
                              : "max-h-0 opacity-0"
                          )}
                        >
                          <div className="mt-1 ml-3 space-y-0.5 border-l border-[oklch(0.86_0.018_70)] pl-3">
                            {SHOP_CATEGORIES.map((cat) => (
                              <SheetClose key={cat.label} asChild>
                                <Link
                                  href={cat.href}
                                  className="flex items-center rounded-md px-3 py-2 text-[13px] font-medium text-[oklch(0.4_0.024_55)] transition-colors hover:bg-[oklch(0.94_0.014_75)] hover:text-[oklch(0.6_0.062_60)]"
                                >
                                  {cat.label}
                                </Link>
                              </SheetClose>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return (
                    <SheetClose key={item.label} asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center rounded-md px-4 py-3 text-[14px] font-medium tracking-[0.04em] transition-colors",
                          active
                            ? "bg-[oklch(0.94_0.014_75)] text-[oklch(0.18_0.014_55)]"
                            : "text-[oklch(0.34_0.03_55)] hover:bg-[oklch(0.94_0.014_75)]"
                        )}
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  )
                })}
                {/* Divider */}
                {/* <div className="my-3 border-t border-[oklch(0.9_0.014_72)]" /> */}
                {/* Auth block
                {!authed ? (
                  <div className="flex flex-col gap-2 px-1">
                    <SheetClose asChild>
                      <Link href="/login">
                        <button className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-[oklch(0.18_0.014_55)] bg-[oklch(0.18_0.014_55)] px-5 text-[12px] font-bold tracking-[0.22em] text-[oklch(0.97_0.012_78)] uppercase transition-colors hover:bg-[oklch(0.34_0.03_55)]">
                          <LogIn className="size-4" /> Đăng nhập
                        </button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/register">
                        <button className="ribbon-tan flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-[12px] font-bold tracking-[0.22em] uppercase">
                          <UserPlus className="size-4" /> Đăng ký tài khoản
                        </button>
                      </Link>
                    </SheetClose>
                  </div>
                ) : (
                  <div className="space-y-0.5 px-1">
                    <div className="flex items-center gap-3 px-3 pb-3">
                      <Avatar className="size-10 ring-1 ring-[oklch(0.78_0.04_70)]">
                        {user?.avatar && (
                          <AvatarImage src={user.avatar} alt={user.name} />
                        )}
                        <AvatarFallback className="bg-[oklch(0.86_0.034_70)] text-[13px] font-semibold text-[oklch(0.34_0.03_55)]">
                          {user ? getInitials(user.name) : "SL"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-display text-[15px] font-medium text-[oklch(0.18_0.014_55)]">
                          {user?.name}
                        </p>
                        <p className="text-[11px] text-[oklch(0.5_0.024_60)]">
                          {user && ROLE_LABEL[user.role]}
                        </p>
                      </div>
                    </div>

                    {[
                      {
                        href: "/account",
                        icon: User,
                        label: "Tài khoản của tôi",
                        show: true,
                      },
                      {
                        href: "/account/orders",
                        icon: Package,
                        label: "Đơn thuê của tôi",
                        show: true,
                      },
                      {
                        href: "/admin",
                        icon: LayoutDashboard,
                        label: "Bảng điều khiển",
                        show: user?.role === "admin",
                      },
                      {
                        href: "/supplier",
                        icon: Store,
                        label: "Cửa hàng của tôi",
                        show: user?.role === "supplier",
                      },
                      {
                        href: "/account/ordered",
                        icon: Package,
                        label: "Đơn thuê của shop",
                        show: user?.role === "supplier",
                      },
                    ]
                      .filter((i) => i.show)
                      .map((i) => (
                        <SheetClose key={i.href} asChild>
                          <Link
                            href={i.href}
                            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-[14px] font-medium text-[oklch(0.34_0.03_55)] hover:bg-[oklch(0.94_0.014_75)]"
                          >
                            <i.icon
                              className="size-4 opacity-70"
                              strokeWidth={1.4}
                            />
                            {i.label}
                          </Link>
                        </SheetClose>
                      ))}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-[14px] font-medium text-[oklch(0.45_0.06_30)] hover:bg-[oklch(0.94_0.014_75)]"
                    >
                      <LogOut className="size-4 opacity-70" strokeWidth={1.4} />
                      Đăng xuất
                    </button>

                    {user?.role === "supplier" && (
                      <SheetClose asChild>
                        <Link href="/account/owner/new" className="mt-2 block">
                          <Button className="ribbon-tan h-auto w-full cursor-pointer rounded-full px-5 py-3 text-[13px] font-semibold tracking-[0.12em] uppercase">
                            <Plus className="size-4" /> Cho thuê đồ
                          </Button>
                        </Link>
                      </SheetClose>
                    )}
                  </div>
                )} */}
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link
            href="/"
            aria-label="StyleLoop — về trang chủ"
            className="group flex shrink-0 items-baseline gap-1.5 transition-transform duration-300 hover:scale-[1.02]"
          >
            <span className="font-display text-2xl font-black tracking-[0.05em] text-[oklch(0.18_0.014_55)] uppercase lg:text-[26px]">
              Style
            </span>
            <span className="font-display text-2xl font-medium tracking-tight text-[oklch(0.6_0.062_60)] italic lg:text-[26px]">
              Loop
            </span>
            {/* <Image
              src={"/styleloop_logo.png"}
              alt="StyleLoop"
              // className="scale-[1.25]"
              width={120}
              height={40}
            /> */}
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
                          Loại đồ
                        </p>
                        {SHOP_CATEGORIES.map((cat, idx) => (
                          <Link
                            key={cat.label}
                            href={cat.href}
                            className={cn(
                              "flex items-center rounded-sm px-3 py-2 text-[13px] font-medium transition-colors duration-200",
                              idx === SHOP_CATEGORIES.length - 1
                                ? "mt-1 border-t border-[oklch(0.9_0.014_72)] pt-2.5 text-[oklch(0.6_0.062_60)] hover:bg-[oklch(0.94_0.014_75)]"
                                : "text-[oklch(0.34_0.03_55)] hover:bg-[oklch(0.94_0.014_75)] hover:text-[oklch(0.6_0.062_60)]"
                            )}
                          >
                            {cat.label}
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
          {/* Desktop search — navigates to /products?keyword=... */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const kw = (
                e.currentTarget.elements.namedItem("q") as HTMLInputElement
              ).value.trim()
              if (kw) router.push(`/products?keyword=${encodeURIComponent(kw)}`)
            }}
            className="relative hidden lg:block"
          >
            <Input
              name="q"
              type="text"
              placeholder="Tìm váy, croptop, Y2K..."
              aria-label="Tìm sản phẩm"
              className="w-60 rounded-full border border-[oklch(0.6_0.062_60)] border-[oklch(0.86_0.018_70)] bg-[oklch(0.99_0.008_78)] px-5 py-2 pr-10 text-[13px] text-[oklch(0.24_0.018_55)] shadow-none ring-2 ring-[oklch(0.6_0.062_60/0.18)] transition-colors placeholder:text-[oklch(0.55_0.024_60)]"
            />
            <button
              type="submit"
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-[oklch(0.5_0.024_60)] transition-colors hover:text-[oklch(0.6_0.062_60)]"
            >
              <Search className="size-4" />
            </button>
          </form>

          {/* Mobile search toggle — triggers slide-down bar, NOT the Sheet */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Tìm kiếm"
            onClick={() => setMobileSearchOpen((v) => !v)}
            className="size-10 cursor-pointer rounded-full text-[oklch(0.34_0.03_55)] hover:bg-[oklch(0.91_0.022_75)] hover:text-[oklch(0.6_0.062_60)] lg:hidden"
          >
            {mobileSearchOpen ? (
              <X className="size-5" />
            ) : (
              <Search className="size-5" />
            )}
          </Button>

          {/* Supplier pending orders — Desktop: Dropdown */}
          {authed && user?.role === "supplier" && (
            <>
              {/* ── Bell — Thông báo admin duyệt/từ chối sản phẩm ── */}
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

              {/* ── Bell mobile sheet ── */}
              <Sheet
                open={notifSheetOpen}
                onOpenChange={(open) => {
                  setNotifSheetOpen(open)
                  if (open) markAllSeen()
                }}
              >
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Thông báo"
                    className="relative size-10 cursor-pointer rounded-full text-[oklch(0.34_0.03_55)] hover:bg-[oklch(0.91_0.022_75)] hover:text-[oklch(0.6_0.062_60)] lg:hidden"
                  >
                    <Bell className="size-5" strokeWidth={1.4} />
                    {unreadNotifCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[oklch(0.55_0.18_28)] text-[10px] font-bold text-white ring-2 ring-[oklch(0.965_0.012_78)]">
                        {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  showCloseButton={false}
                  className="w-[85vw] max-w-[360px] border-l border-[oklch(0.86_0.018_70)] bg-[oklch(0.99_0.008_78)] p-0"
                >
                  <SheetTitle className="sr-only">Thông báo</SheetTitle>
                  <div className="flex items-center justify-between border-b border-[oklch(0.9_0.014_72)] px-5 py-4">
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.28em] text-[oklch(0.4_0.024_55)] uppercase">
                        ✦ Thông báo
                      </p>
                      {notifications.length > 0 && (
                        <p className="text-[11px] text-[oklch(0.55_0.024_60)]">
                          {notifications.length} tin
                        </p>
                      )}
                    </div>
                    <SheetClose asChild>
                      <button className="flex size-8 cursor-pointer items-center justify-center rounded-full text-[oklch(0.34_0.03_55)] transition-colors hover:bg-[oklch(0.91_0.022_75)]">
                        <X className="size-4" />
                      </button>
                    </SheetClose>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                      <Bell
                        className="size-10 text-[oklch(0.78_0.04_70)]"
                        strokeWidth={1.2}
                      />
                      <p className="text-[13px] text-[oklch(0.55_0.024_60)]">
                        Chưa có thông báo
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-y-auto">
                      {notifications.map((n) => {
                        const unread = isUnread(n.reviewedAt)
                        const isApproved = n.type === "approved"
                        return (
                          <SheetClose key={n.id} asChild>
                            <Link
                              href="/supplier"
                              className={cn(
                                "relative flex items-start gap-3 border-b border-[oklch(0.95_0.012_76)] px-4 py-3 pl-6 transition-colors last:border-0 hover:bg-[oklch(0.97_0.012_78)]",
                                unread && "bg-[oklch(0.96_0.012_78)]",
                              )}
                            >
                              {unread && (
                                <span className="absolute top-4 left-2 size-1.5 rounded-full bg-[oklch(0.6_0.062_60)]" />
                              )}
                              <div className="size-14 shrink-0 overflow-hidden rounded-md bg-[oklch(0.94_0.014_75)]">
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
                                  <p className="mt-1 line-clamp-2 text-[11px] italic text-[oklch(0.55_0.024_60)]">
                                    Lý do: {n.rejectReason}
                                  </p>
                                )}
                              </div>
                            </Link>
                          </SheetClose>
                        )
                      })}
                    </div>
                  )}
                  {notifications.length > 0 && (
                    <div className="border-t border-[oklch(0.9_0.014_72)] p-3">
                      <SheetClose asChild>
                        <Link
                          href="/supplier"
                          className="flex w-full items-center justify-center rounded-sm py-2.5 text-[11px] font-semibold tracking-[0.14em] text-[oklch(0.6_0.062_60)] uppercase transition-colors hover:bg-[oklch(0.94_0.014_75)]"
                        >
                          Xem tất cả →
                        </Link>
                      </SheetClose>
                    </div>
                  )}
                </SheetContent>
              </Sheet>

              <DropdownMenu
                open={supplierDropdownOpen}
                onOpenChange={setSupplierDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Đơn chờ xác nhận"
                    className="relative hidden size-10 cursor-pointer rounded-full text-[oklch(0.34_0.03_55)] hover:bg-[oklch(0.91_0.022_75)] hover:text-[oklch(0.6_0.062_60)] lg:inline-flex"
                  >
                    <ClipboardList className="size-5" strokeWidth={1.4} />
                    {pendingOrderCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[oklch(0.55_0.18_28)] text-[10px] font-bold text-white ring-2 ring-[oklch(0.965_0.012_78)]">
                        {pendingOrderCount > 9 ? "9+" : pendingOrderCount}
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
                      ✦ Chờ xác nhận
                    </p>
                    {pendingOrderCount > 0 && (
                      <span className="text-[11px] text-[oklch(0.55_0.024_60)]">
                        {pendingOrderCount} đơn
                      </span>
                    )}
                  </div>
                  {pendingOrders.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-10 text-center">
                      <ClipboardList
                        className="size-8 text-[oklch(0.78_0.04_70)]"
                        strokeWidth={1.2}
                      />
                      <p className="text-[12px] text-[oklch(0.55_0.024_60)]">
                        Không có đơn nào chờ xác nhận
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[400px] overflow-y-auto">
                      {pendingOrders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center gap-3 border-b border-[oklch(0.95_0.012_76)] px-3 py-2.5 transition-colors last:border-0 hover:bg-[oklch(0.97_0.012_78)]"
                        >
                          <Link
                            href="/account/ordered"
                            onClick={() => setSupplierDropdownOpen(false)}
                            className="flex min-w-0 flex-1 items-center gap-3"
                          >
                            <div className="size-12 shrink-0 overflow-hidden rounded-md bg-[oklch(0.94_0.014_75)]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={order.productSrc}
                                alt={order.productName}
                                className="size-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] font-medium text-[oklch(0.18_0.014_55)]">
                                {order.productName}
                              </p>
                              <p className="text-[11px] text-[oklch(0.55_0.024_60)]">
                                {order.fromDate} → {order.toDate}
                              </p>
                              <p className="text-[12px] font-semibold text-[oklch(0.6_0.062_60)]">
                                {order.total.toLocaleString("vi-VN")}đ
                              </p>
                            </div>
                            <span className="shrink-0 rounded-sm bg-[oklch(0.91_0.022_75)] px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em] text-[oklch(0.38_0.028_58)] uppercase">
                              Chờ
                            </span>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                  {pendingOrders.length > 0 && (
                    <div className="border-t border-[oklch(0.9_0.014_72)] p-2">
                      <Link
                        href="/account/ordered"
                        onClick={() => setSupplierDropdownOpen(false)}
                        className="flex w-full items-center justify-center rounded-sm py-2 text-[11px] font-semibold tracking-[0.14em] text-[oklch(0.6_0.062_60)] uppercase transition-colors hover:bg-[oklch(0.94_0.014_75)]"
                      >
                        Xem tất cả đơn →
                      </Link>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile: Sheet */}
              <Sheet
                open={supplierOrdersOpen}
                onOpenChange={setSupplierOrdersOpen}
              >
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Đơn chờ xác nhận"
                    className="relative size-10 cursor-pointer rounded-full text-[oklch(0.34_0.03_55)] hover:bg-[oklch(0.91_0.022_75)] hover:text-[oklch(0.6_0.062_60)] lg:hidden"
                  >
                    <ClipboardList className="size-5" strokeWidth={1.4} />
                    {pendingOrderCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[oklch(0.55_0.18_28)] text-[10px] font-bold text-white ring-2 ring-[oklch(0.965_0.012_78)]">
                        {pendingOrderCount > 9 ? "9+" : pendingOrderCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  showCloseButton={false}
                  className="w-[85vw] max-w-[360px] border-l border-[oklch(0.86_0.018_70)] bg-[oklch(0.99_0.008_78)] p-0"
                >
                  <SheetTitle className="sr-only">Đơn chờ xác nhận</SheetTitle>
                  <div className="flex items-center justify-between border-b border-[oklch(0.9_0.014_72)] px-5 py-4">
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.28em] text-[oklch(0.4_0.024_55)] uppercase">
                        ✦ Chờ xác nhận
                      </p>
                      {pendingOrderCount > 0 && (
                        <p className="text-[11px] text-[oklch(0.55_0.024_60)]">
                          {pendingOrderCount} đơn
                        </p>
                      )}
                    </div>
                    <SheetClose asChild>
                      <button className="flex size-8 cursor-pointer items-center justify-center rounded-full text-[oklch(0.34_0.03_55)] transition-colors hover:bg-[oklch(0.91_0.022_75)]">
                        <X className="size-4" />
                      </button>
                    </SheetClose>
                  </div>
                  {pendingOrders.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                      <ClipboardList
                        className="size-10 text-[oklch(0.78_0.04_70)]"
                        strokeWidth={1.2}
                      />
                      <p className="text-[13px] text-[oklch(0.55_0.024_60)]">
                        Không có đơn nào chờ xác nhận
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-y-auto">
                      {pendingOrders.map((order) => (
                        <SheetClose key={order.id} asChild>
                          <Link
                            href="/account/ordered"
                            className="flex items-center gap-3 border-b border-[oklch(0.95_0.012_76)] px-4 py-3 last:border-0 hover:bg-[oklch(0.97_0.012_78)]"
                          >
                            <div className="size-14 shrink-0 overflow-hidden rounded-md bg-[oklch(0.94_0.014_75)]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={order.productSrc}
                                alt={order.productName}
                                className="size-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] font-medium text-[oklch(0.18_0.014_55)]">
                                {order.productName}
                              </p>
                              <p className="text-[11px] text-[oklch(0.55_0.024_60)]">
                                {order.fromDate} → {order.toDate}
                              </p>
                              <p className="mt-0.5 text-[12px] font-semibold text-[oklch(0.6_0.062_60)]">
                                {order.total.toLocaleString("vi-VN")}đ
                              </p>
                            </div>
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                  )}
                  {pendingOrders.length > 0 && (
                    <div className="border-t border-[oklch(0.9_0.014_72)] p-3">
                      <SheetClose asChild>
                        <Link
                          href="/account/ordered"
                          className="flex w-full items-center justify-center rounded-sm py-2.5 text-[11px] font-semibold tracking-[0.14em] text-[oklch(0.6_0.062_60)] uppercase transition-colors hover:bg-[oklch(0.94_0.014_75)]"
                        >
                          Xem tất cả đơn →
                        </Link>
                      </SheetClose>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </>
          )}

          {/* Admin pending products — Desktop: Dropdown + Mobile: Sheet */}
          {authed && user?.role === "admin" && (
            <>
              <DropdownMenu
                open={adminDropdownOpen}
                onOpenChange={setAdminDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Sản phẩm chờ duyệt"
                    className="relative hidden size-10 cursor-pointer rounded-full text-[oklch(0.34_0.03_55)] hover:bg-[oklch(0.91_0.022_75)] hover:text-[oklch(0.6_0.062_60)] lg:inline-flex"
                  >
                    <ClipboardCheck className="size-5" strokeWidth={1.4} />
                    {pendingProductCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[oklch(0.55_0.18_28)] text-[10px] font-bold text-white ring-2 ring-[oklch(0.965_0.012_78)]">
                        {pendingProductCount > 9 ? "9+" : pendingProductCount}
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
                      ✦ Chờ duyệt
                    </p>
                    {pendingProductCount > 0 && (
                      <span className="text-[11px] text-[oklch(0.55_0.024_60)]">
                        {pendingProductCount} sản phẩm
                      </span>
                    )}
                  </div>
                  {pendingProducts.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-10 text-center">
                      <ClipboardCheck
                        className="size-8 text-[oklch(0.78_0.04_70)]"
                        strokeWidth={1.2}
                      />
                      <p className="text-[12px] text-[oklch(0.55_0.024_60)]">
                        Không có sản phẩm nào chờ duyệt
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[400px] overflow-y-auto">
                      {pendingProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 border-b border-[oklch(0.95_0.012_76)] px-3 py-2.5 transition-colors last:border-0 hover:bg-[oklch(0.97_0.012_78)]"
                        >
                          <Link
                            href="/admin"
                            onClick={() => setAdminDropdownOpen(false)}
                            className="flex min-w-0 flex-1 items-center gap-3"
                          >
                            <div className="size-12 shrink-0 overflow-hidden rounded-md bg-[oklch(0.94_0.014_75)]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={product.src}
                                alt={product.name}
                                className="size-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] font-medium text-[oklch(0.18_0.014_55)]">
                                {product.name}
                              </p>
                              <p className="text-[11px] text-[oklch(0.55_0.024_60)]">
                                {product.shopName}
                              </p>
                              <p className="text-[12px] font-semibold text-[oklch(0.6_0.062_60)]">
                                {product.rentalPrice.toLocaleString("vi-VN")}đ /
                                ngày
                              </p>
                            </div>
                            <span className="shrink-0 rounded-sm bg-[oklch(0.91_0.022_75)] px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em] text-[oklch(0.38_0.028_58)] uppercase">
                              Chờ
                            </span>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                  {pendingProducts.length > 0 && (
                    <div className="border-t border-[oklch(0.9_0.014_72)] p-2">
                      <Link
                        href="/admin"
                        onClick={() => setAdminDropdownOpen(false)}
                        className="flex w-full items-center justify-center rounded-sm py-2 text-[11px] font-semibold tracking-[0.14em] text-[oklch(0.6_0.062_60)] uppercase transition-colors hover:bg-[oklch(0.94_0.014_75)]"
                      >
                        Xem tất cả →
                      </Link>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile: Sheet */}
              <Sheet open={adminSheetOpen} onOpenChange={setAdminSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Sản phẩm chờ duyệt"
                    className="relative size-10 cursor-pointer rounded-full text-[oklch(0.34_0.03_55)] hover:bg-[oklch(0.91_0.022_75)] hover:text-[oklch(0.6_0.062_60)] lg:hidden"
                  >
                    <ClipboardCheck className="size-5" strokeWidth={1.4} />
                    {pendingProductCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[oklch(0.55_0.18_28)] text-[10px] font-bold text-white ring-2 ring-[oklch(0.965_0.012_78)]">
                        {pendingProductCount > 9 ? "9+" : pendingProductCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  showCloseButton={false}
                  className="w-[85vw] max-w-[360px] border-l border-[oklch(0.86_0.018_70)] bg-[oklch(0.99_0.008_78)] p-0"
                >
                  <SheetTitle className="sr-only">
                    Sản phẩm chờ duyệt
                  </SheetTitle>
                  <div className="flex items-center justify-between border-b border-[oklch(0.9_0.014_72)] px-5 py-4">
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.28em] text-[oklch(0.4_0.024_55)] uppercase">
                        ✦ Chờ duyệt
                      </p>
                      {pendingProductCount > 0 && (
                        <p className="text-[11px] text-[oklch(0.55_0.024_60)]">
                          {pendingProductCount} sản phẩm
                        </p>
                      )}
                    </div>
                    <SheetClose asChild>
                      <button className="flex size-8 cursor-pointer items-center justify-center rounded-full text-[oklch(0.34_0.03_55)] transition-colors hover:bg-[oklch(0.91_0.022_75)]">
                        <X className="size-4" />
                      </button>
                    </SheetClose>
                  </div>
                  {pendingProducts.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                      <ClipboardCheck
                        className="size-10 text-[oklch(0.78_0.04_70)]"
                        strokeWidth={1.2}
                      />
                      <p className="text-[13px] text-[oklch(0.55_0.024_60)]">
                        Không có sản phẩm nào chờ duyệt
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-y-auto">
                      {pendingProducts.map((product) => (
                        <SheetClose key={product.id} asChild>
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 border-b border-[oklch(0.95_0.012_76)] px-4 py-3 last:border-0 hover:bg-[oklch(0.97_0.012_78)]"
                          >
                            <div className="size-14 shrink-0 overflow-hidden rounded-md bg-[oklch(0.94_0.014_75)]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={product.src}
                                alt={product.name}
                                className="size-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] font-medium text-[oklch(0.18_0.014_55)]">
                                {product.name}
                              </p>
                              <p className="text-[11px] text-[oklch(0.55_0.024_60)]">
                                {product.shopName}
                              </p>
                              <p className="mt-0.5 text-[12px] font-semibold text-[oklch(0.6_0.062_60)]">
                                {product.rentalPrice.toLocaleString("vi-VN")}đ /
                                ngày
                              </p>
                            </div>
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                  )}
                  {pendingProducts.length > 0 && (
                    <div className="border-t border-[oklch(0.9_0.014_72)] p-3">
                      <SheetClose asChild>
                        <Link
                          href="/admin"
                          className="flex w-full items-center justify-center rounded-sm py-2.5 text-[11px] font-semibold tracking-[0.14em] text-[oklch(0.6_0.062_60)] uppercase transition-colors hover:bg-[oklch(0.94_0.014_75)]"
                        >
                          Xem tất cả →
                        </Link>
                      </SheetClose>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </>
          )}

          {/* Wishlist — chỉ customer */}
          {authed && user?.role === "user" && (
            <>
              {/* Desktop: Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Yêu thích"
                    className="relative hidden size-10 cursor-pointer rounded-full text-[oklch(0.34_0.03_55)] hover:bg-[oklch(0.91_0.022_75)] hover:text-[oklch(0.6_0.062_60)] lg:inline-flex"
                  >
                    <Heart className="size-5" />
                    {wishlist.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[oklch(0.6_0.062_60)] text-[10px] font-bold text-white ring-2 ring-[oklch(0.965_0.012_78)]">
                        {wishlist.length}
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
                      ✦ Yêu thích
                    </p>
                    {wishlist.length > 0 && (
                      <span className="text-[11px] text-[oklch(0.55_0.024_60)]">
                        {wishlist.length} sản phẩm
                      </span>
                    )}
                  </div>

                  {wishlist.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-10 text-center">
                      <Heart
                        className="size-8 text-[oklch(0.78_0.04_70)]"
                        strokeWidth={1.2}
                      />
                      <p className="text-[12px] text-[oklch(0.55_0.024_60)]">
                        Chưa có sản phẩm yêu thích
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[400px] overflow-y-auto">
                      {wishlist.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 border-b border-[oklch(0.95_0.012_76)] px-3 py-2.5 transition-colors last:border-0 hover:bg-[oklch(0.97_0.012_78)]"
                        >
                          <Link
                            href={`/product/${product.id}`}
                            className="flex min-w-0 flex-1 items-center gap-3"
                          >
                            <div className="size-12 shrink-0 overflow-hidden rounded-md bg-[oklch(0.94_0.014_75)]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={product.src}
                                alt={product.name}
                                className="size-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] font-medium text-[oklch(0.18_0.014_55)]">
                                {product.name}
                              </p>
                              <p className="text-[12px] font-semibold text-[oklch(0.6_0.062_60)]">
                                {new Intl.NumberFormat("vi-VN").format(
                                  product.rentalPrice
                                )}
                                đ
                                <span className="ml-0.5 text-[10px] font-normal text-[oklch(0.55_0.024_60)]">
                                  /ngày
                                </span>
                              </p>
                            </div>
                          </Link>
                          <button
                            type="button"
                            onClick={() => toggleWhitelist.mutate(product)}
                            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-[oklch(0.55_0.024_60)] transition-colors hover:bg-[oklch(0.94_0.014_75)] hover:text-[oklch(0.45_0.06_30)]"
                            aria-label="Bỏ yêu thích"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile: Sheet */}
              <Sheet open={wishlistOpen} onOpenChange={setWishlistOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Yêu thích"
                    className="relative size-10 cursor-pointer rounded-full text-[oklch(0.34_0.03_55)] hover:bg-[oklch(0.91_0.022_75)] hover:text-[oklch(0.6_0.062_60)] lg:hidden"
                  >
                    <Heart className="size-5" />
                    {wishlist.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[oklch(0.6_0.062_60)] text-[10px] font-bold text-white ring-2 ring-[oklch(0.965_0.012_78)]">
                        {wishlist.length}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  showCloseButton={false}
                  className="w-[85vw] max-w-[360px] border-l border-[oklch(0.86_0.018_70)] bg-[oklch(0.99_0.008_78)] p-0"
                >
                  <SheetTitle className="sr-only">
                    Danh sách yêu thích
                  </SheetTitle>
                  <div className="flex items-center justify-between border-b border-[oklch(0.9_0.014_72)] px-5 py-4">
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.28em] text-[oklch(0.4_0.024_55)] uppercase">
                        ✦ Yêu thích
                      </p>
                      {wishlist.length > 0 && (
                        <p className="text-[11px] text-[oklch(0.55_0.024_60)]">
                          {wishlist.length} sản phẩm
                        </p>
                      )}
                    </div>
                    <SheetClose asChild>
                      <button className="flex size-8 cursor-pointer items-center justify-center rounded-full text-[oklch(0.34_0.03_55)] transition-colors hover:bg-[oklch(0.91_0.022_75)]">
                        <X className="size-4" />
                      </button>
                    </SheetClose>
                  </div>

                  {wishlist.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                      <Heart
                        className="size-10 text-[oklch(0.78_0.04_70)]"
                        strokeWidth={1.2}
                      />
                      <p className="text-[13px] text-[oklch(0.55_0.024_60)]">
                        Chưa có sản phẩm yêu thích
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-y-auto">
                      {wishlist.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 border-b border-[oklch(0.95_0.012_76)] px-4 py-3 last:border-0"
                        >
                          <SheetClose asChild>
                            <Link
                              href={`/product/${product.id}`}
                              className="flex min-w-0 flex-1 items-center gap-3"
                            >
                              <div className="size-14 shrink-0 overflow-hidden rounded-md bg-[oklch(0.94_0.014_75)]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={product.src}
                                  alt={product.name}
                                  className="size-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-medium text-[oklch(0.18_0.014_55)]">
                                  {product.name}
                                </p>
                                <p className="mt-0.5 text-[12px] font-semibold text-[oklch(0.6_0.062_60)]">
                                  {new Intl.NumberFormat("vi-VN").format(
                                    product.rentalPrice
                                  )}
                                  đ
                                  <span className="ml-0.5 text-[10px] font-normal text-[oklch(0.55_0.024_60)]">
                                    /ngày
                                  </span>
                                </p>
                              </div>
                            </Link>
                          </SheetClose>
                          <button
                            type="button"
                            onClick={() => toggleWhitelist.mutate(product)}
                            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-[oklch(0.55_0.024_60)] transition-colors hover:bg-[oklch(0.94_0.014_75)] hover:text-[oklch(0.45_0.06_30)]"
                            aria-label="Bỏ yêu thích"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </>
          )}

          {/* Tài khoản */}
          {!authed ? (
            <div className="ml-1 flex items-center gap-1.5 sm:gap-2">
              {/* xs: dropdown */}
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
                    <Link href="/login" className="flex items-center gap-3">
                      <LogIn className="size-4 opacity-70" strokeWidth={1.4} />
                      Đăng nhập
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer rounded-sm py-2.5 text-[13px] font-medium focus:bg-[oklch(0.94_0.014_75)] focus:text-[oklch(0.6_0.062_60)]"
                  >
                    <Link href="/register" className="flex items-center gap-3">
                      <UserPlus
                        className="size-4 text-[oklch(0.6_0.062_60)]"
                        strokeWidth={1.4}
                      />
                      Đăng ký
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link href="/login" className="hidden sm:block">
                <Button
                  variant="outline"
                  className="h-9 cursor-pointer rounded-full border border-[oklch(0.18_0.014_55)]! bg-transparent px-4 text-[11px] font-semibold tracking-[0.18em] text-[oklch(0.18_0.014_55)] uppercase transition-colors duration-200 hover:border-[oklch(0.6_0.062_60)]! hover:bg-transparent hover:text-[oklch(0.6_0.062_60)] md:px-5 md:text-[12px] md:tracking-[0.22em]"
                >
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/register" className="hidden sm:block">
                <Button className="group/reg ribbon-tan h-9 cursor-pointer rounded-full pr-3 pl-4 text-[11px] font-semibold tracking-[0.18em] uppercase md:pr-3.5 md:pl-5 md:text-[12px] md:tracking-[0.22em]">
                  Đăng ký{" "}
                  <ArrowRight
                    className="size-3.5 transition-transform duration-300 group-hover/reg:translate-x-0.5"
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

              <div
                role="menu"
                className={cn(
                  "absolute top-full right-0 z-50 mt-2 w-72 origin-top-right overflow-hidden rounded-md border border-[oklch(0.86_0.018_70)] bg-[oklch(0.99_0.008_78)] shadow-[0_24px_60px_-20px_oklch(0.34_0.03_55/0.35)] backdrop-blur-xl transition-[opacity,transform] duration-200",
                  accountOpen
                    ? "visible translate-y-0 opacity-100"
                    : "invisible -translate-y-1 opacity-0"
                )}
              >
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
                <div className="p-1.5">
                  {[
                    {
                      href: "/account",
                      icon: User,
                      label: "Tài khoản của tôi",
                      show: true,
                    },
                    {
                      href: "/account/orders",
                      icon: Package,
                      label: "Đơn thuê của tôi",
                      show: user?.role === "user",
                    },
                    {
                      href: "/admin",
                      icon: LayoutDashboard,
                      label: "Quản lý sản phẩm",
                      show: user?.role === "admin",
                    },
                    {
                      href: "/supplier",
                      icon: Store,
                      label: "Cửa hàng của tôi",
                      show: user?.role === "supplier",
                    },
                    {
                      href: "/account/ordered",
                      icon: Package,
                      label: "Đơn thuê của shop",
                      show: user?.role === "supplier",
                    },
                  ]
                    .filter((i) => i.show)
                    .map((i) => (
                      <Link
                        key={i.href}
                        href={i.href}
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-[13px] font-medium text-[oklch(0.34_0.03_55)] transition-colors hover:bg-[oklch(0.94_0.014_75)] hover:text-[oklch(0.6_0.062_60)]"
                      >
                        <i.icon
                          className="size-4 opacity-70"
                          strokeWidth={1.4}
                        />
                        {i.label}
                      </Link>
                    ))}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 flex w-full cursor-pointer items-center gap-3 border-t border-[oklch(0.9_0.014_72)] px-3 pt-3 pb-2.5 text-[13px] font-medium text-[oklch(0.45_0.06_30)] transition-colors hover:bg-[oklch(0.94_0.014_75)]"
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
    </header>
  )
}
