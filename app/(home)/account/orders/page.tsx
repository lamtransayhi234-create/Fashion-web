"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { parseISO, isAfter, isBefore, isEqual, format } from "date-fns"
import {
  CalendarRange,
  ChevronRight,
  Clock,
  MapPin,
  Package,
  Palette,
  Phone,
  RotateCcw,
  ShoppingBag,
} from "lucide-react"

import { useAuthStore, type Order } from "@/lib/store/auth-store"
import { useGetOrders } from "@/lib/queries/orders/useGetOrders"
import { AccountOrdersSkeleton } from "@/components/skeletons"
import { Button } from "@/components/ui/button"

// ─── Rental status ────────────────────────────────────────────────────────────

type RentalStatus =
  | "upcoming"   // confirmed, toDate in future, fromDate in future
  | "active"     // confirmed, today between fromDate–toDate
  | "overdue"    // confirmed, today past toDate but status not completed
  | "completed"
  | "cancelled"
  | "pending"

function getRentalStatus(order: Order): RentalStatus {
  if (order.status === "cancelled") return "cancelled"
  if (order.status === "pending") return "pending"
  if (order.status === "completed") return "completed"

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const from = parseISO(order.fromDate)
  const to = parseISO(order.toDate)

  if (isBefore(today, from)) return "upcoming"
  if (isAfter(today, to)) return "overdue"
  return "active"
}

const RENTAL_STATUS_CONFIG: Record<
  RentalStatus,
  { label: string; dot: string; bg: string; text: string; border: string }
