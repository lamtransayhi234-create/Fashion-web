"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Package,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  ImageIcon,
  Plus,
  Loader2,
  Store,
} from "lucide-react"

import { useAuthStore } from "@/lib/store/auth-store"
import { useGetSubmissions } from "@/lib/queries/products/useGetSubmissions"
import { useSubmitProduct } from "@/lib/queries/products/useSubmitProduct"
import { SupplierSkeleton } from "@/components/skeletons"
import { ImageUploader } from "@/components/image-uploader"
import type {
  ProductCategory,
  ProductType,
  ProductSize,
} from "@/lib/data/products"
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

// ─── Category → Types mapping ─────────────────────────────────────────────────

const TYPE_BY_CATEGORY: Record<ProductCategory, ProductType[]> = {
  "Trang phục": [
    "Váy & Đầm",
    "Áo kiểu",
    "Áo khoác",
    "Chân váy",
    "Quần",
    "Jumpsuit",
    "Áo dài",
    "Set",
  ],
  "Giày Dép": ["Cao gót", "Boots", "Sandal", "Sneakers", "Giày bệt", "Giày Dép"],
  "Phụ Kiện": [
    "Túi xách",
    "Mũ & Nón",
    "Trang sức",
    "Thắt lưng",
    "Khăn choàng",
    "Kính mát",
  ],
}

const SIZES_BY_TYPE: Record<string, ProductSize[]> = {
  clothing: ["XS", "S", "M", "L", "XL"],
  shoes: ["35", "36", "37", "38", "39"],
  acc: ["Free Size"],
}

function getSizeGroup(
  category: ProductCategory,
  type: ProductType
): ProductSize[] {
  if (category === "Giày Dép") return SIZES_BY_TYPE.shoes
  if (category === "Phụ Kiện") return SIZES_BY_TYPE.acc
  return SIZES_BY_TYPE.clothing
}

const TAG_SUGGESTIONS = [
  "Vintage",
  "Y2K",
  "Sang chảnh",
  "Dạo phố",
  "Dự tiệc",
  "Casual",
  "Chụp ảnh",
  "Date night",
  "Đi biển",
  "Cottagecore",
  "Boho",
  "Cưới hỏi",
]

function fmt(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ"
}

// ─── Form state ───────────────────────────────────────────────────────────────

type FormState = {
  imgUrl: string
  name: string
  category: ProductCategory | ""
  type: ProductType | ""
  brandPrice: string
  rentalPrice: string
  description: string
  sizes: ProductSize[]
  color: string
  tags: string[]
}

const EMPTY_FORM: FormState = {
  imgUrl: "",
  name: "",
  category: "",
  type: "",
  brandPrice: "",
  rentalPrice: "",
  description: "",
  sizes: [],
  color: "",
  tags: [],
}

