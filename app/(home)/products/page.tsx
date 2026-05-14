"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ChevronDown,
  SlidersHorizontal,
  X,
  Star,
  MapPin,
  ArrowUpRight,
  RotateCcw,
  Search,
  Layers,
  Wallet,
  Tag,
  CheckCircle2,
  Heart,
} from "lucide-react"

import {
  providers,
  type Product,
  type ProductCategory,
  type ProductType,
} from "@/lib/data/products"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/store/auth-store"
import { useGetProducts } from "@/lib/queries/products/useGetProducts"
import { useGetProviders } from "@/lib/queries/providers/useGetProviders"
import { useGetWhitelist } from "@/lib/queries/whitelist/useGetWhitelist"
import { useToggleWhitelist } from "@/lib/queries/whitelist/useToggleWhitelist"

// ─── Constants ───────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 12 // 3 hàng × 4 cột

const CATEGORIES: { value: ProductCategory | "all"; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "Trang phục", label: "Trang phục" },
  { value: "Giày Dép", label: "Giày Dép" },
  { value: "Phụ Kiện", label: "Phụ Kiện" },
]

const PRODUCT_TYPES: ProductType[] = [
  "Váy & Đầm",
  "Áo kiểu",
  "Áo khoác",
  "Chân váy",
  "Quần",
  "Jumpsuit",
  "Áo dài",
  "Set",
  "Cao gót",
  "Boots",
  "Sandal",
  "Sneakers",
  "Giày bệt",
  "Giày Dép",
  "Túi xách",
  "Mũ & Nón",
  "Trang sức",
  "Thắt lưng",
  "Khăn choàng",
  "Kính mát",
]

const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL"]
const SHOE_SIZES = ["35", "36", "37", "38", "39"]

const COLOR_GROUPS = [
  {
    label: "Trắng & Kem",
    dot: "#f0e4d0",
    kws: ["trắng", "kem", "champagne", "ngà", "ngọc", "voan"],
  },
  { label: "Đen", dot: "#1c1917", kws: ["đen"] },
  {
    label: "Be & Nâu",
    dot: "#b8956a",
    kws: ["be", "nâu", "cói", "tweed", "linen", "len"],
  },
  { label: "Hồng", dot: "#d4a0a0", kws: ["hồng", "mơ"] },
  { label: "Xanh", dot: "#607090", kws: ["xanh", "navy", "denim"] },
  { label: "Vàng & Đỏ", dot: "#c8924a", kws: ["vàng", "cam", "đỏ"] },
  {
    label: "Họa tiết",
    dot: "repeating-linear-gradient(45deg,#c8a882 0 3px,#f0e8d8 3px 8px)",
    kws: ["họa tiết", "chấm bi", "caro", "hoa", "kẻ", "nhiều", "floral"],
  },
]

const ALL_TAGS = [
  "Vintage",
  "Y2K",
  "Dự tiệc",
  "Đi biển",
  "Đi làm",
  "Chụp ảnh",
  "Dạo phố",
  "Casual",
  "Sang chảnh",
  "Cottagecore",
  "Boho",
  "Date night",
  "Cưới hỏi",
]

const LOCATIONS = [...new Set(providers.map((p) => p.location))]

const SORT_OPTIONS = [
  { value: "popular", label: "Phổ biến nhất" },
  { value: "price_asc", label: "Giá: Thấp → Cao" },
  { value: "price_desc", label: "Giá: Cao → Thấp" },
  { value: "rating", label: "Đánh giá cao nhất" },
]

const MAX_PRICE = 200000

// Hardcoded cream tokens — không bị dark mode override
const TK = {
  bg: "oklch(0.962 0.012 78)",
  sideBg: "oklch(0.952 0.016 74)",
  ink: "oklch(0.13 0.012 50)",
  muted: "oklch(0.42 0.022 55)",
  border: "oklch(0.84 0.018 70)",
  sand: "oklch(0.91 0.022 75)",
  camel: "oklch(0.6 0.062 60)",
  espresso: "oklch(0.18 0.014 55)",
  cream: "oklch(0.97 0.012 78)",
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ"
}

function matchColor(c: string, kws: string[]) {
  return kws.some((k) => c.toLowerCase().includes(k))
}

// ─── Filter types ─────────────────────────────────────────────────────────────

type Filters = {
  category: ProductCategory | "all"
  types: string[]
  sizes: string[]
  priceMax: number
  locations: string[]
  colors: string[]
  tags: string[]
}

const EMPTY: Filters = {
  category: "all",
  types: [],
  sizes: [],
  priceMax: MAX_PRICE,
  locations: [],
  colors: [],
  tags: [],
}

function isEqual(a: Filters, b: Filters) {
  return JSON.stringify(a) === JSON.stringify(b)
}

// ─── Sidebar section accordion ────────────────────────────────────────────────

