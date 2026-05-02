"use client"

import { useSyncExternalStore } from "react"
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
  RotateCcw,
  ShoppingBag,
} from "lucide-react"

import { useAuthStore, type Order } from "@/lib/store/auth-store"
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
  const hydrated = useSyncExternalStore(
    (cb) => useAuthStore.persist.onFinishHydration(cb),
    () => useAuthStore.persist.hasHydrated(),
    () => false
  )

  if (!hydrated) return null

  if (!isAuthenticated || !user) {
    router.replace("/login")
    return null
  }

  const orders = user.orders ?? []
  const activeCount = orders.filter((o) => getRentalStatus(o) === "active").length

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

        {/* Order list */}
        {orders.length > 0 && (
          <div className="space-y-5">
            {orders.map((order) => {
              const rentalStatus = getRentalStatus(order)
              const cfg = RENTAL_STATUS_CONFIG[rentalStatus]
              const from = parseISO(order.fromDate)
              const to = parseISO(order.toDate)

              return (
                <article
                  key={order.id}
                  className="soft-shadow overflow-hidden rounded-md bg-[oklch(0.99_0.008_78)] ring-1 ring-[oklch(0.88_0.018_70)]"
                >
                  {/* Card header — order meta */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[oklch(0.9_0.014_72)] bg-[oklch(0.97_0.01_76)] px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-semibold tracking-[0.2em] text-[oklch(0.52_0.03_58)] uppercase">
                        Mã đơn
                      </span>
                      <span className="font-display text-[13px] font-semibold text-[oklch(0.18_0.014_55)]">
                        #{order.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[oklch(0.58_0.03_58)]">
                        {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                      </span>
                      {/* Rental status label */}
                      <span
                        className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase ${cfg.bg} ${cfg.text} ${cfg.border}`}
                      >
                        <span className={`size-1.5 rounded-full ${cfg.dot} ${rentalStatus === "active" ? "animate-pulse" : ""}`} />
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="flex flex-col gap-5 p-5 sm:flex-row">
                    {/* Product image */}
                    <div className="h-36 w-28 shrink-0 overflow-hidden rounded-sm bg-[oklch(0.94_0.014_75)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={order.productSrc}
                        alt={order.productName}
                        className="h-full w-full object-cover grayscale-[0.06]"
                      />
                    </div>

                    {/* Product info */}
                    <div className="flex flex-1 flex-col gap-4">
                      <div>
                        <div className="mb-0.5 text-[10px] font-semibold tracking-[0.2em] text-[oklch(0.52_0.03_58)] uppercase">
                          {order.productType}
                        </div>
                        <h3 className="font-display text-[20px] leading-tight font-medium text-[oklch(0.18_0.014_55)]">
                          {order.productName}
                        </h3>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-sm bg-[oklch(0.91_0.022_75)] px-2.5 py-1 text-[11px] font-semibold tracking-wider text-[oklch(0.28_0.022_55)] uppercase">
                            Size {order.size}
                          </span>
                          <span className="flex items-center gap-1.5 text-[12px] text-[oklch(0.42_0.025_58)]">
                            <Palette className="size-3.5" strokeWidth={1.4} />
                            {order.color}
                          </span>
                        </div>
                      </div>

                      {/* Date + address row */}
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="flex items-start gap-2 text-[12px] text-[oklch(0.42_0.025_58)]">
                          <CalendarRange
                            className="mt-0.5 size-3.5 shrink-0 text-[oklch(0.6_0.062_60)]"
                            strokeWidth={1.4}
                          />
                          <span>
                            {format(from, "dd/MM/yyyy")} →{" "}
                            {format(to, "dd/MM/yyyy")}
                            <span className="ml-1 font-semibold text-[oklch(0.28_0.022_55)]">
                              · {order.nights} ngày
                            </span>
                          </span>
                        </div>
                        <div className="flex items-start gap-2 text-[12px] text-[oklch(0.42_0.025_58)]">
                          <MapPin
                            className="mt-0.5 size-3.5 shrink-0 text-[oklch(0.6_0.062_60)]"
                            strokeWidth={1.4}
                          />
                          <span className="line-clamp-2">{order.address}</span>
                        </div>
                      </div>

                      {/* Payment + note */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[oklch(0.52_0.03_58)]">
                        <span className="flex items-center gap-1.5 rounded-sm bg-[oklch(0.94_0.014_75)] px-2.5 py-1">
                          <Clock className="size-3" strokeWidth={1.4} />
                          {order.paymentMethodLabel}
                        </span>
                        {order.note && (
                          <span className="italic">
                            &ldquo;{order.note.slice(0, 60)}{order.note.length > 60 ? "…" : ""}&rdquo;
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price block */}
                    <div className="flex shrink-0 flex-col items-end justify-between gap-4 sm:w-40">
                      <div className="text-right">
                        <div className="text-[10px] font-semibold tracking-[0.2em] text-[oklch(0.52_0.03_58)] uppercase">
                          Tiền thuê
                        </div>
                        <div className="font-display text-[22px] font-semibold text-[oklch(0.18_0.014_55)]">
                          {order.total.toLocaleString("vi-VN")}
                          <span className="ml-0.5 text-[14px] font-normal text-[oklch(0.52_0.03_58)]">đ</span>
                        </div>
                        <div className="mt-1 flex items-center justify-end gap-1 text-[11px] text-[oklch(0.52_0.03_58)]">
                          <RotateCcw className="size-3" strokeWidth={1.4} />
                          Cọc {order.deposit.toLocaleString("vi-VN")}đ
                        </div>
                      </div>

                      <Link
                        href={`/product/${order.productId}`}
                        className="text-[11px] font-semibold tracking-wider text-[oklch(0.52_0.03_58)] uppercase underline-offset-2 transition-colors hover:text-[oklch(0.6_0.062_60)] hover:underline"
                      >
                        Xem sản phẩm →
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
