"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { parseISO, format } from "date-fns"
import Link from "next/link"
import {
  Building2,
  CalendarRange,
  Check,
  ChevronRight,
  CreditCard,
  Lock,
  MapPin,
  MessageSquare,
  Palette,
  Phone,
  RotateCcw,
  ShieldCheck,
  X,
} from "lucide-react"

import { useOrderStore } from "@/lib/store/order-store"
import { useAuthStore } from "@/lib/store/auth-store"
import { useAddOrder } from "@/lib/queries/orders/useAddOrder"
import { Button } from "@/components/ui/button"

// ─── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_METHODS = [
  {
    id: "bank" as const,
    label: "Chuyển khoản",
    sub: "VCB · MB · TCB · Vietinbank",
    icon: Building2,
    demo: {
      bank: "Vietcombank (VCB)",
      account: "1234 5678 90",
      name: "CONG TY STYLELOOP",
    },
  },
  {
    id: "momo" as const,
    label: "Ví MoMo",
    sub: "Quét mã QR hoặc nhập số điện thoại",
    icon: CreditCard,
    demo: { bank: "MoMo", account: "0901 234 567", name: "StyleLoop" },
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PaymentPage() {
  const router = useRouter()
  const { pending, clear } = useOrderStore()
  const user = useAuthStore((s) => s.user)
  const addOrderMutation = useAddOrder()
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "momo" | null>(
    null
  )
  const [note, setNote] = useState("")
  const [showQR, setShowQR] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Only redirect away if there's no pending order AND we haven't just confirmed.
  // Without the !submitted guard, calling clear() inside handleConfirm would set
  // pending → null and immediately trigger this effect, overriding the intended navigation.
  useEffect(() => {
    if (!pending && !submitted) router.replace("/")
  }, [pending, router, submitted])

  if (submitted) {
    return (
      <div className="flex min-h-[72vh] items-center justify-center bg-[oklch(0.962_0.012_78)]">
        <div className="mx-auto max-w-sm space-y-6 px-6 text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[oklch(0.91_0.022_75)]">
            <Check
              className="size-9 text-[oklch(0.6_0.062_60)]"
              strokeWidth={1.8}
            />
          </div>
          <div className="space-y-2">
            <div className="text-[10px] font-semibold tracking-[0.28em] text-[oklch(0.5_0.032_58)] uppercase">
              ✦ Đặt thuê thành công ✦
            </div>
            <h2 className="font-display text-[32px] font-medium text-[oklch(0.18_0.014_55)]">
              Đơn hàng đã được{" "}
              <div className="text-[oklch(0.6_0.062_60)] italic">xác nhận</div>
            </h2>
          </div>
          <Button
            onClick={() => router.push("/products")}
            className="ribbon-tan flex h-auto w-full items-center justify-center gap-2.5 rounded-full px-8 py-4 text-[12px] font-semibold tracking-[0.22em] uppercase"
          >
            Xem thêm sản phẩm
          </Button>
        </div>
      </div>
    )
  }

  if (!pending) return null

  const fromDate = parseISO(pending.fromDate)
  const toDate = parseISO(pending.toDate)
  const deposit = Math.round(pending.brandPrice * 0.15)
  const grandTotal = pending.total + deposit

  const isComplete =
    address.trim().length > 0 &&
    phone.trim().length > 0 &&
    paymentMethod !== null &&
    note.trim().length > 0

  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === paymentMethod)

  // QR URL — demo placeholder using qrserver.com
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=STYLELOOP-${grandTotal}&color=1a0e05&bgcolor=f5f0e8&margin=12`

  async function handleConfirm() {
    if (!isComplete || !paymentMethod || !selectedMethod || !pending) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await addOrderMutation.mutateAsync({
        productId: pending.productId,
        providerId: pending.providerId,
        productName: pending.productName,
        productSrc: pending.productSrc,
        productType: pending.productType,
        size: pending.size,
        color: pending.color,
        fromDate: pending.fromDate,
        toDate: pending.toDate,
        nights: pending.nights,
        rentalPricePerDay: pending.rentalPricePerDay,
        total: pending.total,
        deposit,
        address,
        phone: phone.trim(),
        paymentMethod,
        paymentMethodLabel: selectedMethod.label,
        note,
        status: "pending",
      })
      clear()
      setShowQR(false)
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err) {
      console.error("addOrder failed:", err)
      setSubmitError((err as Error).message ?? "Đặt đơn thất bại, vui lòng thử lại.")
    } finally {
      setSubmitting(false)
    }
  }

  // ── Main layout ──
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
          <ChevronRight
            className="size-3 text-[oklch(0.78_0.04_70)]"
            strokeWidth={1.4}
          />
          <Link
            href={`/product/${pending.productId}`}
            className="text-[10px] font-semibold tracking-[0.22em] text-[oklch(0.52_0.03_58)] uppercase transition-colors hover:text-[oklch(0.18_0.014_55)]"
          >
            Sản phẩm
          </Link>
          <ChevronRight
            className="size-3 text-[oklch(0.78_0.04_70)]"
            strokeWidth={1.4}
          />
          <span className="text-[10px] font-semibold tracking-[0.22em] text-[oklch(0.18_0.014_55)] uppercase">
            Thanh toán
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-8 py-12 lg:px-12">
        {/* Heading */}
        <div className="mb-10">
          <div className="mb-1 flex items-center gap-3">
            <span className="h-px w-8 bg-[oklch(0.6_0.062_60)]" />
            <span className="text-[10px] font-semibold tracking-[0.32em] text-[oklch(0.5_0.032_58)] uppercase">
              ✦ Xác nhận đơn hàng ✦
            </span>
          </div>
          <h1 className="font-display text-[36px] font-medium tracking-tight text-[oklch(0.18_0.014_55)]">
            Thông tin{" "}
            <span className="text-[oklch(0.6_0.062_60)] italic">đặt thuê</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
          {/* ════ LEFT ════ */}
          <div className="space-y-8">
            {/* Sản phẩm */}
            <section className="space-y-4">
              <SectionLabel>Sản phẩm thuê</SectionLabel>
              <div className="soft-shadow flex gap-5 rounded-md bg-[oklch(0.99_0.008_78)] p-5 ring-1 ring-[oklch(0.88_0.018_70)]">
                <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-sm bg-[oklch(0.94_0.014_75)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pending.productSrc}
                    alt={pending.productName}
                    className="h-full w-full object-cover grayscale-[0.06]"
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="mb-0.5 text-[10px] font-semibold tracking-[0.2em] text-[oklch(0.52_0.03_58)] uppercase">
                      {pending.productType}
                    </div>
                    <h3 className="font-display text-[20px] leading-tight font-medium text-[oklch(0.18_0.014_55)]">
                      {pending.productName}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-sm bg-[oklch(0.91_0.022_75)] px-3 py-1 text-[11px] font-semibold tracking-wider text-[oklch(0.28_0.022_55)] uppercase">
                      Size {pending.size}
                    </span>
                    <span className="flex items-center gap-1.5 text-[12px] text-[oklch(0.38_0.028_58)]">
                      <Palette className="size-3.5" strokeWidth={1.4} />
                      {pending.color}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[12px] text-[oklch(0.38_0.028_58)]">
                      <CalendarRange
                        className="size-3.5 text-[oklch(0.6_0.062_60)]"
                        strokeWidth={1.4}
                      />
                      {format(fromDate, "dd/MM/yyyy")} →{" "}
                      {format(toDate, "dd/MM/yyyy")} ·{" "}
                      <span className="font-semibold text-[oklch(0.28_0.022_55)]">
                        {pending.nights} ngày
                      </span>
                    </div>
                    <div className="text-[13px] text-[oklch(0.38_0.028_58)]">
                      {pending.rentalPricePerDay.toLocaleString("vi-VN")}đ/ngày
                      × {pending.nights} ={" "}
                      <span className="font-semibold text-[oklch(0.18_0.014_55)]">
                        {pending.total.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="editorial-rule h-px" />

            {/* Form */}
            <section className="space-y-6">
              <SectionLabel>Thông tin giao nhận</SectionLabel>

              {/* Địa chỉ */}
              <FormField
                icon={MapPin}
                label="Địa chỉ giao hàng"
                filled={address.trim().length > 0}
              >
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành…"
                  className="w-full rounded-sm bg-[oklch(0.94_0.014_75)] px-4 py-3 text-[14px] font-medium text-[oklch(0.18_0.014_55)] ring-1 ring-[oklch(0.88_0.018_70)] transition-all outline-none placeholder:text-[oklch(0.62_0.03_60)] focus:ring-[oklch(0.6_0.062_60)]"
                />
              </FormField>

              {/* Số điện thoại */}
              <FormField
                icon={Phone}
                label="Số điện thoại nhận hàng"
                filled={phone.trim().length > 0}
              >
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9+\s\-()]/g, "")
                    setPhone(val)
                  }}
                  placeholder="Ví dụ: 0901 234 567"
                  className="w-full rounded-sm bg-[oklch(0.94_0.014_75)] px-4 py-3 text-[14px] font-medium text-[oklch(0.18_0.014_55)] ring-1 ring-[oklch(0.88_0.018_70)] transition-all outline-none placeholder:text-[oklch(0.62_0.03_60)] focus:ring-[oklch(0.6_0.062_60)]"
                />
              </FormField>

              {/* Thanh toán */}
              <FormField
                icon={CreditCard}
                label="Phương thức thanh toán"
                filled={paymentMethod !== null}
              >
                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map(({ id, label, sub, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPaymentMethod(id)}
                      className={`flex items-center gap-3 rounded-sm p-4 text-left ring-1 transition-all duration-200 ${
                        paymentMethod === id
                          ? "bg-[oklch(0.91_0.022_75)] ring-[oklch(0.6_0.062_60)]"
                          : "bg-[oklch(0.99_0.008_78)] ring-[oklch(0.88_0.018_70)] hover:ring-[oklch(0.6_0.062_60)]"
                      }`}
                    >
                      <div
                        className={`flex size-9 shrink-0 items-center justify-center rounded-sm transition-colors ${
                          paymentMethod === id
                            ? "bg-[oklch(0.6_0.062_60)] text-[oklch(0.985_0.008_80)]"
                            : "bg-[oklch(0.91_0.022_75)] text-[oklch(0.48_0.028_58)]"
                        }`}
                      >
                        <Icon className="size-4" strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold text-[oklch(0.18_0.014_55)]">
                          {label}
                        </div>
                        <div className="text-[11px] text-[oklch(0.52_0.03_58)]">
                          {sub}
                        </div>
                      </div>
                      {paymentMethod === id && (
                        <Check
                          className="ml-auto size-4 shrink-0 text-[oklch(0.6_0.062_60)]"
                          strokeWidth={2}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </FormField>

              {/* Ghi chú */}
              <FormField
                icon={MessageSquare}
                label="Ghi chú đơn hàng"
                filled={note.trim().length > 0}
              >
                <textarea
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Thời gian nhận hàng, lưu ý khi giao, yêu cầu đặc biệt…"
                  className="w-full resize-none rounded-sm bg-[oklch(0.94_0.014_75)] px-4 py-3 text-[14px] font-medium text-[oklch(0.18_0.014_55)] ring-1 ring-[oklch(0.88_0.018_70)] transition-all outline-none placeholder:text-[oklch(0.62_0.03_60)] focus:ring-[oklch(0.6_0.062_60)]"
                />
                <p className="text-right text-[10px] text-[oklch(0.62_0.03_60)]">
                  {note.trim().length} ký tự
                </p>
              </FormField>
            </section>
          </div>

          {/* ════ RIGHT — Sticky sidebar ════ */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="soft-shadow overflow-hidden rounded-md bg-[oklch(0.99_0.008_78)] ring-1 ring-[oklch(0.88_0.018_70)]">
              <div className="bg-[oklch(0.18_0.014_55)] px-6 py-4">
                <div className="text-[10px] font-semibold tracking-[0.28em] text-[oklch(0.78_0.04_70)] uppercase">
                  ✦ Tóm tắt đơn hàng
                </div>
              </div>

              <div className="divide-y divide-[oklch(0.88_0.018_70)]">
                {/* Product mini */}
                <div className="flex items-center gap-3 px-5 py-4">
                  <div className="h-14 w-11 shrink-0 overflow-hidden rounded-sm bg-[oklch(0.94_0.014_75)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pending.productSrc}
                      alt={pending.productName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-[oklch(0.18_0.014_55)]">
                      {pending.productName}
                    </p>
                    <p className="text-[11px] text-[oklch(0.52_0.03_58)]">
                      Size {pending.size} · {pending.color}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[oklch(0.52_0.03_58)]">
                      {format(fromDate, "dd/MM")} →{" "}
                      {format(toDate, "dd/MM/yyyy")} ·{" "}
                      <span className="font-semibold text-[oklch(0.28_0.022_55)]">
                        {pending.nights} ngày
                      </span>
                    </p>
                  </div>
                </div>

                {/* Checklist */}
                <div className="space-y-2.5 px-5 py-4">
                  <SidebarRow
                    icon={MapPin}
                    label="Địa chỉ giao"
                    value={address.trim().length > 0 ? address : null}
                    placeholder="Chưa nhập địa chỉ"
                  />
                  <SidebarRow
                    icon={Phone}
                    label="Số điện thoại"
                    value={phone.trim().length > 0 ? phone : null}
                    placeholder="Chưa nhập SĐT"
                  />
                  <SidebarRow
                    icon={CreditCard}
                    label="Thanh toán"
                    value={
                      paymentMethod
                        ? (PAYMENT_METHODS.find((m) => m.id === paymentMethod)
                            ?.label ?? null)
                        : null
                    }
                    placeholder="Chưa chọn"
                  />
                  <SidebarRow
                    icon={MessageSquare}
                    label="Ghi chú"
                    value={
                      note.trim().length > 0
                        ? note.trim().slice(0, 42) +
                          (note.length > 42 ? "…" : "")
                        : null
                    }
                    placeholder="Chưa có ghi chú"
                  />
                </div>

                {/* Pricing */}
                <div className="space-y-3 px-5 py-4">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[oklch(0.52_0.03_58)]">
                      Tiền thuê · {pending.nights} ngày
                    </span>
                    <span className="font-semibold text-[oklch(0.18_0.014_55)]">
                      {pending.total.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="flex items-center gap-1.5 text-[oklch(0.52_0.03_58)]">
                      <RotateCcw className="size-3" strokeWidth={1.4} />
                      Tiền cọc (15%)
                    </span>
                    <span className="font-semibold text-[oklch(0.18_0.014_55)]">
                      {deposit.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-[oklch(0.94_0.014_75)] px-5 py-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] font-semibold tracking-[0.18em] text-[oklch(0.38_0.028_58)] uppercase">
                      Tổng thanh toán
                    </span>
                    <span className="font-display text-[26px] font-semibold text-[oklch(0.18_0.014_55)]">
                      {grandTotal.toLocaleString("vi-VN")}
                      <span className="ml-1 text-[16px] font-normal text-[oklch(0.52_0.03_58)]">
                        đ
                      </span>
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-[oklch(0.58_0.03_58)]">
                    Hoàn cọc sau khi trả đồ đúng hạn
                  </p>
                </div>

                {/* CTA */}
                <div className="space-y-3 px-5 py-5">
                  <Button
                    onClick={() => setShowQR(true)}
                    disabled={!isComplete}
                    className="ribbon-tan flex h-auto w-full items-center justify-center gap-3 rounded-full py-4 text-[12px] font-semibold tracking-[0.22em] uppercase disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span>Xác nhận đặt thuê</span>
                    <span className="flex size-6 items-center justify-center rounded-full bg-white/20">
                      <Check className="size-3.5" strokeWidth={2} />
                    </span>
                  </Button>

                  {!isComplete && (
                    <p className="text-center text-[10px] text-[oklch(0.58_0.03_58)]">
                      Điền đầy đủ{" "}
                      <span className="font-semibold text-[oklch(0.38_0.028_58)]">
                        3 trường bắt buộc
                      </span>{" "}
                      để tiếp tục
                    </p>
                  )}

                  <div className="flex items-center justify-center gap-4 pt-1 text-[10px] text-[oklch(0.58_0.03_58)]">
                    <span className="flex items-center gap-1">
                      <Lock className="size-3" strokeWidth={1.4} /> Thanh toán
                      an toàn
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="size-3" strokeWidth={1.4} /> Bảo
                      hiểm đồ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Link
                href={`/product/${pending.productId}`}
                className="text-[11px] font-semibold tracking-wider text-[oklch(0.52_0.03_58)] uppercase underline-offset-2 transition-colors hover:text-[oklch(0.6_0.062_60)] hover:underline"
              >
                ← Quay lại sản phẩm
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ════ QR Payment Modal ════ */}
      {showQR && selectedMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[oklch(0.18_0.014_55/0.7)] backdrop-blur-sm"
            onClick={() => setShowQR(false)}
          />

          {/* Modal card */}
          <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-md bg-[oklch(0.99_0.008_78)] shadow-[0_32px_80px_-20px_oklch(0.18_0.014_55/0.5)] ring-1 ring-[oklch(0.88_0.018_70)]">
            {/* Header */}
            <div className="flex items-center justify-between bg-[oklch(0.18_0.014_55)] px-6 py-4">
              <div>
                <div className="text-[10px] font-semibold tracking-[0.28em] text-[oklch(0.78_0.04_70)] uppercase">
                  ✦ Quét mã thanh toán
                </div>
                <div className="mt-0.5 font-display text-[18px] font-medium text-[oklch(0.97_0.012_78)]">
                  {selectedMethod.label}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQR(false)}
                className="flex size-8 items-center justify-center rounded-full text-[oklch(0.78_0.04_70)] transition-colors hover:bg-[oklch(1_0_0/0.1)] hover:text-[oklch(0.97_0.012_78)]"
              >
                <X className="size-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {/* QR code */}
              <div className="flex justify-center">
                <div className="rounded-md bg-[oklch(0.94_0.014_75)] p-3 ring-1 ring-[oklch(0.88_0.018_70)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrUrl}
                    alt="QR thanh toán"
                    width={200}
                    height={200}
                    className="block rounded-sm"
                  />
                </div>
              </div>

              {/* Transfer details */}
              <div className="space-y-2 rounded-sm bg-[oklch(0.94_0.014_75)] px-4 py-3 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-[oklch(0.52_0.03_58)]">
                    {selectedMethod.id === "bank" ? "Ngân hàng" : "Nền tảng"}
                  </span>
                  <span className="font-semibold text-[oklch(0.18_0.014_55)]">
                    {selectedMethod.demo.bank}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[oklch(0.52_0.03_58)]">
                    {selectedMethod.id === "bank"
                      ? "Số tài khoản"
                      : "Số điện thoại"}
                  </span>
                  <span className="font-semibold tracking-wider text-[oklch(0.18_0.014_55)]">
                    {selectedMethod.demo.account}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[oklch(0.52_0.03_58)]">Tên</span>
                  <span className="font-semibold text-[oklch(0.18_0.014_55)]">
                    {selectedMethod.demo.name}
                  </span>
                </div>
                <div className="border-t border-[oklch(0.88_0.018_70)] pt-2">
                  <div className="flex justify-between">
                    <span className="text-[oklch(0.52_0.03_58)]">
                      Nội dung CK
                    </span>
                    <span className="font-semibold text-[oklch(0.6_0.062_60)]">
                      STYLELOOP {user?.name?.split(" ").pop() ?? ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div className="flex items-baseline justify-between rounded-sm bg-[oklch(0.18_0.014_55)] px-5 py-4">
                <span className="text-[11px] font-semibold tracking-[0.2em] text-[oklch(0.78_0.04_70)] uppercase">
                  Số tiền
                </span>
                <span className="font-display text-[28px] font-semibold text-[oklch(0.97_0.012_78)]">
                  {grandTotal.toLocaleString("vi-VN")}
                  <span className="ml-1 text-[16px] font-normal text-[oklch(0.78_0.04_70)]">
                    đ
                  </span>
                </span>
              </div>

              {/* Confirm button */}
              <Button
                onClick={handleConfirm}
                className="ribbon-tan flex h-auto w-full items-center justify-center gap-2.5 rounded-full py-4 text-[12px] font-semibold tracking-[0.22em] uppercase"
              >
                <Check className="size-4" strokeWidth={2} />
                <span>Đã thanh toán — Xác nhận đơn</span>
              </Button>

              <p className="text-center text-[10px] text-[oklch(0.58_0.03_58)]">
                Chỉ bấm xác nhận sau khi đã chuyển khoản thành công
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-8 bg-[oklch(0.6_0.062_60)]" />
      <span className="text-[10px] font-semibold tracking-[0.28em] text-[oklch(0.5_0.032_58)] uppercase">
        {children}
      </span>
    </div>
  )
}

function FormField({
  icon: Icon,
  label,
  filled,
  children,
}: {
  icon: React.ElementType
  label: string
  filled: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon
          className="size-3.5 text-[oklch(0.6_0.062_60)]"
          strokeWidth={1.4}
        />
        <span className="text-[11px] font-semibold tracking-[0.22em] text-[oklch(0.28_0.022_55)] uppercase">
          {label}
          <span className="ml-1 text-[oklch(0.6_0.062_60)]">*</span>
        </span>
        {filled && (
          <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-[oklch(0.6_0.062_60)]">
            <Check className="size-3" strokeWidth={2} /> Đã điền
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function SidebarRow({
  icon: Icon,
  label,
  value,
  placeholder,
}: {
  icon: React.ElementType
  label: string
  value: string | null
  placeholder: string
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div
        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full transition-colors ${
          value ? "bg-[oklch(0.6_0.062_60)]" : "bg-[oklch(0.88_0.018_70)]"
        }`}
      >
        {value ? (
          <Check
            className="size-3 text-[oklch(0.985_0.008_80)]"
            strokeWidth={2.5}
          />
        ) : (
          <Icon
            className="size-2.5 text-[oklch(0.52_0.03_58)]"
            strokeWidth={1.5}
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold tracking-[0.16em] text-[oklch(0.52_0.03_58)] uppercase">
          {label}
        </div>
        <div
          className={`mt-0.5 text-[12px] leading-snug ${
            value
              ? "font-medium text-[oklch(0.22_0.02_55)]"
              : "text-[oklch(0.65_0.03_60)] italic"
          }`}
        >
          {value ?? placeholder}
        </div>
      </div>
    </div>
  )
}
