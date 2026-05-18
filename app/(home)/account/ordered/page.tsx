"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { parseISO, isAfter, isBefore, format } from "date-fns"
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  MapPin,
  Phone,
  CalendarRange,
  CreditCard,
} from "lucide-react"

import {
  useAuthStore,
  type Order,
  type OrderStatus,
} from "@/lib/store/auth-store"
import { useGetOrders } from "@/lib/queries/orders/useGetOrders"
import { useUpdateOrderStatus } from "@/lib/queries/orders/useUpdateOrderStatus"
import { AccountOrderedSkeleton } from "@/components/skeletons"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
}

// ─── Status logic ─────────────────────────────────────────────────────────────

type DisplayStatus =
  | "pending"
  | "upcoming"
  | "active"
  | "overdue"
  | "completed"
  | "cancelled"

function getDisplayStatus(order: Order): DisplayStatus {
  if (order.status === "cancelled") return "cancelled"
  if (order.status === "completed") return "completed"
  if (order.status === "pending") return "pending"

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const from = parseISO(order.fromDate)
  const to = parseISO(order.toDate)

  if (isBefore(today, from)) return "upcoming"
  if (isAfter(today, to)) return "overdue"
  return "active"
}

const STATUS_CONFIG: Record<
  DisplayStatus,
  { label: string; bg: string; text: string; icon: React.ElementType }
> = {
  pending: {
    label: "Chờ xác nhận",
    bg: "oklch(0.95 0.06 80)",
    text: "oklch(0.38 0.10 70)",
    icon: Clock,
  },
  upcoming: {
    label: "Chờ nhận đồ",
    bg: "oklch(0.94 0.04 230)",
    text: "oklch(0.38 0.10 230)",
    icon: CalendarRange,
  },
  active: {
    label: "Đang thuê",
    bg: "oklch(0.92 0.06 145)",
    text: "oklch(0.32 0.12 145)",
    icon: CheckCircle2,
  },
  overdue: {
    label: "Quá hạn",
    bg: "oklch(0.94 0.06 25)",
    text: "oklch(0.42 0.14 25)",
    icon: Clock,
  },
  completed: {
    label: "Hoàn thành",
    bg: "oklch(0.92 0.04 145)",
    text: "oklch(0.35 0.08 145)",
    icon: CheckCircle2,
  },
  cancelled: { label: "Đã hủy", bg: TK.muted, text: TK.sub, icon: XCircle },
}

const FILTER_TABS: { key: DisplayStatus | "all"; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "active", label: "Đang thuê" },
  { key: "upcoming", label: "Chờ nhận đồ" },
  { key: "completed", label: "Hoàn thành" },
  { key: "cancelled", label: "Đã hủy" },
]

function fmt(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ"
}

// ─── Order card ───────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
]