// ─── Field label ──────────────────────────────────────────────────────────────

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <label
      className="mb-1.5 block text-[11px] font-semibold tracking-[0.18em] uppercase"
      style={{ color: TK.label }}
    >
      {children}
      {required && <span style={{ color: "oklch(0.5 0.12 25)" }}> *</span>}
    </label>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SupplierPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const { data: submittedProducts = [], isLoading: subsLoading } = useGetSubmissions()
  const submitProductMutation = useSubmitProduct()

  const hydrated = useAuthStore((s) => s.hydrated)

  const [tab, setTab] = useState<"list" | "form">("list")
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all")
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [tagInput, setTagInput] = useState("")
  const [toast, setToast] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [successDialog, setSuccessDialog] = useState(false)

  if (!hydrated || subsLoading) return <SupplierSkeleton />
  if (!user) {
    router.replace("/login")
    return null
  }
  if (user.role !== "supplier") {
    router.replace("/")
    return null
  }

  const safeUser = user
  const myProducts = submittedProducts.filter(
    (p) => p.supplierId === safeUser.id
  )

  // ── Category / type change ────────────────────────────────────────────────

  function setCategory(cat: ProductCategory | "") {
    setForm((f) => ({ ...f, category: cat, type: "", sizes: [] }))
  }

  function setType(type: ProductType | "") {
    setForm((f) => {
      const sizes: ProductSize[] =
        f.category && type
          ? f.category === "Phụ Kiện"
            ? ["Free Size"]
            : []
          : []
      return { ...f, type, sizes }
    })
  }

  // ── Sizes toggle ──────────────────────────────────────────────────────────

  function toggleSize(s: ProductSize) {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(s)
        ? f.sizes.filter((x) => x !== s)
        : [...f.sizes, s],
    }))
  }

  // ── Tags ──────────────────────────────────────────────────────────────────

  function addTag(tag: string) {
    const t = tag.trim()
    if (!t || form.tags.includes(t)) return
    setForm((f) => ({ ...f, tags: [...f.tags, t] }))
    setTagInput("")
  }

  function removeTag(tag: string) {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  const canSubmit =
    form.imgUrl &&
    form.name.trim() &&
    form.category &&
    form.type &&
    Number(form.brandPrice) > 0 &&
    Number(form.rentalPrice) > 0 &&
    form.description.trim() &&
    form.sizes.length > 0 &&
    form.color.trim()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || !form.category || !form.type) return
    setSubmitting(true)
    try {
      await submitProductMutation.mutateAsync({
        data: {
          src: form.imgUrl,
          name: form.name.trim(),
          brandPrice: Number(form.brandPrice.replace(/\D/g, "")),
          rentalPrice: Number(form.rentalPrice.replace(/\D/g, "")),
          description: form.description.trim(),
          category: form.category as ProductCategory,
          type: form.type as ProductType,
          sizes: form.sizes,
          color: form.color.trim(),
          tags: form.tags,
        },
        supplier: {
          id: safeUser.id,
          name: safeUser.name,
          shopName: (safeUser as { shopName?: string }).shopName,
        },
      })
      setForm(EMPTY_FORM)
      setTagInput("")
      setSuccessDialog(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err) {
      console.error("submitProduct failed:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const availableSizes: ProductSize[] =
    form.category && form.type
      ? getSizeGroup(form.category as ProductCategory, form.type as ProductType)
      : []

  const availableTypes: ProductType[] = form.category
    ? TYPE_BY_CATEGORY[form.category as ProductCategory]
    : []

  return (
    <main style={{ background: TK.bg, minHeight: "calc(100vh - 3.6rem)" }}>
      {/* Success dialog */}
      {successDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{
            background: "oklch(0.18 0.014 55 / 0.55)",
            backdropFilter: "blur(6px)",
          }}
          onClick={() => setSuccessDialog(false)}
        >
          <div
            className="relative w-full max-w-sm overflow-hidden rounded-md text-center"
            style={{
              background: TK.card,
              border: `1px solid ${TK.border}`,
              boxShadow: "0 32px 80px -20px oklch(0.18 0.014 55 / 0.4)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent */}
            <div className="h-1 w-full" style={{ background: TK.camel }} />

            <div className="px-8 py-10">
              {/* Icon */}
              <div
                className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full"
                style={{ background: "oklch(0.90 0.08 145)" }}
              >
                <CheckCircle2
                  className="size-8"
                  style={{ color: "oklch(0.32 0.10 145)" }}
                  strokeWidth={1.6}
                />
              </div>

              <h2
                className="font-display text-[24px] font-medium"
                style={{ color: TK.ink }}
              >
                Đăng sản phẩm thành công!
              </h2>
              <p
                className="mt-2 text-[14px] leading-relaxed"
                style={{ color: TK.sub }}
              >
                Sản phẩm của bạn đã được gửi và đang chờ admin duyệt. Bạn có thể
                theo dõi trạng thái trong tab{" "}
                <span className="font-semibold" style={{ color: TK.ink }}>
                  "Sản phẩm của tôi"
                </span>
                .
              </p>

              <button
                type="button"
                onClick={() => setSuccessDialog(false)}
                className="ribbon-tan mt-7 w-full rounded-full py-3.5 text-[12px] font-bold tracking-[0.18em] uppercase"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast (giữ cho các thông báo khác nếu cần) */}
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
            ✦ Cửa hàng của tôi ✦
          </span>
        </div>

        {/* Header */}
        <div className="mb-10 flex items-center gap-4">
          <div
            className="flex size-14 shrink-0 items-center justify-center rounded-full"
            style={{ background: TK.sand }}
          >
            <Store
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
              {(safeUser as { shopName?: string }).shopName ?? safeUser.name}
            </h1>
            <p className="mt-0.5 text-[13px]" style={{ color: TK.sub }}>
              {safeUser.name} · Nhà cung cấp
            </p>
          </div>
        </div>

        {/* Tab bar */}
        <div
          className="mb-8 flex gap-0 rounded-full p-1"
          style={{ background: TK.muted, border: `1px solid ${TK.border}` }}
        >
          {(["list", "form"] as const).map((t) => {
            const label =
              t === "list"
                ? `Sản phẩm của tôi${myProducts.length > 0 ? ` (${myProducts.length})` : ""}`
                : "Đăng sản phẩm mới"
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className="flex-1 rounded-full py-2.5 text-[12px] font-semibold tracking-[0.12em] uppercase transition-all duration-200"
                style={{
                  background: tab === t ? TK.ink : "transparent",
                  color: tab === t ? "oklch(0.97 0.012 78)" : TK.sub,
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* ── Tab 1: Danh sách ── */}
        {tab === "list" && (
          <div>
            {/* Sub-tabs filter */}
            {myProducts.length > 0 && (
              <div className="mb-5 flex gap-2">
                {(
                  [
                    { key: "all", label: "Tất cả", count: myProducts.length },
                    {
                      key: "pending",
                      label: "Chờ duyệt",
                      count: myProducts.filter(
                        (p) => p.uploadStatus === "pending"
                      ).length,
                    },
                    {
                      key: "approved",
                      label: "Đã duyệt",
                      count: myProducts.filter(
                        (p) => p.uploadStatus === "approved"
                      ).length,
                    },
                    {
                      key: "rejected",
                      label: "Từ chối",
                      count: myProducts.filter(
                        (p) => p.uploadStatus === "rejected"
                      ).length,
                    },
                  ] as const
                ).map((s) => {
                  const active = statusFilter === s.key
                  const colors =
                    s.key === "all" ? null : BADGE[s.key as keyof typeof BADGE]
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setStatusFilter(s.key)}
                      className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase transition-all"
                      style={{
                        background: active
                          ? colors
                            ? colors.bg
                            : TK.ink
                          : TK.muted,
                        color: active
                          ? colors
                            ? colors.text
                            : "oklch(0.97 0.012 78)"
                          : TK.sub,
                        border: `1px solid ${active ? "transparent" : TK.border}`,
                      }}
                    >
                      {s.label}
                      {s.count > 0 && (
                        <span
                          className="flex size-4 items-center justify-center rounded-full text-[9px] font-bold"
                          style={{
                            background: active
                              ? "oklch(0 0 0 / 0.15)"
                              : TK.border,
                            color: active
                              ? colors
                                ? colors.text
                                : "oklch(0.97 0.012 78)"
                              : TK.sub,
                          }}
                        >
                          {s.count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {myProducts.length === 0 ? (
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
                  Bạn chưa đăng sản phẩm nào
                </h2>
                <p className="text-[14px]" style={{ color: TK.sub }}>
                  Chuyển sang tab "Đăng sản phẩm mới" để bắt đầu
                </p>
                <button
                  type="button"
                  onClick={() => setTab("form")}
                  className="ribbon-tan mt-2 rounded-full px-8 py-3 text-[12px] font-semibold tracking-[0.18em] uppercase"
                >
                  Đăng sản phẩm đầu tiên
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {myProducts
                  .filter(
                    (p) =>
                      statusFilter === "all" || p.uploadStatus === statusFilter
                  )
                  .map((p) => {
                    const badge = BADGE[p.uploadStatus]
                    return (
                      <div
                        key={p.id}
                        className="group overflow-hidden rounded-md transition-all duration-300 hover:-translate-y-0.5"
                        style={{
                          background: TK.card,
                          border: `1px solid ${TK.border}`,
                          boxShadow:
                            "0 4px 16px -8px oklch(0.34 0.03 55 / 0.12)",
                        }}
                      >
                        {/* Ảnh */}
                        <div
                          className="relative aspect-[3/4] overflow-hidden"
                          style={{ background: TK.sand }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.src}
                            alt={p.name}
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          />
                          {/* Badge overlay */}
                          <div className="absolute top-2 left-2">
                            <span
                              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.08em] uppercase backdrop-blur-sm"
                              style={{
                                background: badge.bg,
                                color: badge.text,
                              }}
                            >
                              {p.uploadStatus === "pending" && (
                                <Clock className="size-2.5" />
                              )}
                              {p.uploadStatus === "approved" && (
                                <CheckCircle2 className="size-2.5" />
                              )}
                              {p.uploadStatus === "rejected" && (
                                <XCircle className="size-2.5" />
                              )}
                              {BADGE_LABEL[p.uploadStatus]}
                            </span>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="space-y-1.5 p-3">
                          <h3
                            className="line-clamp-2 font-display text-[13px] leading-snug font-medium"
                            style={{ color: TK.ink }}
                          >
                            {p.name}
                          </h3>

                          <p className="text-[11px]" style={{ color: TK.sub }}>
                            {p.type} · {p.color}
                          </p>

                          <div className="flex items-baseline gap-1.5">
                            <span
                              className="text-[13px] font-bold"
                              style={{ color: TK.ink }}
                            >
                              {fmt(p.rentalPrice)}
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
                              {fmt(p.brandPrice)}
                            </span>
                          </div>

                          {p.uploadStatus === "rejected" && p.rejectReason && (
                            <p
                              className="text-[11px] leading-snug"
                              style={{ color: BADGE.rejected.text }}
                            >
                              Lý do: {p.rejectReason}
                            </p>
                          )}

                          <p className="text-[10px]" style={{ color: TK.sub }}>
                            {new Date(p.submittedAt).toLocaleDateString(
                              "vi-VN",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    )
                  })}

                {/* Empty state khi filter không có kết quả */}
                {myProducts.filter(
                  (p) =>
                    statusFilter === "all" || p.uploadStatus === statusFilter
                ).length === 0 && (
                  <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <p
                      className="font-display text-[18px] font-medium"
                      style={{ color: TK.ink }}
                    >
                      Không có sản phẩm nào
                    </p>
                    <p className="text-[13px]" style={{ color: TK.sub }}>
                      Chưa có sản phẩm nào trong trạng thái này
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Tab 2: Form đăng sản phẩm ── */}
        {tab === "form" && (
          <form onSubmit={handleSubmit}>
            <div className="flex items-start gap-8">
              {/* ── CỘT TRÁI: Image upload ── */}
              <div className="sticky top-24 w-72 shrink-0">
                {/* Supabase Storage uploader */}
                <ImageUploader
                  value={form.imgUrl}
                  onChange={(url) => setForm((f) => ({ ...f, imgUrl: url }))}
                  aspect="3 / 4"
                />

                {/* Progress indicator */}
                <div className="mt-5 space-y-2">
                  {[
                    { label: "Ảnh", done: !!form.imgUrl },
                    {
                      label: "Thông tin",
                      done: !!(form.name && form.category && form.type),
                    },
                    {
                      label: "Giá",
                      done: !!(
                        Number(form.brandPrice) > 0 &&
                        Number(form.rentalPrice) > 0
                      ),
                    },
                    {
                      label: "Mô tả & Size",
                      done: !!(form.description && form.sizes.length > 0),
                    },
                  ].map((step) => (
                    <div key={step.label} className="flex items-center gap-2">
                      <div
                        className="flex size-5 shrink-0 items-center justify-center rounded-full transition-all"
                        style={{
                          background: step.done ? TK.camel : TK.muted,
                          border: `1.5px solid ${step.done ? TK.camel : TK.border}`,
                        }}
                      >
                        {step.done && (
                          <svg
                            viewBox="0 0 10 10"
                            className="size-2.5"
                            fill="none"
                          >
                            <path
                              d="M1.5 5L4 7.5L8.5 2.5"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: step.done ? TK.ink : TK.sub }}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── CỘT PHẢI: Form fields ── */}
              <div className="min-w-0 flex-1 space-y-5">
                {/* Tên sản phẩm */}
                <div>
                  <FieldLabel required>Tên sản phẩm</FieldLabel>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Ví dụ: Đầm lụa hai dây champagne"
                    className="w-full rounded-full px-4 py-2.5 text-[14px] transition-all outline-none"
                    style={{
                      border: `1px solid ${TK.border}`,
                      background: TK.card,
                      color: TK.ink,
                    }}
                  />
                </div>

                {/* Danh mục + Loại */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel required>Danh mục</FieldLabel>
                    <Select
                      value={form.category}
                      onValueChange={(v) => setCategory(v as ProductCategory)}
                    >
                      <SelectTrigger
                        className="h-auto w-full rounded-full px-4 py-2.5 text-[14px]"
                        style={{
                          border: `1px solid ${TK.border}`,
                          background: TK.card,
                          color: form.category ? TK.ink : TK.sub,
                          boxShadow: "none",
                        }}
                      >
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent
                        className="rounded-md"
                        style={{
                          background: TK.card,
                          border: `1px solid ${TK.border}`,
                          boxShadow: "0 16px 40px -12px oklch(0.34 0.03 55 / 0.2)",
                        }}
                      >
                        {(["Trang phục", "Giày Dép", "Phụ Kiện"] as ProductCategory[]).map((cat) => (
                          <SelectItem key={cat} value={cat} className="cursor-pointer text-[13px]" style={{ color: TK.ink }}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <FieldLabel required>Loại</FieldLabel>
                    <Select
                      value={form.type}
                      onValueChange={(v) => setType(v as ProductType)}
                      disabled={!form.category}
                    >
                      <SelectTrigger
                        className="h-auto w-full rounded-full px-4 py-2.5 text-[14px] disabled:opacity-40"
                        style={{
                          border: `1px solid ${TK.border}`,
                          background: TK.card,
                          color: form.type ? TK.ink : TK.sub,
                          boxShadow: "none",
                        }}
                      >
                        <SelectValue placeholder="Chọn loại" />
                      </SelectTrigger>
                      <SelectContent
                        className="rounded-md"
                        style={{
                          background: TK.card,
                          border: `1px solid ${TK.border}`,
                          boxShadow: "0 16px 40px -12px oklch(0.34 0.03 55 / 0.2)",
                        }}
                      >
                        {availableTypes.map((t) => (
                          <SelectItem key={t} value={t} className="cursor-pointer text-[13px]" style={{ color: TK.ink }}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Giá */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel required>Giá gốc</FieldLabel>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={form.brandPrice}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "")
                          setForm((f) => ({ ...f, brandPrice: val }))
                        }}
                        placeholder="1000000"
                        className="w-full rounded-full px-4 py-2.5 pr-8 text-[14px] outline-none"
                        style={{
                          border: `1px solid ${TK.border}`,
                          background: TK.card,
                          color: TK.ink,
                        }}
                      />
                      <span
                        className="absolute top-1/2 right-4 -translate-y-1/2 text-[12px]"
                        style={{ color: TK.sub }}
                      >
                        đ
                      </span>
                    </div>
                  </div>
                  <div>
                    <FieldLabel required>Giá thuê / ngày</FieldLabel>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={form.rentalPrice}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "")
                          setForm((f) => ({ ...f, rentalPrice: val }))
                        }}
                        placeholder="80000"
                        className="w-full rounded-full px-4 py-2.5 pr-16 text-[14px] outline-none"
                        style={{
                          border: `1px solid ${TK.border}`,
                          background: TK.card,
                          color: TK.ink,
                        }}
                      />
                      <span
                        className="absolute top-1/2 right-4 -translate-y-1/2 text-[11px]"
                        style={{ color: TK.sub }}
                      >
                        đ/ngày
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mô tả */}
                <div>
                  <FieldLabel required>Mô tả</FieldLabel>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    placeholder="Mô tả ngắn về sản phẩm: chất liệu, dáng, phù hợp dịp nào..."
                    className="w-full resize-none rounded-md px-4 py-3 text-[14px] outline-none"
                    style={{
                      border: `1px solid ${TK.border}`,
                      background: TK.card,
                      color: TK.ink,
                    }}
                  />
                </div>

                {/* Sizes */}
                <div>
                  <FieldLabel required>Size</FieldLabel>
                  {!form.category || !form.type ? (
                    <p className="text-[13px]" style={{ color: TK.sub }}>
                      Chọn danh mục và loại trước
                    </p>
                  ) : form.category === "Phụ Kiện" ? (
                    <div className="flex items-center gap-2">
                      <div
                        className="rounded-full px-4 py-1.5 text-[12px] font-semibold"
                        style={{
                          background: TK.ink,
                          color: "oklch(0.97 0.012 78)",
                        }}
                      >
                        Free Size
                      </div>
                      <span className="text-[12px]" style={{ color: TK.sub }}>
                        — tự động chọn
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((s) => {
                        const on = form.sizes.includes(s)
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => toggleSize(s)}
                            className="min-w-[40px] rounded-md px-3 py-1.5 text-[12px] font-bold tracking-[0.04em] transition-all"
                            style={{
                              border: `1.5px solid ${on ? TK.ink : TK.border}`,
                              background: on ? TK.ink : "transparent",
                              color: on ? "oklch(0.97 0.012 78)" : TK.ink,
                            }}
                          >
                            {s}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Màu sắc */}
                <div>
                  <FieldLabel required>Màu sắc</FieldLabel>
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, color: e.target.value }))
                    }
                    placeholder="Ví dụ: Trắng, Be, Xanh navy..."
                    className="w-full rounded-full px-4 py-2.5 text-[14px] outline-none"
                    style={{
                      border: `1px solid ${TK.border}`,
                      background: TK.card,
                      color: TK.ink,
                    }}
                  />
                </div>

                {/* Tags */}
                <div>
                  <FieldLabel>Tags</FieldLabel>
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {TAG_SUGGESTIONS.filter((t) => !form.tags.includes(t)).map(
                      (t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => addTag(t)}
                          className="rounded-full px-3 py-1 text-[11px] font-medium transition-all hover:opacity-70"
                          style={{
                            background: TK.sand,
                            color: TK.sub,
                            border: `1px solid ${TK.border}`,
                          }}
                        >
                          + {t}
                        </button>
                      )
                    )}
                  </div>
                  {form.tags.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {form.tags.map((t) => (
                        <span
                          key={t}
                          className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium"
                          style={{
                            background: TK.ink,
                            color: "oklch(0.97 0.012 78)",
                          }}
                        >
                          {t}
                          <button
                            type="button"
                            onClick={() => removeTag(t)}
                            className="cursor-pointer opacity-70 hover:opacity-100"
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addTag(tagInput)
                        }
                      }}
                      placeholder="Nhập tag rồi Enter..."
                      className="flex-1 rounded-full px-4 py-2.5 text-[14px] outline-none"
                      style={{
                        border: `1px solid ${TK.border}`,
                        background: TK.card,
                        color: TK.ink,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => addTag(tagInput)}
                      disabled={!tagInput.trim()}
                      className="rounded-full px-4 py-2.5 transition-all disabled:opacity-40"
                      style={{
                        background: TK.sand,
                        border: `1px solid ${TK.border}`,
                        color: TK.ink,
                      }}
                    >
                      <Plus className="size-4" strokeWidth={1.6} />
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="editorial-rule" />

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!canSubmit || submitting}
                  className="ribbon-tan w-full rounded-full py-4 text-[13px] font-bold tracking-[0.18em] uppercase disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Đang gửi...
                    </span>
                  ) : (
                    "Đăng sản phẩm"
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}