> = {
  active: {
    label: "Đang thuê",
    dot: "bg-[oklch(0.58_0.15_145)]",
    bg: "bg-[oklch(0.95_0.04_145)]",
    text: "text-[oklch(0.35_0.1_145)]",
    border: "border-[oklch(0.8_0.08_145)]",
  },
  upcoming: {
    label: "Chờ nhận đồ",
    dot: "bg-[oklch(0.65_0.12_240)]",
    bg: "bg-[oklch(0.95_0.03_240)]",
    text: "text-[oklch(0.38_0.1_240)]",
    border: "border-[oklch(0.82_0.07_240)]",
  },
  overdue: {
    label: "Quá hạn",
    dot: "bg-[oklch(0.6_0.18_30)]",
    bg: "bg-[oklch(0.96_0.04_30)]",
    text: "text-[oklch(0.42_0.14_30)]",
    border: "border-[oklch(0.82_0.09_30)]",
  },
  completed: {
    label: "Đã hoàn thành",
    dot: "bg-[oklch(0.55_0.03_60)]",
    bg: "bg-[oklch(0.94_0.014_75)]",
    text: "text-[oklch(0.42_0.022_58)]",
    border: "border-[oklch(0.86_0.018_70)]",
  },
  cancelled: {
    label: "Đã hủy",
    dot: "bg-[oklch(0.55_0.03_60)]",
    bg: "bg-[oklch(0.94_0.014_75)]",
    text: "text-[oklch(0.42_0.022_58)]",
    border: "border-[oklch(0.86_0.018_70)]",
  },
  pending: {
    label: "Chờ xác nhận",
    dot: "bg-[oklch(0.7_0.12_80)]",
    bg: "bg-[oklch(0.97_0.03_80)]",
    text: "text-[oklch(0.42_0.1_80)]",
    border: "border-[oklch(0.85_0.07_80)]",
  },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const router = useRouter()

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const hydrated = useAuthStore((s) => s.hydrated)
  const { data: orders = [], isLoading: ordersLoading } = useGetOrders("mine")

  const [filter, setFilter] = useState<RentalStatus | "all">("all")

  if (!hydrated || ordersLoading) return <AccountOrdersSkeleton />

  if (!isAuthenticated || !user) {
    router.replace("/login")
    return null
  }

  const activeCount = orders.filter((o) => getRentalStatus(o) === "active").length

  const FILTER_TABS: { key: RentalStatus | "all"; label: string }[] = [
    { key: "all",       label: "Tất cả"        },
    { key: "pending",   label: "Chờ xác nhận"  },
    { key: "upcoming",  label: "Chờ nhận đồ"   },
    { key: "active",    label: "Đang thuê"      },
    { key: "overdue",   label: "Quá hạn"        },
    { key: "completed", label: "Hoàn thành"     },
    { key: "cancelled", label: "Đã hủy"         },
  ]

  const visibleTabs = FILTER_TABS.filter((t) =>
    t.key === "all" || orders.some((o) => getRentalStatus(o) === t.key)
  )

  const filteredOrders = filter === "all"
    ? orders
    : orders.filter((o) => getRentalStatus(o) === filter)

  return (
    <div className="min-h-screen bg-[oklch(0.962_0.012_78)]">
      {/* Breadcrumb */}
      <div className="border-b border-[oklch(0.88_0.018_70)] bg-[oklch(0.94_0.014_75)]">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-8 py-3 lg:px-12">
          <Link
            href="/"
            className="text-[10px] font-semibold tracking-[0.22em] text-[oklch(0.52_0.03_58)] uppercase transition-colors hover:text-[oklch(0.18_0.014_55)]"
          >
            Trang chủ
          </Link>
          <ChevronRight className="size-3 text-[oklch(0.78_0.04_70)]" strokeWidth={1.4} />
          <span className="text-[10px] font-semibold tracking-[0.22em] text-[oklch(0.18_0.014_55)] uppercase">
            Đơn thuê của tôi
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-8 py-12 lg:px-12">
        {/* Heading */}
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-3">
              <span className="h-px w-8 bg-[oklch(0.6_0.062_60)]" />
              <span className="text-[10px] font-semibold tracking-[0.32em] text-[oklch(0.5_0.032_58)] uppercase">
                ✦ Lịch sử đặt thuê ✦
              </span>
            </div>
            <h1 className="font-display text-[36px] font-medium tracking-tight text-[oklch(0.18_0.014_55)]">
              Đơn thuê{" "}
              <span className="italic text-[oklch(0.6_0.062_60)]">của tôi</span>
            </h1>
            {orders.length > 0 && (
              <p className="mt-1.5 text-[13px] text-[oklch(0.5_0.03_58)]">
                {orders.length} đơn ·{" "}
                {activeCount > 0 && (
                  <span className="font-semibold text-[oklch(0.38_0.1_145)]">
                    {activeCount} đang thuê
                  </span>
                )}
                {activeCount === 0 && "Không có đơn nào đang thuê"}
              </p>
            )}
          </div>

          <Link href="/products">
            <Button className="ribbon-tan h-auto rounded-full px-6 py-3 text-[11px] font-semibold tracking-[0.2em] uppercase">
              <ShoppingBag className="size-3.5" strokeWidth={1.6} />
              Thuê thêm đồ
            </Button>
          </Link>
        </div>

        {/* Filter tabs */}
        {orders.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {visibleTabs.map((t) => {
              const active = filter === t.key
              const count = t.key === "all"
                ? orders.length
                : orders.filter((o) => getRentalStatus(o) === t.key).length

              const ACTIVE_COLORS: Record<RentalStatus | "all", { bg: string; color: string }> = {
                all:       { bg: "oklch(0.90 0.05 68)",   color: "oklch(0.42 0.07 60)"  },
                pending:   { bg: "oklch(0.97 0.03 80)",   color: "oklch(0.42 0.1 80)"   },
                upcoming:  { bg: "oklch(0.95 0.03 240)",  color: "oklch(0.38 0.1 240)"  },
                active:    { bg: "oklch(0.95 0.04 145)",  color: "oklch(0.35 0.1 145)"  },
                overdue:   { bg: "oklch(0.96 0.04 30)",   color: "oklch(0.42 0.14 30)"  },
                completed: { bg: "oklch(0.94 0.014 75)",  color: "oklch(0.42 0.022 58)" },
                cancelled: { bg: "oklch(0.94 0.014 75)",  color: "oklch(0.42 0.022 58)" },
              }

              const activeCfg = ACTIVE_COLORS[t.key]
              const bg    = active ? activeCfg.bg    : "oklch(0.96 0.008 78)"
              const color = active ? activeCfg.color : "oklch(0.55 0.024 60)"
              const border = active ? activeCfg.color : "oklch(0.88 0.018 70)"

              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setFilter(t.key)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase transition-all"
                  style={{ background: bg, color, border: `1.5px solid ${border}` }}
                >
                  {t.label}
                  {count > 0 && (
                    <span
                      className="flex size-4 items-center justify-center rounded-full text-[9px] font-bold"
                      style={{ background: "oklch(0 0 0 / 0.12)" }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Empty state */}
        {orders.length === 0 && (
          <div className="flex flex-col items-center gap-6 py-24 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-[oklch(0.91_0.022_75)]">
              <Package className="size-9 text-[oklch(0.6_0.062_60)]" strokeWidth={1.2} />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-[26px] font-medium text-[oklch(0.18_0.014_55)]">
                Chưa có đơn thuê nào
              </h2>
              <p className="text-[14px] text-[oklch(0.52_0.03_58)]">
                Bắt đầu khám phá tủ đồ và thuê bộ ưng ý nhất
              </p>
            </div>
            <Link href="/products">
              <Button className="ribbon-tan h-auto rounded-full px-8 py-4 text-[12px] font-semibold tracking-[0.22em] uppercase">
                Khám phá sản phẩm
              </Button>
            </Link>
          </div>
        )}

        {/* Filter empty state */}
        {orders.length > 0 && filteredOrders.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="font-display text-[20px] font-medium text-[oklch(0.18_0.014_55)]">
              Không có đơn nào
            </p>
            <p className="text-[13px] text-[oklch(0.52_0.03_58)]">
              Không có đơn nào trong trạng thái này
            </p>
          </div>
        )}

        {/* Order grid */}
        {filteredOrders.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filteredOrders.map((order) => {
              const rentalStatus = getRentalStatus(order)
              const cfg = RENTAL_STATUS_CONFIG[rentalStatus]
              const from = parseISO(order.fromDate)
              const to = parseISO(order.toDate)

              return (
                <div
                  key={order.id}
                  className="group flex flex-col overflow-hidden rounded-md transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: "oklch(0.99 0.008 78)",
                    border: "1px solid oklch(0.88 0.018 70)",
                    boxShadow: "0 4px 16px -8px oklch(0.34 0.03 55 / 0.12)",
                  }}
                >
                  {/* Ảnh */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-[oklch(0.94_0.014_75)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={order.productSrc}
                      alt={order.productName}
                      className="size-full object-cover grayscale-[0.05] transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    {/* Status badge */}
                    <div className="absolute top-2 left-2">
                      <span
                        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.08em] uppercase backdrop-blur-sm ${cfg.bg} ${cfg.text}`}
                      >
                        <span className={`size-1.5 rounded-full ${cfg.dot} ${rentalStatus === "active" ? "animate-pulse" : ""}`} />
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between p-3">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[oklch(0.52_0.03_58)]">
                        {order.productType}
                      </p>
                      <h3 className="line-clamp-2 font-display text-[13px] font-medium leading-snug text-[oklch(0.18_0.014_55)]">
                        {order.productName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-sm bg-[oklch(0.91_0.022_75)] px-1.5 py-0.5 text-[10px] font-semibold text-[oklch(0.28_0.022_55)] uppercase">
                          {order.size}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-[oklch(0.52_0.03_58)]">
                          <Palette className="size-3" strokeWidth={1.4} />
                          {order.color}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-[oklch(0.52_0.03_58)]">
                        <CalendarRange className="size-3 shrink-0 text-[oklch(0.6_0.062_60)]" strokeWidth={1.4} />
                        <span>
                          {format(from, "dd/MM")} → {format(to, "dd/MM")}
                          <span className="ml-1 font-semibold text-[oklch(0.28_0.022_55)]">· {order.nights}n</span>
                        </span>
                      </div>

                      <div className="flex items-start gap-1 text-[11px] text-[oklch(0.52_0.03_58)]">
                        <MapPin className="mt-0.5 size-3 shrink-0 text-[oklch(0.6_0.062_60)]" strokeWidth={1.4} />
                        <span className="line-clamp-1">{order.address}</span>
                      </div>
                      {order.phone && (
                        <div className="flex items-center gap-1 text-[11px] text-[oklch(0.52_0.03_58)]">
                          <Phone className="size-3 shrink-0 text-[oklch(0.6_0.062_60)]" strokeWidth={1.4} />
                          <span>{order.phone}</span>
                        </div>
                      )}

                      <div className="font-display text-[14px] font-semibold text-[oklch(0.18_0.014_55)]">
                        {order.total.toLocaleString("vi-VN")}đ
                        <span className="ml-1 font-display text-[11px] font-normal text-[oklch(0.52_0.03_58)]">
                          · cọc {order.deposit.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/product/${order.productId}`}
                      className="mt-3 text-[10px] font-semibold tracking-[0.14em] uppercase text-[oklch(0.52_0.03_58)] underline-offset-2 transition-colors hover:text-[oklch(0.6_0.062_60)] hover:underline"
                    >
                      Xem sản phẩm →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