function OrderCard({
  order,
  customerName,
  onStatusChange,
}: {
  order: Order
  customerName: string
  onStatusChange: (status: OrderStatus) => void
}) {
  const ds = getDisplayStatus(order)
  const cfg = STATUS_CONFIG[ds]
  const Icon = cfg.icon

  return (
    <div
      className="group flex flex-col overflow-hidden rounded-md transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: TK.card,
        border: `1px solid ${TK.border}`,
        boxShadow: "0 4px 16px -8px oklch(0.34 0.03 55 / 0.12)",
      }}
    >
      {/* Ảnh */}
      <div className="relative aspect-[3/4] overflow-hidden" style={{ background: TK.sand }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={order.productSrc}
          alt={order.productName}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {/* Badge */}
        <div className="absolute top-2 left-2">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.08em] uppercase backdrop-blur-sm"
            style={{ background: cfg.bg, color: cfg.text }}
          >
            <Icon className="size-2.5" />
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between p-3">
        <div className="space-y-1.5">
          {/* Tên */}
          <h3 className="line-clamp-2 font-display text-[13px] font-medium leading-snug" style={{ color: TK.ink }}>
            {order.productName}
          </h3>
          <p className="text-[11px]" style={{ color: TK.sub }}>
            {order.productType} · {order.size} · {order.color}
          </p>

          {/* Khách thuê */}
          <div className="flex items-center gap-1">
            <ShoppingBag className="size-3 shrink-0" style={{ color: TK.sub }} strokeWidth={1.4} />
            <span className="text-[12px] font-medium" style={{ color: TK.ink }}>{customerName}</span>
          </div>

          {/* Địa chỉ */}
          <div className="flex items-start gap-1">
            <MapPin className="mt-0.5 size-3 shrink-0" style={{ color: TK.sub }} strokeWidth={1.4} />
            <span className="line-clamp-1 text-[11px]" style={{ color: TK.sub }}>{order.address}</span>
          </div>
          {order.phone && (
            <div className="flex items-center gap-1">
              <Phone className="size-3 shrink-0" style={{ color: TK.sub }} strokeWidth={1.4} />
              <span className="text-[11px]" style={{ color: TK.sub }}>{order.phone}</span>
            </div>
          )}

          {/* Ngày thuê */}
          <div className="flex items-center gap-1">
            <CalendarRange className="size-3 shrink-0" style={{ color: TK.sub }} strokeWidth={1.4} />
            <span className="text-[11px]" style={{ color: TK.sub }}>
              {format(parseISO(order.fromDate), "dd/MM")} → {format(parseISO(order.toDate), "dd/MM")}
              <span className="ml-1 font-semibold" style={{ color: TK.ink }}>({order.nights} đêm)</span>
            </span>
          </div>

          {/* Giá */}
          <div className="flex items-baseline gap-1">
            <span className="font-display text-[13px] font-bold" style={{ color: TK.ink }}>
              {fmt(order.total)}
            </span>
            <span className="text-[10px]" style={{ color: TK.sub }}>
              ({fmt(order.rentalPricePerDay)}/ngày × {order.nights})
            </span>
          </div>
        </div>

        {/* Status selector */}
        <div className="mt-3">
          <p className="mb-1 text-[10px] font-semibold tracking-[0.14em] uppercase" style={{ color: TK.label }}>
            Trạng thái
          </p>
          <Select value={order.status} onValueChange={(v) => onStatusChange(v as OrderStatus)}>
            <SelectTrigger
              className="h-auto w-full rounded-full px-3 py-2 text-[11px] font-semibold"
              style={{ border: `1.5px solid ${TK.border}`, background: TK.card, color: TK.ink, boxShadow: "none" }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-md"
              style={{ background: TK.card, border: `1px solid ${TK.border}`, boxShadow: "0 16px 40px -12px oklch(0.34 0.03 55 / 0.25)" }}>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}
                  className="cursor-pointer text-[12px] font-medium" style={{ color: TK.ink }}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SupplierOrdersPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const { data: orders = [], isLoading: ordersLoading } = useGetOrders("shop")
  const updateOrderStatusMutation = useUpdateOrderStatus()
  const updateOrderStatus = (id: string, status: OrderStatus) =>
    updateOrderStatusMutation.mutate({ id, status })
  const [filter, setFilter] = useState<DisplayStatus | "all">("all")
  const [toast, setToast] = useState<string | null>(null)

  const hydrated = useAuthStore((s) => s.hydrated)

  useEffect(() => {
    if (!hydrated) return
    if (!user) router.replace("/login")
    else if (user.role !== "supplier") router.replace("/")
  }, [hydrated, user, router])

  if (!hydrated || ordersLoading) return <AccountOrderedSkeleton />
  if (!user || user.role !== "supplier") return <AccountOrderedSkeleton />

  const safeUser = user

  // Gom tất cả đơn của shop (orders đã được RLS filter cho provider)
  // Customer name/email sẽ được populate bằng join ở Phase 6 (Task 17)
  const allOrders = orders
    .filter((order) => order.providerId === safeUser.id)
    .map((order) => ({ order, customer: { id: order.userId, name: "Khách hàng", email: "" } }))
    .sort(
      (a, b) =>
        new Date(b.order.createdAt).getTime() -
        new Date(a.order.createdAt).getTime()
    )

  const filtered =
    filter === "all"
      ? allOrders
      : allOrders.filter(({ order }) => getDisplayStatus(order) === filter)

  const pendingCount = allOrders.filter(
    ({ order }) => order.status === "pending"
  ).length
  const activeCount = allOrders.filter(
    ({ order }) => getDisplayStatus(order) === "active"
  ).length
  const completedCount = allOrders.filter(
    ({ order }) => order.status === "completed"
  ).length

  function handleStatusChange(orderId: string, status: OrderStatus) {
    updateOrderStatus(orderId, status)
    const labels: Record<string, string> = {
      confirmed: "Đã xác nhận đơn thuê!",
      completed: "Đã đánh dấu hoàn thành!",
      cancelled: "Đã hủy đơn.",
      pending: "Đã chuyển về chờ xác nhận.",
    }
    setToast(labels[status] ?? "Đã cập nhật trạng thái!")
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <main style={{ background: TK.bg, minHeight: "calc(100vh - 3.6rem)" }}>
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-full px-6 py-3 text-[13px] font-semibold shadow-lg"
          style={{ background: TK.ink, color: "oklch(0.97 0.012 78)" }}
        >
          {toast}
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* Eyebrow */}
        <div className="mb-6 flex items-center gap-3">
          <span className="h-px w-8" style={{ background: TK.camel }} />
          <span
            className="text-[10px] font-semibold tracking-[0.32em] uppercase"
            style={{ color: TK.sub }}
          >
            ✦ Quản lý đơn thuê ✦
          </span>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div
            className="flex size-14 shrink-0 items-center justify-center rounded-full"
            style={{ background: TK.sand }}
          >
            <ShoppingBag
              className="size-6"
              style={{ color: TK.camel }}
              strokeWidth={1.4}
            />
          </div>
          <div>
            <h1
              className="font-display text-[30px] leading-tight font-medium"
              style={{ color: TK.ink }}
            >
              Đơn thuê của shop
            </h1>
            <p className="mt-0.5 text-[13px]" style={{ color: TK.sub }}>
              {(safeUser as { shopName?: string }).shopName ?? safeUser.name}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-3">
          {[
            {
              label: "Chờ xác nhận",
              value: pendingCount,
              bg: STATUS_CONFIG.pending.bg,
              text: STATUS_CONFIG.pending.text,
            },
            {
              label: "Đang thuê",
              value: activeCount,
              bg: STATUS_CONFIG.active.bg,
              text: STATUS_CONFIG.active.text,
            },
            {
              label: "Hoàn thành",
              value: completedCount,
              bg: STATUS_CONFIG.completed.bg,
              text: STATUS_CONFIG.completed.text,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-md p-4 text-center"
              style={{ background: s.bg, border: `1px solid ${TK.border}` }}
            >
              <p
                className="font-display text-[26px] font-bold"
                style={{ color: s.text }}
              >
                {s.value}
              </p>
              <p
                className="text-[11px] font-semibold tracking-[0.12em] uppercase"
                style={{ color: s.text }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        {allOrders.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {FILTER_TABS.filter((t) => {
              if (t.key === "all") return true
              return allOrders.some(
                ({ order }) => getDisplayStatus(order) === t.key
              )
            }).map((t) => {
              const active = filter === t.key
              const cfg = t.key !== "all" ? STATUS_CONFIG[t.key] : null
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setFilter(t.key)}
                  className="rounded-full px-4 py-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase transition-all"
                  style={{
                    background: active ? (cfg ? cfg.bg : TK.ink) : TK.muted,
                    color: active
                      ? cfg
                        ? cfg.text
                        : "oklch(0.97 0.012 78)"
                      : TK.sub,
                    border: `1px solid ${active ? "transparent" : TK.border}`,
                  }}
                >
                  {t.label}
                </button>
              )
            })}
          </div>
        )}

        {/* List */}
        {allOrders.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <div
              className="flex size-20 items-center justify-center rounded-full"
              style={{ background: TK.sand }}
            >
              <Package
                className="size-8"
                style={{ color: TK.sub }}
                strokeWidth={1.2}
              />
            </div>
            <h2
              className="font-display text-[22px] font-medium"
              style={{ color: TK.ink }}
            >
              Chưa có đơn thuê nào
            </h2>
            <p className="text-[14px]" style={{ color: TK.sub }}>
              Đơn thuê sản phẩm của shop bạn sẽ xuất hiện ở đây
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p
              className="font-display text-[18px] font-medium"
              style={{ color: TK.ink }}
            >
              Không có đơn nào
            </p>
            <p className="text-[13px]" style={{ color: TK.sub }}>
              Không có đơn nào trong trạng thái này
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map(({ order, customer }) => (
              <OrderCard
                key={order.id}
                order={order}
                customerName={customer.name}
                onStatusChange={(status) =>
                  handleStatusChange(order.id, status)
                }
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