function SideSection({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  title: string
  icon?: React.ElementType
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="py-4" style={{ borderBottom: `1px solid ${TK.border}` }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {Icon && (
            <Icon
              className="size-3.5"
              style={{ color: TK.camel }}
              strokeWidth={1.8}
            />
          )}
          <span
            className="text-[11px] font-black tracking-[0.24em] uppercase"
            style={{ color: TK.ink }}
          >
            {title}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform duration-200",
            open && "rotate-180"
          )}
          style={{ color: TK.muted }}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          open ? "mt-4 max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {children}
      </div>
    </div>
  )
}

// ─── Checkbox row ─────────────────────────────────────────────────────────────

function FCheck({
  on,
  onClick,
  label,
  count,
}: {
  on: boolean
  onClick: () => void
  label: string
  count?: number
}) {
  return (
    <label
      onClick={onClick}
      className="group flex cursor-pointer items-center gap-3 py-1.5"
    >
      <div
        className="flex size-[16px] flex-shrink-0 items-center justify-center rounded-[3px] transition-all"
        style={{
          border: on ? `1.5px solid ${TK.espresso}` : `1.5px solid ${TK.muted}`,
          background: on ? TK.espresso : "transparent",
        }}
      >
        {on && (
          <svg viewBox="0 0 10 10" className="size-2.5" fill="none">
            <path
              d="M1.5 5L4 7.5L8.5 2.5"
              stroke={TK.cream}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <span
        className="flex-1 text-[13px] font-medium transition-colors"
        style={{ color: on ? TK.ink : TK.muted }}
      >
        {label}
      </span>
      {count !== undefined && (
        <span className="text-[11px] font-semibold" style={{ color: TK.muted }}>
          {count}
        </span>
      )}
    </label>
  )
}

// ─── Size pill ────────────────────────────────────────────────────────────────

function SPill({
  on,
  onClick,
  label,
}: {
  on: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className="h-8 min-w-[36px] cursor-pointer rounded-md px-2.5 text-[11px] font-bold tracking-[0.04em] transition-all"
      style={{
        border: `1.5px solid ${on ? TK.espresso : TK.border}`,
        background: on ? TK.espresso : "transparent",
        color: on ? TK.cream : TK.ink,
      }}
    >
      {label}
    </button>
  )
}

// ─── Sidebar panel ─────────────────────────────────────────────────────────────

function SidebarPanel({
  pending,
  applied,
  onChange,
  onApply,
  onReset,
  allProducts,
}: {
  pending: Filters
  applied: Filters
  onChange: (f: Filters) => void
  onApply: () => void
  onReset: () => void
  allProducts: Product[]
}) {
  function toggle(key: keyof Filters, val: string) {
    const arr = pending[key] as string[]
    onChange({
      ...pending,
      [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val],
    })
  }

  const dirty = !isEqual(pending, applied)
  const activeCount =
    applied.types.length +
    applied.colors.length +
    applied.locations.length +
    applied.tags.length +
    (applied.priceMax < MAX_PRICE ? 1 : 0)

  return (
    <div>
      {/* Header */}
      <div
        className="flex items-center justify-between pt-1 pb-4"
        style={{ borderBottom: `1px solid ${TK.border}` }}
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal
            className="size-4"
            style={{ color: TK.camel }}
            strokeWidth={1.5}
          />
          <span
            className="text-[12px] font-black tracking-[0.22em] uppercase"
            style={{ color: TK.ink }}
          >
            Bộ lọc
          </span>
          {activeCount > 0 && (
            <span
              className="flex size-5 items-center justify-center rounded-full text-[9px] font-black"
              style={{ background: TK.espresso, color: TK.cream }}
            >
              {activeCount}
            </span>
          )}
        </div>
        {(activeCount > 0 || dirty) && (
          <button
            onClick={onReset}
            className="flex cursor-pointer items-center gap-1 text-[10px] font-bold tracking-[0.14em] uppercase transition-opacity hover:opacity-60"
            style={{ color: TK.camel }}
          >
            <RotateCcw className="size-3" /> Xoá
          </button>
        )}
      </div>

      {/* Apply button */}
      <div className="pt-3 pb-1">
        <button
          onClick={onApply}
          className="w-full cursor-pointer rounded-md py-2.5 text-[11px] font-black tracking-[0.2em] uppercase transition-all"
          style={{
            background: dirty ? TK.espresso : TK.sand,
            color: dirty ? TK.cream : TK.muted,
            border: `1.5px solid ${dirty ? TK.espresso : TK.border}`,
          }}
        >
          {dirty ? "✦ Áp dụng bộ lọc" : "Đã áp dụng"}
        </button>
      </div>

      {/* Loại đồ */}
      <SideSection title="Loại đồ" icon={Layers}>
        {PRODUCT_TYPES.map((type) => (
          <FCheck
            key={type}
            on={pending.types.includes(type)}
            onClick={() => toggle("types", type)}
            label={type}
            count={allProducts.filter((p) => p.type === type).length}
          />
        ))}
      </SideSection>

      {/* Màu sắc */}
      <SideSection title="Màu sắc">
        <div className="space-y-1">
          {COLOR_GROUPS.map((g) => {
            const on = pending.colors.includes(g.label)
            return (
              <button
                key={g.label}
                onClick={() => toggle("colors", g.label)}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-all"
                style={{
                  border: on
                    ? `1.5px solid ${TK.espresso}`
                    : `1.5px solid transparent`,
                  background: on ? TK.sand : "transparent",
                }}
              >
                <span
                  className="size-4 flex-shrink-0 rounded-full"
                  style={{
                    background: g.dot,
                    border: `1px solid ${TK.border}`,
                  }}
                />
                <span
                  className="flex-1 text-[12px] font-medium"
                  style={{ color: TK.ink }}
                >
                  {g.label}
                </span>
                {on && (
                  <CheckCircle2
                    className="size-3.5"
                    style={{ color: TK.espresso }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </SideSection>

      {/* Giá thuê */}
      <SideSection title="Giá thuê / ngày" icon={Wallet}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span
              className="text-[11px] font-medium"
              style={{ color: TK.muted }}
            >
              15.000đ
            </span>
            <span
              className="font-display text-[14px] font-bold"
              style={{ color: TK.ink }}
            >
              ≤ {fmt(pending.priceMax)}
            </span>
          </div>
          <input
            type="range"
            min={15000}
            max={MAX_PRICE}
            step={5000}
            value={pending.priceMax}
            onChange={(e) =>
              onChange({ ...pending, priceMax: Number(e.target.value) })
            }
            className="slider w-full cursor-pointer"
            style={{
              appearance: "none",
              height: "3px",
              borderRadius: "3px",
              outline: "none",
              background: `linear-gradient(to right, ${TK.espresso} 0%, ${TK.espresso} ${((pending.priceMax - 15000) / (MAX_PRICE - 15000)) * 100}%, ${TK.border} ${((pending.priceMax - 15000) / (MAX_PRICE - 15000)) * 100}%, ${TK.border} 100%)`,
            }}
          />
          <p
            className="text-center text-[10px] font-semibold tracking-[0.14em] uppercase"
            style={{ color: TK.muted }}
          >
            Tối đa {fmt(pending.priceMax)}/ngày
          </p>
        </div>
      </SideSection>

      {/* Khu vực */}
      <SideSection title="Khu vực" icon={MapPin}>
        {LOCATIONS.map((loc) => (
          <FCheck
            key={loc}
            on={pending.locations.includes(loc)}
            onClick={() => toggle("locations", loc)}
            label={loc}
          />
        ))}
      </SideSection>

      {/* Phong cách */}
      <SideSection title="Phong cách & Dịp" defaultOpen={false}>
        <div className="flex flex-wrap gap-1.5">
          {ALL_TAGS.map((tag) => {
            const on = pending.tags.includes(tag)
            return (
              <button
                key={tag}
                onClick={() => toggle("tags", tag)}
                className="cursor-pointer rounded-full px-3 py-1.5 text-[10px] font-bold tracking-[0.1em] uppercase transition-all"
                style={{
                  border: `1.5px solid ${on ? TK.espresso : TK.border}`,
                  background: on ? TK.espresso : "transparent",
                  color: on ? TK.cream : TK.ink,
                }}
              >
                {tag}
              </button>
            )
          })}
        </div>
      </SideSection>

      {/* Apply bottom */}
      <div className="pt-4">
        <button
          onClick={onApply}
          className="w-full cursor-pointer rounded-md py-2.5 text-[11px] font-black tracking-[0.2em] uppercase transition-all"
          style={{
            background: dirty ? TK.espresso : TK.sand,
            color: dirty ? TK.cream : TK.muted,
            border: `1.5px solid ${dirty ? TK.espresso : TK.border}`,
          }}
        >
          {dirty ? "✦ Áp dụng bộ lọc" : "Đã áp dụng"}
        </button>
      </div>
    </div>
  )
}

// ─── Active filter chip ────────────────────────────────────────────────────────

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.1em] uppercase"
      style={{
        border: `1px solid ${TK.border}`,
        background: TK.sand,
        color: TK.muted,
      }}
    >
      {label}
      <button
        onClick={onRemove}
        className="flex size-3.5 cursor-pointer items-center justify-center rounded-full"
        style={{ background: TK.espresso, color: TK.cream }}
      >
        <X className="size-2" />
      </button>
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function ProductsInner() {
  const { data: allProducts = [], isLoading: productsLoading } = useGetProducts()
  const { data: dynamicProviders = [] } = useGetProviders()
  const searchParams = useSearchParams()
  const router = useRouter()
  const keyword = searchParams.get("keyword")?.trim() ?? ""
  const typeParam = searchParams.get("type")?.trim() ?? ""

  function clearKeyword() {
    router.push("/products")
  }

  // Init filter from URL type param (e.g. /products?type=Váy+%26+Đầm)
  const initFilters = (): Filters => ({
    ...EMPTY,
    types: typeParam ? [typeParam] : [],
  })

  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const toggleWhitelist = useToggleWhitelist()
  const { data: whitelist = [] } = useGetWhitelist()
  const isCustomer = isAuthenticated && user?.role === "user"

  const [pending, setPending] = useState<Filters>(initFilters)
  const [applied, setApplied] = useState<Filters>(initFilters)

  // Sync when URL type param changes (client-side navigation)
  useEffect(() => {
    const next: Filters = { ...EMPTY, types: typeParam ? [typeParam] : [] }
    setPending(next)
    setApplied(next)
  }, [typeParam])
  const [sort, setSort] = useState("popular")
  const [page, setPage] = useState(1)
  const [mobileOpen, setMobileOpen] = useState(false)

  function applyFilters() {
    setApplied(pending)
    setPage(1)
  }
  function resetAll() {
    setPending(EMPTY)
    setApplied(EMPTY)
    setPage(1)
  }

  // Category tab changes applied immediately
  function setCategory(cat: ProductCategory | "all") {
    const next = { ...pending, category: cat }
    setPending(next)
    setApplied(next)
    setPage(1)
  }

  function removeApplied(key: keyof Filters, val: string) {
    const arr = applied[key] as string[]
    const next = { ...applied, [key]: arr.filter((x) => x !== val) }
    setApplied(next)
    setPending(next)
  }

  // Filter products using `applied` + keyword from URL
  const filtered = useMemo(() => {
    let r = [...allProducts]
    // keyword search — split thành từng từ, product phải match ÍT NHẤT 1 từ
    if (keyword) {
      const words = keyword.toLowerCase().split(/\s+/).filter(Boolean)
      r = r.filter((p) => {
        const haystack = [p.name, p.type, p.description, ...p.tags]
          .join(" ")
          .toLowerCase()
        return words.every((w) => haystack.includes(w))
      })
    }
    if (applied.category !== "all")
      r = r.filter((p) => p.category === applied.category)
    if (applied.types.length)
      r = r.filter((p) => applied.types.includes(p.type))
    if (applied.sizes.length)
      r = r.filter((p) => p.sizes.some((s) => applied.sizes.includes(s)))
    if (applied.colors.length)
      r = r.filter((p) =>
        applied.colors.some((c) => {
          const grp = COLOR_GROUPS.find((g) => g.label === c)
          return grp ? matchColor(p.color, grp.kws) : false
        })
      )
    if (applied.priceMax < MAX_PRICE)
      r = r.filter((p) => p.rentalPrice <= applied.priceMax)
    if (applied.locations.length)
      r = r.filter((p) => {
        const pv = providers.find((v) => v.id === p.providerId)
        return pv ? applied.locations.includes(pv.location) : false
      })
    if (applied.tags.length)
      r = r.filter((p) => applied.tags.some((t) => p.tags.includes(t)))
    switch (sort) {
      case "price_asc":
        r.sort((a, b) => a.rentalPrice - b.rentalPrice)
        break
      case "price_desc":
        r.sort((a, b) => b.rentalPrice - a.rentalPrice)
        break
      case "rating":
        r.sort((a, b) => b.rating - a.rating)
        break
    }
    return r
  }, [applied, sort, keyword])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Active chips (from applied state)
  const chips = [
    ...applied.types.map((v) => ({
      label: v,
      remove: () => removeApplied("types", v),
    })),
    ...applied.sizes.map((v) => ({
      label: v,
      remove: () => removeApplied("sizes", v),
    })),
    ...applied.colors.map((v) => ({
      label: v,
      remove: () => removeApplied("colors", v),
    })),
    ...applied.locations.map((v) => ({
      label: v,
      remove: () => removeApplied("locations", v),
    })),
    ...applied.tags.map((v) => ({
      label: v,
      remove: () => removeApplied("tags", v),
    })),
    ...(applied.priceMax < MAX_PRICE
      ? [
          {
            label: `≤ ${fmt(applied.priceMax)}`,
            remove: () => {
              const n = { ...applied, priceMax: MAX_PRICE }
              setApplied(n)
              setPending(n)
            },
          },
        ]
      : []),
  ]

  // Pagination pages with ellipsis
  function getPages(cur: number, tot: number) {
    if (tot <= 7) return Array.from({ length: tot }, (_, i) => i + 1)
    const pages: (number | "…")[] = [1]
    if (cur > 3) pages.push("…")
    for (let i = Math.max(2, cur - 1); i <= Math.min(tot - 1, cur + 1); i++)
      pages.push(i)
    if (cur < tot - 2) pages.push("…")
    pages.push(tot)
    return pages
  }

  const dirty = !isEqual(pending, applied)

  return (
    <div className="min-h-screen" style={{ background: TK.bg }}>
      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: TK.espresso }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 65% 100% at 78% 50%, oklch(0.4 0.05 60 / 0.35), transparent 70%)",
          }}
        />
        <div className="relative mx-auto flex flex-col gap-6 px-8 py-14 lg:max-w-[1200px] lg:flex-row lg:items-end lg:justify-between lg:px-12 xl:max-w-[1535px]">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="h-px w-10" style={{ background: TK.camel }} />
              <span
                className="text-[10px] font-semibold tracking-[0.32em] uppercase"
                style={{ color: TK.camel }}
              >
                ✦ StyleLoop Catalog ✦
              </span>
            </div>
            <h1
              className="font-display text-[38px] leading-tight font-medium tracking-[-0.02em] lg:text-[54px]"
              style={{ color: "oklch(0.97 0.012 78)" }}
            >
              Kho đồ{" "}
              <span
                className="italic"
                style={{ color: "oklch(0.86 0.034 70)" }}
              >
                xoay vòng
              </span>
            </h1>
            <p
              className="text-[13px]"
              style={{ color: "oklch(0.72 0.018 70)" }}
            >
              {allProducts.length} sản phẩm · Thuê từ cộng đồng chủ tủ trên cả nước
            </p>
          </div>
          <div className="hidden grid-cols-3 gap-12 text-right lg:grid">
            {[
              { n: `${allProducts.length}+`, label: "Sản phẩm" },
              { n: `${providers.length}`, label: "Chủ tủ" },
              { n: "24h", label: "Giao hàng" },
            ].map((s) => (
              <div key={s.label}>
                <p
                  className="font-display text-[32px] font-medium"
                  style={{ color: "oklch(0.97 0.012 78)" }}
                >
                  {s.n}
                </p>
                <p
                  className="text-[10px] tracking-[0.24em] uppercase"
                  style={{ color: "oklch(0.72 0.018 70)" }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Keyword banner ────────────────────────────────────────────────────── */}
      {keyword && (
        <div
          className="border-b px-8 py-5 lg:px-12"
          style={{ borderColor: TK.border, background: TK.sand }}
        >
          <div className="mx-auto flex items-center justify-between gap-4 lg:max-w-[1200px] xl:max-w-[1535px]">
            <div className="flex flex-wrap items-baseline gap-2">
              <p
                className="font-display text-[18px] font-medium lg:text-[22px]"
                style={{ color: TK.ink }}
              >
                Kết quả tìm kiếm cho{" "}
                <span className="italic" style={{ color: TK.camel }}>
                  &ldquo;{keyword}&rdquo;
                </span>
              </p>
              <span className="text-[13px]" style={{ color: TK.muted }}>
                —{" "}
                <span className="font-semibold" style={{ color: TK.ink }}>
                  {filtered.length}
                </span>{" "}
                sản phẩm
              </span>
            </div>
            <button
              onClick={clearKeyword}
              className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-[0.1em] uppercase transition-all hover:opacity-70"
              style={{
                border: `1.5px solid ${TK.border}`,
                color: TK.muted,
                background: "transparent",
              }}
            >
              <X className="size-3" />
              Xoá tìm kiếm
            </button>
          </div>
        </div>
      )}

      {/* ── Category tabs ─────────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-20 backdrop-blur-md"
        style={{ background: "oklch(0.962 0.012 78 / 0.95)" }}
      >
        {/* Tab row */}
        <div
          className="mx-auto flex items-center overflow-x-auto px-8 lg:max-w-[1200px] lg:px-12 xl:max-w-[1535px]"
          style={{ borderBottom: `1px solid oklch(0.88 0.018 70)` }}
        >
          {CATEGORIES.map((cat) => {
            const cnt =
              cat.value === "all"
                ? allProducts.length
                : allProducts.filter((p) => p.category === cat.value).length
            const active = applied.category === cat.value
            return (
              <button
                key={cat.value}
                onClick={() =>
                  setCategory(cat.value as ProductCategory | "all")
                }
                className="flex flex-shrink-0 cursor-pointer items-center gap-2 border-b-2 px-5 py-4 text-[11px] font-bold tracking-[0.18em] uppercase transition-all duration-200"
                style={{
                  borderBottomColor: active ? TK.espresso : "transparent",
                  color: active ? TK.espresso : TK.muted,
                }}
              >
                {cat.label}
                <span
                  className="rounded-sm px-1.5 py-0.5 text-[9px] font-bold"
                  style={{
                    background: active ? TK.espresso : TK.sand,
                    color: active ? TK.cream : TK.muted,
                  }}
                >
                  {cnt}
                </span>
              </button>
            )
          })}
        </div>

        {/* Mobile-only: filter button on its own row */}
        <div
          className="flex items-center px-4 py-2.5 lg:hidden"
          style={{ borderBottom: `1px solid oklch(0.88 0.018 70)` }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-[11px] font-bold tracking-[0.14em] uppercase transition-all"
            style={{
              border: `1px solid ${TK.border}`,
              color: TK.muted,
              background: "transparent",
            }}
          >
            <SlidersHorizontal className="size-4" />
            Bộ lọc
            {chips.length > 0 && (
              <span
                className="flex size-5 items-center justify-center rounded-full text-[8px] font-black"
                style={{ background: TK.espresso, color: TK.cream }}
              >
                {chips.length}
              </span>
            )}
          </button>
          {dirty && (
            <button
              onClick={applyFilters}
              className="ml-2 cursor-pointer rounded-md px-3 py-2 text-[11px] font-black tracking-[0.14em] uppercase"
              style={{ background: TK.espresso, color: TK.cream }}
            >
              Áp dụng
            </button>
          )}
        </div>
      </div>

      {/* ── Main ──────────────────────────────────────────────────────────────── */}
      <div className="mx-auto px-8 py-8 lg:max-w-[1200px] lg:px-12 xl:max-w-[1535px]">
        <div className="flex gap-8 lg:gap-10">
          {/* Sidebar — wider now */}
          <aside className="hidden w-64 flex-shrink-0 lg:block xl:w-72">
            <div className="sticky top-[53px]">
              <div
                className="no-scrollbar max-h-[calc(100vh-80px)] overflow-y-auto rounded-xl px-5 py-4"
                style={{
                  background: TK.sideBg,
                  border: `1px solid ${TK.border}`,
                }}
              >
                <SidebarPanel
                  pending={pending}
                  applied={applied}
                  onChange={setPending}
                  onApply={applyFilters}
                  onReset={resetAll}
                  allProducts={allProducts}
                />
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div className="min-w-0 flex-1">
            {/* Sort + count bar */}
            <div
              className="mb-5 flex items-center justify-between rounded-lg px-4 py-3"
              style={{ background: TK.sand, border: `1px solid ${TK.border}` }}
            >
              <div className="flex items-center gap-3">
                <p className="text-[13px]" style={{ color: TK.muted }}>
                  <span className="font-bold" style={{ color: TK.ink }}>
                    {filtered.length}
                  </span>{" "}
                  sản phẩm
                </p>
                {dirty && (
                  <button
                    onClick={applyFilters}
                    className="cursor-pointer rounded-full px-3 py-1 text-[10px] font-black tracking-[0.14em] uppercase transition-all"
                    style={{ background: TK.espresso, color: TK.cream }}
                  >
                    Áp dụng lọc
                  </button>
                )}
              </div>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value)
                  setPage(1)
                }}
                className="cursor-pointer rounded-md bg-transparent px-2 py-1 text-[11px] font-bold tracking-[0.1em] uppercase focus:outline-none"
                style={{ color: TK.ink, border: `1px solid ${TK.border}` }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Active chips */}
            {chips.length > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                {chips.map((c) => (
                  <Chip key={c.label} label={c.label} onRemove={c.remove} />
                ))}
                <button
                  onClick={resetAll}
                  className="cursor-pointer text-[10px] font-bold tracking-[0.14em] uppercase underline underline-offset-2 transition-opacity hover:opacity-60"
                  style={{ color: TK.muted }}
                >
                  Xoá tất cả
                </button>
              </div>
            )}

            {/* Empty */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-5 py-28 text-center">
                <div
                  className="flex size-20 items-center justify-center rounded-full"
                  style={{ background: TK.sand }}
                >
                  <Search
                    className="size-7"
                    style={{ color: TK.muted }}
                    strokeWidth={1.2}
                  />
                </div>
                <p
                  className="font-display text-2xl font-medium"
                  style={{ color: TK.espresso }}
                >
                  Không tìm thấy sản phẩm
                </p>
                <p className="text-[14px]" style={{ color: TK.muted }}>
                  Thử điều chỉnh bộ lọc để xem thêm kết quả
                </p>
                <button
                  onClick={resetAll}
                  className="ribbon-tan mt-2 cursor-pointer rounded-full px-8 py-3 text-[11px] font-bold tracking-[0.18em] uppercase"
                >
                  Xoá tất cả bộ lọc
                </button>
              </div>
            ) : (
              <>
                {/* 3 rows × 4 cols */}
                <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
                  {pageItems.map((product) => {
                    const pv = providers.find(
                      (p) => p.id === product.providerId
                    )
                    const savings = Math.round(
                      (1 - product.rentalPrice / product.brandPrice) * 100
                    )
                    const oos = product.status === "out_of_stock"

                    const isWishlisted =
                      whitelist.some((w) => w.id === product.id)

                    return (
                      <div key={product.id} className="group block h-full">
                        <div
                          className="flex h-full flex-col overflow-hidden rounded-xl transition-all duration-500 hover:-translate-y-1"
                          style={{
                            background: "oklch(0.995 0.004 80)",
                            border: `1px solid ${TK.border}`,
                            boxShadow:
                              "0 4px 16px -8px oklch(0.34 0.03 55 / 0.16)",
                          }}
                        >
                          {/* Image */}
                          <div
                            className="relative aspect-[3/4] flex-shrink-0 overflow-hidden"
                            style={{ background: TK.sand }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={product.src}
                              alt={product.name}
                              loading="lazy"
                              className="size-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.04]"
                            />
                            <div
                              aria-hidden
                              className="absolute inset-0 opacity-0 transition-opacity duration-400 group-hover:opacity-100"
                              style={{
                                background: "oklch(0.18 0.014 55 / 0.18)",
                              }}
                            />
                            {oos && (
                              <div
                                className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px]"
                                style={{
                                  background: "oklch(0.18 0.014 55 / 0.6)",
                                }}
                              >
                                <span
                                  className="rounded-sm px-3 py-1.5 text-[10px] font-black tracking-[0.24em] uppercase"
                                  style={{
                                    background: TK.espresso,
                                    color: "oklch(0.94 0.014 75)",
                                  }}
                                >
                                  Hết hàng
                                </span>
                              </div>
                            )}
                            <div className="absolute top-2.5 left-2.5">
                              <span
                                className="rounded-[3px] px-2 py-0.5 text-[9px] font-black tracking-[0.08em]"
                                style={{
                                  background: "oklch(0.18 0.014 55 / 0.88)",
                                  color: "oklch(0.97 0.012 78)",
                                  backdropFilter: "blur(4px)",
                                }}
                              >
                                -{savings}%
                              </span>
                            </div>
                            {isCustomer && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  toggleWhitelist.mutate(product)
                                }}
                                className="absolute top-2.5 right-2.5 flex size-8 cursor-pointer items-center justify-center rounded-full transition-all duration-200"
                                style={{
                                  background: isWishlisted
                                    ? TK.camel
                                    : "oklch(0.97 0.012 78 / 0.88)",
                                  backdropFilter: "blur(4px)",
                                  boxShadow:
                                    "0 2px 8px oklch(0.18 0.014 55 / 0.18)",
                                }}
                                aria-label={
                                  isWishlisted ? "Bỏ yêu thích" : "Yêu thích"
                                }
                              >
                                <Heart
                                  className="size-4 transition-all duration-200"
                                  style={{
                                    stroke: isWishlisted ? TK.cream : TK.muted,
                                    fill: isWishlisted
                                      ? TK.cream
                                      : "transparent",
                                  }}
                                  strokeWidth={1.8}
                                />
                              </button>
                            )}
                            {!oos && (
                              <div className="absolute inset-x-2.5 bottom-2.5 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                <Link
                                  href={`/product/${product.id}`}
                                  className="flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-[10px] font-black tracking-[0.18em] uppercase"
                                  style={{
                                    background: "oklch(0.97 0.012 78 / 0.95)",
                                    color: TK.espresso,
                                    backdropFilter: "blur(4px)",
                                  }}
                                >
                                  Thuê ngay{" "}
                                  <ArrowUpRight className="size-3.5" />
                                </Link>
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex flex-1 flex-col gap-2 p-3">
                            {/* Tags — fixed height row (always takes space) */}
                            <div className="flex h-[22px] flex-wrap gap-1 overflow-hidden">
                              {product.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[8px] font-bold tracking-[0.08em] uppercase"
                                  style={{
                                    background: TK.sand,
                                    color: TK.muted,
                                  }}
                                >
                                  <Tag className="size-2" />
                                  {tag}
                                </span>
                              ))}
                            </div>

                            {/* Name — grows to fill space → pushes price section down */}
                            <h3
                              className="line-clamp-2 flex-1 font-display text-[13px] leading-snug font-medium tracking-tight"
                              style={{ color: TK.ink }}
                            >
                              {product.name}
                            </h3>

                            {/* Sizes — fixed height */}
                            <div className="flex h-[22px] flex-wrap gap-1 overflow-hidden">
                              {product.sizes.slice(0, 4).map((s) => (
                                <span
                                  key={s}
                                  className="rounded-[2px] px-1.5 py-0.5 text-[8px] font-semibold"
                                  style={{
                                    border: `1px solid ${TK.border}`,
                                    color: TK.muted,
                                  }}
                                >
                                  {s === "Free Size" ? "OS" : s}
                                </span>
                              ))}
                            </div>

                            {/* Giá thuê */}
                            <div className="flex items-baseline gap-1">
                              <span
                                className="font-display text-[15px] font-bold"
                                style={{ color: TK.ink }}
                              >
                                {fmt(product.rentalPrice)}
                              </span>
                              <span
                                className="text-[10px]"
                                style={{ color: TK.muted }}
                              >
                                /ngày
                              </span>
                            </div>

                            {/* Giá hãng — không có % giảm */}
                            <div
                              className="flex items-center gap-1.5 rounded-md px-2 py-1.5"
                              style={{ background: TK.sand }}
                            >
                              <span
                                className="text-[9px] font-black tracking-[0.12em] uppercase"
                                style={{ color: TK.muted }}
                              >
                                Giá hãng:
                              </span>
                              <span
                                className="text-[11px] font-semibold line-through"
                                style={{ color: TK.camel }}
                              >
                                {fmt(product.brandPrice)}
                              </span>
                            </div>

                            <div
                              style={{ height: "1px", background: TK.border }}
                            />

                            {/* Provider */}
                            <div className="flex items-center gap-2">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              {/* <img
                                src={pv?.avatar}
                                alt={pv?.shopName}
                                className="size-5 flex-shrink-0 rounded-full"
                                style={{ border: `1px solid ${TK.border}` }}
                              /> */}
                              <div className="min-w-0 flex-1">
                                <p
                                  className="truncate text-[10px] font-semibold"
                                  style={{ color: TK.espresso }}
                                >
                                  {pv?.shopName}
                                </p>
                                <p
                                  className="flex items-center gap-0.5 text-[9px]"
                                  style={{ color: TK.muted }}
                                >
                                  <MapPin className="size-2.5" />
                                  {pv?.location}
                                </p>
                              </div>
                              <div
                                className="flex flex-shrink-0 items-center gap-1 rounded-md px-2 py-1"
                                style={{ background: TK.sand }}
                              >
                                <Star
                                  className="size-2.5"
                                  style={{ fill: TK.camel, stroke: TK.camel }}
                                />
                                <span
                                  className="text-[10px] font-bold"
                                  style={{ color: TK.espresso }}
                                >
                                  {product.rating}.0
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      {/* Prev */}
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="flex h-9 cursor-pointer items-center gap-1 rounded-md px-3 text-[11px] font-bold tracking-[0.12em] uppercase transition-all disabled:cursor-not-allowed disabled:opacity-30"
                        style={{
                          border: `1px solid ${TK.border}`,
                          color: TK.ink,
                          background: "transparent",
                        }}
                      >
                        ← Trước
                      </button>

                      {/* Page numbers */}
                      {getPages(currentPage, totalPages).map((n, i) =>
                        n === "…" ? (
                          <span
                            key={`e${i}`}
                            className="flex size-9 items-center justify-center text-[13px]"
                            style={{ color: TK.muted }}
                          >
                            ···
                          </span>
                        ) : (
                          <button
                            key={n}
                            onClick={() => setPage(n as number)}
                            className="flex size-9 cursor-pointer items-center justify-center rounded-md text-[13px] font-bold transition-all"
                            style={{
                              border: `1.5px solid ${n === currentPage ? TK.espresso : TK.border}`,
                              background:
                                n === currentPage ? TK.espresso : "transparent",
                              color: n === currentPage ? TK.cream : TK.ink,
                            }}
                          >
                            {n}
                          </button>
                        )
                      )}

                      {/* Next */}
                      <button
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="flex h-9 cursor-pointer items-center gap-1 rounded-md px-3 text-[11px] font-bold tracking-[0.12em] uppercase transition-all disabled:cursor-not-allowed disabled:opacity-30"
                        style={{
                          border: `1px solid ${TK.border}`,
                          color: TK.ink,
                          background: "transparent",
                        }}
                      >
                        Sau →
                      </button>
                    </div>
                    <p className="text-[11px]" style={{ color: TK.muted }}>
                      Trang{" "}
                      <span style={{ color: TK.ink, fontWeight: 700 }}>
                        {currentPage}
                      </span>
                      /{totalPages}
                      {" · "}
                      <span style={{ color: TK.ink, fontWeight: 700 }}>
                        {filtered.length}
                      </span>{" "}
                      sản phẩm
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 backdrop-blur-sm lg:hidden"
            style={{ background: "oklch(0.18 0.014 55 / 0.5)" }}
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div
            className="fixed right-0 bottom-0 left-0 z-50 max-h-[88dvh] overflow-y-auto rounded-t-2xl px-6 pt-3 pb-8 lg:hidden"
            style={{ background: TK.bg }}
          >
            <div
              className="mx-auto mb-5 h-1 w-12 rounded-full"
              style={{ background: TK.border }}
            />
            <div className="mb-4 flex items-center justify-between">
              <span
                className="font-display text-xl font-medium"
                style={{ color: TK.ink }}
              >
                Bộ lọc
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex size-9 cursor-pointer items-center justify-center rounded-full"
                style={{ background: TK.sand }}
              >
                <X className="size-4" style={{ color: TK.muted }} />
              </button>
            </div>
            <SidebarPanel
              pending={pending}
              applied={applied}
              onChange={setPending}
              onApply={() => {
                applyFilters()
                setMobileOpen(false)
              }}
              onReset={resetAll}
              allProducts={allProducts}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen"
          style={{ background: "oklch(0.962 0.012 78)" }}
        />
      }
    >
      <ProductsInner />
    </Suspense>
  )
}
