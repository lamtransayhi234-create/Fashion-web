"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Package,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

import { useAuthStore } from "@/lib/store/auth-store"
import { useGetSubmissions } from "@/lib/queries/products/useGetSubmissions"
import { useApproveProduct } from "@/lib/queries/products/useApproveProduct"
import { useRejectProduct } from "@/lib/queries/products/useRejectProduct"
import { AdminSkeleton } from "@/components/skeletons"
import type { SubmittedProduct } from "@/lib/data/products"

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

const BADGE = {
  pending: { bg: "oklch(0.92 0.08 75)", text: "oklch(0.45 0.10 65)" },
  approved: { bg: "oklch(0.90 0.08 145)", text: "oklch(0.32 0.10 145)" },
  rejected: { bg: "oklch(0.92 0.08 25)", text: "oklch(0.45 0.12 25)" },
}

const BADGE_LABEL = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
}

function fmt(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ"
}

// ─── Product card ─────────────────────────────────────────────────────────────

function ProductCard({
  item,
  onApproveClick,
  onRejectClick,
}: {
  item: SubmittedProduct
  onApproveClick?: () => void
  onRejectClick?: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const badge = BADGE[item.uploadStatus]

  return (
    <div
      className="group flex flex-col overflow-hidden rounded-md transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: TK.card,
        border: `1px solid ${TK.border}`,
        boxShadow: "0 4px 20px -8px oklch(0.34 0.03 55 / 0.14)",
      }}
    >
      {/* Ảnh */}
      <div
        className="relative aspect-[3/4] overflow-hidden"
        style={{ background: TK.sand }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.src}
          alt={item.name}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {/* Badge overlay */}
        <div className="absolute top-2 left-2">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.08em] uppercase backdrop-blur-sm"
            style={{ background: badge.bg, color: badge.text }}
          >
            {item.uploadStatus === "pending" && <Clock className="size-2.5" />}
            {item.uploadStatus === "approved" && (
              <CheckCircle2 className="size-2.5" />
            )}
            {item.uploadStatus === "rejected" && (
              <XCircle className="size-2.5" />
            )}
            {BADGE_LABEL[item.uploadStatus]}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between p-3">
        <div className="space-y-1.5">
          <h3
            className="line-clamp-2 font-display text-[13px] leading-snug font-medium"
            style={{ color: TK.ink }}
          >
            {item.name}
          </h3>

          <p className="text-[11px]" style={{ color: TK.sub }}>
            {item.type} · {item.color}
          </p>

          <div className="flex flex-wrap gap-1">
            {item.sizes.slice(0, 4).map((s) => (
              <span
                key={s}
                className="rounded-sm px-1.5 py-0.5 text-[9px] font-semibold"
                style={{ border: `1px solid ${TK.border}`, color: TK.sub }}
              >
                {s}
              </span>
            ))}
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-[13px] font-bold" style={{ color: TK.ink }}>
              {fmt(item.rentalPrice)}
              <span
                className="text-[10px] font-normal"
                style={{ color: TK.sub }}
              >
                /ngày
              </span>
            </span>
            <span
              className="text-[11px] line-through"
              style={{ color: TK.sub }}
            >
              {fmt(item.brandPrice)}
            </span>
          </div>

          {/* Mô tả collapsible */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-[10px] transition-opacity hover:opacity-60"
            style={{ color: TK.label }}
          >
            {expanded ? (
              <ChevronUp className="size-2.5" />
            ) : (
              <ChevronDown className="size-2.5" />
            )}
            {expanded ? "Thu gọn" : "Xem mô tả"}
          </button>
          {expanded && (
            <p
              className="text-[11px] leading-relaxed"
              style={{ color: TK.sub }}
            >
              {item.description}
            </p>
          )}

          {/* Supplier */}
          <div
            className="flex flex-wrap items-center gap-1 text-[10px]"
            style={{ color: TK.sub }}
          >
            <span className="font-semibold" style={{ color: TK.ink }}>
              {item.shopName}
            </span>
            <span>·</span>
            <span>{item.supplierName}</span>
            <span>·</span>
            <span>
              {new Date(item.submittedAt).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
          </div>

          {item.uploadStatus === "rejected" && item.rejectReason && (
            <p
              className="text-[11px] leading-snug"
              style={{ color: BADGE.rejected.text }}
            >
              Lý do: {item.rejectReason}
            </p>
          )}
        </div>

        {/* Action buttons */}
        {item.uploadStatus === "pending" && onApproveClick && onRejectClick && (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={onApproveClick}
              className="ribbon-tan flex-1 rounded-full py-2 text-[11px] font-bold tracking-[0.12em] uppercase"
            >
              <CheckCircle2 className="mr-1 inline size-3" strokeWidth={1.6} />
              Duyệt
            </button>
            <button
              type="button"
              onClick={onRejectClick}
              className="flex-1 rounded-full py-2 text-[11px] font-bold tracking-[0.12em] uppercase transition-colors"
              style={{
                border: `1.5px solid oklch(0.5 0.12 25)`,
                color: "oklch(0.5 0.12 25)",
                background: "transparent",
              }}
            >
              <XCircle className="mr-1 inline size-3" strokeWidth={1.6} />
              Từ chối
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Dialog wrapper ───────────────────────────────────────────────────────────

function Dialog({
  onBackdrop,
  children,
}: {
  onBackdrop: () => void
  children: React.ReactNode
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        background: "oklch(0.18 0.014 55 / 0.55)",
        backdropFilter: "blur(6px)",
      }}
      onClick={onBackdrop}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-md"
        style={{
          background: TK.card,
          border: `1px solid ${TK.border}`,
          boxShadow: "0 32px 80px -20px oklch(0.18 0.014 55 / 0.4)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 w-full" style={{ background: TK.camel }} />
        {children}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const { data: submittedProducts = [], isLoading: subsLoading } = useGetSubmissions()
  const approveProductMutation = useApproveProduct()
  const rejectProductMutation = useRejectProduct()

  const hydrated = useAuthStore((s) => s.hydrated)

  const [tab, setTab] = useState<"pending" | "done">("pending")
  const [toast, setToast] = useState<string | null>(null)

  // Approve dialog
  const [approveDialog, setApproveDialog] = useState<{
    open: boolean
    id: string | null
  }>({ open: false, id: null })

  // Reject dialog
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean
    id: string | null
    reason: string
  }>({
    open: false,
    id: null,
    reason: "",
  })

  if (!hydrated || subsLoading) return <AdminSkeleton />
  if (!user) {
    router.replace("/login")
    return null
  }
  if (user.role !== "admin") {
    router.replace("/")
    return null
  }

  const pending = submittedProducts.filter((p) => p.uploadStatus === "pending")
  const done = submittedProducts.filter((p) => p.uploadStatus !== "pending")

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function confirmApprove() {
    if (!approveDialog.id) return
    const sub = submittedProducts.find((s) => s.id === approveDialog.id)
    if (!sub) return
    try {
      await approveProductMutation.mutateAsync(sub)
      setApproveDialog({ open: false, id: null })
      showToast("Sản phẩm đã được duyệt và xuất hiện trên shop!")
    } catch (err) {
      console.error("approveProduct failed:", err)
      showToast("Duyệt thất bại, vui lòng thử lại.")
    }
  }

  async function confirmReject() {
    if (!rejectDialog.id || !rejectDialog.reason.trim()) return
    try {
      await rejectProductMutation.mutateAsync({
        id: rejectDialog.id,
        reason: rejectDialog.reason.trim(),
      })
      setRejectDialog({ open: false, id: null, reason: "" })
      showToast("Đã từ chối sản phẩm.")
    } catch (err) {
      console.error("rejectProduct failed:", err)
      showToast("Từ chối thất bại, vui lòng thử lại.")
    }
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

      {/* ── Approve dialog ── */}
      {approveDialog.open && (
        <Dialog onBackdrop={() => setApproveDialog({ open: false, id: null })}>
          <div className="px-8 py-8">
            <div
              className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full"
              style={{ background: BADGE.approved.bg }}
            >
              <CheckCircle2
                className="size-7"
                style={{ color: BADGE.approved.text }}
                strokeWidth={1.6}
              />
            </div>
            <h2
              className="text-center font-display text-[22px] font-medium"
              style={{ color: TK.ink }}
            >
              Xác nhận duyệt sản phẩm?
            </h2>
            <p
              className="mt-2 text-center text-[13px]"
              style={{ color: TK.sub }}
            >
              Sản phẩm sẽ xuất hiện ngay trên trang shop sau khi duyệt.
            </p>
            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={confirmApprove}
                className="ribbon-tan flex-1 rounded-full py-3 text-[12px] font-bold tracking-[0.14em] uppercase"
              >
                Xác nhận
              </button>
              <button
                type="button"
                onClick={() => setApproveDialog({ open: false, id: null })}
                className="flex-1 rounded-full py-3 text-[12px] font-semibold transition-opacity hover:opacity-70"
                style={{
                  border: `1px solid ${TK.border}`,
                  color: TK.sub,
                  background: "transparent",
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </Dialog>
      )}

      {/* ── Reject dialog ── */}
      {rejectDialog.open && (
        <Dialog
          onBackdrop={() =>
            setRejectDialog({ open: false, id: null, reason: "" })
          }
        >
          <div className="px-8 py-8">
            <div
              className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full"
              style={{ background: BADGE.rejected.bg }}
            >
              <XCircle
                className="size-7"
                style={{ color: BADGE.rejected.text }}
                strokeWidth={1.6}
              />
            </div>
            <h2
              className="text-center font-display text-[22px] font-medium"
              style={{ color: TK.ink }}
            >
              Từ chối sản phẩm
            </h2>
            <p
              className="mt-2 text-center text-[13px]"
              style={{ color: TK.sub }}
            >
              Nhập lý do để supplier biết cần chỉnh sửa gì.
            </p>
            <textarea
              rows={3}
              autoFocus
              value={rejectDialog.reason}
              onChange={(e) =>
                setRejectDialog((d) => ({ ...d, reason: e.target.value }))
              }
              placeholder="Ví dụ: Ảnh chưa rõ nét, thiếu thông tin size..."
              className="mt-5 w-full resize-none rounded-md px-4 py-3 text-[13px] outline-none"
              style={{
                border: `1px solid ${TK.border}`,
                background: TK.muted,
                color: TK.ink,
              }}
            />
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={confirmReject}
                disabled={!rejectDialog.reason.trim()}
                className="flex-1 rounded-full py-3 text-[12px] font-bold tracking-[0.14em] uppercase transition-all disabled:opacity-40"
                style={{ background: "oklch(0.5 0.12 25)", color: "white" }}
              >
                Xác nhận
              </button>
              <button
                type="button"
                onClick={() =>
                  setRejectDialog({ open: false, id: null, reason: "" })
                }
                className="flex-1 rounded-full py-3 text-[12px] font-semibold transition-opacity hover:opacity-70"
                style={{
                  border: `1px solid ${TK.border}`,
                  color: TK.sub,
                  background: "transparent",
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </Dialog>
      )}

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* Eyebrow */}
        <div className="mb-6 flex items-center gap-3">
          <span className="h-px w-8" style={{ background: TK.camel }} />
          <span
            className="text-[10px] font-semibold tracking-[0.32em] uppercase"
            style={{ color: TK.sub }}
          >
            ✦ Quản trị viên ✦
          </span>
        </div>

        {/* Header */}
        <div className="mb-10 flex items-center gap-4">
          <div
            className="flex size-14 shrink-0 items-center justify-center rounded-full"
            style={{ background: TK.sand }}
          >
            <Shield
              className="size-6"
              style={{ color: TK.camel }}
              strokeWidth={1.4}
            />
          </div>
          <div>
            <h1
              className="font-display text-[32px] leading-tight font-medium tracking-tight"
              style={{ color: TK.ink }}
            >
              Bảng duyệt sản phẩm
            </h1>
            <p className="mt-0.5 text-[13px]" style={{ color: TK.sub }}>
              {user.name} · Quản trị viên
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-3">
          {[
            { label: "Chờ duyệt", value: pending.length, color: BADGE.pending },
            {
              label: "Đã duyệt",
              value: done.filter((p) => p.uploadStatus === "approved").length,
              color: BADGE.approved,
            },
            {
              label: "Từ chối",
              value: done.filter((p) => p.uploadStatus === "rejected").length,
              color: BADGE.rejected,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-md p-4 text-center"
              style={{
                background: s.color.bg,
                border: `1px solid ${TK.border}`,
              }}
            >
              <p
                className="font-display text-[28px] font-bold"
                style={{ color: s.color.text }}
              >
                {s.value}
              </p>
              <p
                className="text-[11px] font-semibold tracking-[0.14em] uppercase"
                style={{ color: s.color.text }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div
          className="mb-8 flex gap-0 rounded-full p-1"
          style={{ background: TK.muted, border: `1px solid ${TK.border}` }}
        >
          {(
            [
              {
                key: "pending",
                label: `Chờ duyệt${pending.length > 0 ? ` (${pending.length})` : ""}`,
              },
              {
                key: "done",
                label: `Đã xử lý${done.length > 0 ? ` (${done.length})` : ""}`,
              },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className="flex-1 rounded-full py-2.5 text-[12px] font-semibold tracking-[0.12em] uppercase transition-all duration-200"
              style={{
                background: tab === t.key ? TK.ink : "transparent",
                color: tab === t.key ? "oklch(0.97 0.012 78)" : TK.sub,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Chờ duyệt ── */}
        {tab === "pending" && (
          <div>
            {pending.length === 0 ? (
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
                  Không có sản phẩm nào đang chờ duyệt
                </h2>
                <p className="text-[14px]" style={{ color: TK.sub }}>
                  ✦ Tất cả sản phẩm đã được xử lý
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {pending.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    onApproveClick={() =>
                      setApproveDialog({ open: true, id: item.id })
                    }
                    onRejectClick={() =>
                      setRejectDialog({ open: true, id: item.id, reason: "" })
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Đã xử lý ── */}
        {tab === "done" && (
          <div>
            {done.length === 0 ? (
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
                  Chưa có sản phẩm nào được xử lý
                </h2>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {[...done].reverse().map((item) => (
                  <ProductCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
