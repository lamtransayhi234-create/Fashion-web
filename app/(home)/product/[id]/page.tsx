import { notFound } from "next/navigation"
import Link from "next/link"
import {
  ChevronRight,
  MapPin,
  Package,
  Palette,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Truck,
} from "lucide-react"

import { products, providers } from "@/lib/data/products"
import { ProductImageZoom } from "@/components/product-image-zoom"
import { ProductRentalForm } from "@/components/product-rental-form"
import { ProductCard } from "@/components/product-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = products.find((p) => p.id === id)
  if (!product) notFound()

  const provider = providers.find((p) => p.id === product.providerId)!
  const isAvailable = product.status === "available"
  const savingPct = Math.round(
    (1 - product.rentalPrice / product.brandPrice) * 100
  )

  const similar = products
    .filter((p) => p.type === product.type && p.id !== product.id)
    .slice(0, 4)

  return (
    <div className="min-h-screen bg-[oklch(0.962_0.012_78)]">
      {/* ─── Breadcrumb ─── */}
      <div className="border-b border-[oklch(0.88_0.018_70)] bg-[oklch(0.94_0.014_75)]">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-8 py-3 lg:px-12">
          <Link
            href="/"
            className="text-[10px] font-semibold tracking-[0.22em] text-[oklch(0.38_0.028_58)] uppercase transition-colors hover:text-[oklch(0.18_0.014_55)]"
          >
            Trang chủ
          </Link>
          <ChevronRight
            className="size-3 text-[oklch(0.78_0.04_70)]"
            strokeWidth={1.4}
          />
          <Link
            href={"/products"}
            className="text-[10px] font-semibold tracking-[0.22em] text-[oklch(0.38_0.028_58)] uppercase"
          >
            {product.category}
          </Link>
          <ChevronRight
            className="size-3 text-[oklch(0.78_0.04_70)]"
            strokeWidth={1.4}
          />
          <span className="max-w-[220px] truncate text-[10px] font-semibold tracking-[0.22em] text-[oklch(0.18_0.014_55)] uppercase">
            {product.name}
          </span>
        </div>
      </div>

      {/* ─── Main grid ─── */}
      <div className="mx-auto max-w-7xl px-8 py-14 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          {/* ── Left: Image ── */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <ProductImageZoom src={product.src} alt={product.name} />
          </div>

          {/* ── Right: Info ── */}
          <div className="space-y-8">
            {/* Category eyebrow */}
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[oklch(0.6_0.062_60)]" />
              <span className="text-[10px] font-semibold tracking-[0.32em] text-[oklch(0.38_0.028_58)] uppercase">
                ✦ {product.category} · {product.type} ✦
              </span>
            </div>

            {/* Name + rating */}
            <div className="space-y-4">
              <h1 className="font-display text-[36px] leading-tight font-medium tracking-[-0.01em] text-[oklch(0.18_0.014_55)] lg:text-[42px]">
                {product.name}
              </h1>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${
                        i < product.rating
                          ? "fill-[oklch(0.6_0.062_60)] stroke-[oklch(0.6_0.062_60)]"
                          : "stroke-[oklch(0.78_0.04_70)]"
                      }`}
                      strokeWidth={1.4}
                    />
                  ))}
                </div>
                <span className="text-[12px] font-medium text-[oklch(0.38_0.028_58)]">
                  {product.rating}.0 / 5
                </span>

                {/* Status pill */}
                <span
                  className={`ml-auto inline-flex items-center gap-1.5 rounded-sm px-3 py-1 text-[10px] font-semibold tracking-[0.16em] uppercase ${
                    isAvailable
                      ? "bg-[oklch(0.91_0.022_75)] text-[oklch(0.22_0.02_55)]"
                      : "bg-[oklch(0.18_0.014_55)] text-[oklch(0.94_0.014_75)]"
                  }`}
                >
                  <span
                    className={`size-1.5 animate-pulse rounded-full ${
                      isAvailable
                        ? "bg-[oklch(0.6_0.062_60)]"
                        : "bg-[oklch(0.55_0.18_28)]"
                    }`}
                  />
                  {isAvailable ? "Đang sẵn có" : "Đã được thuê"}
                </span>
              </div>
            </div>

            {/* ── Price card ── */}
            <div className="soft-shadow rounded-md bg-[oklch(0.99_0.008_78)] p-6 ring-1 ring-[oklch(0.88_0.018_70)]">
              <div className="flex items-end gap-4">
                <div>
                  <div className="mb-1 text-[10px] font-semibold tracking-[0.24em] text-[oklch(0.38_0.028_58)] uppercase">
                    Giá thuê / ngày
                  </div>
                  <div className="font-display text-[42px] leading-none font-semibold text-[oklch(0.18_0.014_55)]">
                    {product.rentalPrice.toLocaleString("vi-VN")}
                    <span className="ml-1 text-[20px] font-normal text-[oklch(0.38_0.028_58)]">
                      đ
                    </span>
                  </div>
                </div>

                <div className="ml-auto text-right">
                  <div className="mb-1 text-[10px] font-semibold tracking-[0.24em] text-[oklch(0.38_0.028_58)] uppercase">
                    Giá gốc
                  </div>
                  <div className="font-display text-[22px] text-[oklch(0.68_0.04_60)] line-through">
                    {product.brandPrice.toLocaleString("vi-VN")}đ
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-[oklch(0.88_0.018_70)] pt-3 text-[12px] text-[oklch(0.38_0.028_58)]">
                Tiết kiệm{" "}
                <span className="font-semibold text-[oklch(0.22_0.02_55)]">
                  {savingPct}%
                </span>{" "}
                so với mua mới — bền vững hơn, thú vị hơn
              </div>
            </div>

            {/* ── Color + Description ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Palette
                  className="size-4 text-[oklch(0.38_0.028_58)]"
                  strokeWidth={1.4}
                />
                <span className="text-[11px] tracking-[0.2em] text-[oklch(0.38_0.028_58)] uppercase">
                  Màu sắc
                </span>
                <span className="text-[13px] font-semibold text-[oklch(0.18_0.014_55)]">
                  {product.color}
                </span>
              </div>

              <p className="text-[15px] leading-[1.8] text-[oklch(0.22_0.02_55)]">
                {product.description}
              </p>
            </div>

            {/* ── Tags ── */}
            <div className="flex flex-wrap items-center gap-2">
              <Tag
                className="size-3.5 shrink-0 text-[oklch(0.38_0.028_58)]"
                strokeWidth={1.4}
              />
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-sm bg-[oklch(0.91_0.022_75)] px-3 py-1 text-[10px] font-semibold tracking-[0.14em] text-[oklch(0.22_0.02_55)] uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Divider */}
            <div className="editorial-rule h-px" />

            {/* ── Rental form ── */}
            <ProductRentalForm
              sizes={product.sizes}
              isAvailable={isAvailable}
              rentalPrice={product.rentalPrice}
              productId={product.id}
              productName={product.name}
              productSrc={product.src}
              productType={product.type}
              color={product.color}
              brandPrice={product.brandPrice}
            />

            {/* ── Trust badges ── */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  icon: ShieldCheck,
                  label: "Bảo hiểm đồ",
                  sub: "Được bảo vệ toàn diện",
                },
                {
                  icon: RotateCcw,
                  label: "Trả đồ dễ",
                  sub: "Quy trình đơn giản",
                },
                { icon: Truck, label: "Giao & nhận", sub: "Tận nơi, đúng giờ" },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 rounded-md bg-[oklch(0.94_0.014_75)] px-3 py-4 text-center"
                >
                  <Icon
                    className="size-5 text-[oklch(0.6_0.062_60)]"
                    strokeWidth={1.4}
                  />
                  <div>
                    <div className="text-[11px] font-semibold text-[oklch(0.18_0.014_55)]">
                      {label}
                    </div>
                    <div className="mt-0.5 text-[10px] text-[oklch(0.38_0.028_58)]">
                      {sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Provider card ── */}
            <div className="soft-shadow flex items-center gap-4 rounded-md bg-[oklch(0.99_0.008_78)] p-5 ring-1 ring-[oklch(0.88_0.018_70)]">
              {/* <Avatar className="size-14 ring-2 ring-[oklch(0.86_0.018_70)] ring-offset-2 ring-offset-[oklch(0.99_0.008_78)]">
                <AvatarImage src={provider.avatar} alt={provider.shopName} />
                <AvatarFallback className="bg-[oklch(0.91_0.022_75)] font-display text-lg font-medium text-[oklch(0.22_0.02_55)]">
                  {provider.shopName[0]}
                </AvatarFallback>
              </Avatar> */}

              <div className="min-w-0 flex-1">
                <div className="mb-0.5 text-[10px] font-semibold tracking-[0.22em] text-[oklch(0.38_0.028_58)] uppercase">
                  Người cho thuê
                </div>
                <div className="font-display text-[18px] font-medium text-[oklch(0.18_0.014_55)]">
                  {provider.shopName}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[12px] text-[oklch(0.38_0.028_58)]">
                  <span>{provider.handle}</span>
                  <span className="text-[oklch(0.78_0.04_70)]">·</span>
                  <MapPin className="size-3" strokeWidth={1.4} />
                  <span>{provider.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 rounded-sm bg-[oklch(0.94_0.014_75)] px-2.5 py-1.5 text-[11px] font-semibold text-[oklch(0.22_0.02_55)]">
                <Sparkles className="size-3 fill-[oklch(0.78_0.04_70)] stroke-[oklch(0.6_0.062_60)]" />
                Uy tín
              </div>
            </div>
          </div>
        </div>

        {/* ─── Similar products ─── */}
        {similar.length > 0 && (
          <section className="mt-28">
            {/* Section header */}
            <div className="mb-10 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-[oklch(0.6_0.062_60)]" />
                <span className="text-[10px] font-semibold tracking-[0.32em] text-[oklch(0.38_0.028_58)] uppercase">
                  ✦ Gợi ý tương tự ✦
                </span>
              </div>
              <h2 className="font-display text-[32px] font-medium tracking-[-0.01em] text-[oklch(0.18_0.014_55)] lg:text-[40px]">
                Cùng phong cách{" "}
                <span className="text-[oklch(0.6_0.062_60)] italic">
                  {product.type}
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((p) => {
                const prov = providers.find((v) => v.id === p.providerId)!
                return (
                  <Link key={p.id} href={`/product/${p.id}`} className="block">
                    <ProductCard
                      title={p.name}
                      pricePerDay={`${p.rentalPrice.toLocaleString("vi-VN")}đ / ngày`}
                      image={p.src}
                      imageAlt={p.name}
                      owner={{
                        handle: prov.handle,
                        avatar: prov.avatar,
                        location: prov.location,
                      }}
                      rating={p.rating}
                      availability={{
                        label: p.status === "available" ? "Sẵn có" : "Hết hàng",
                        tone: p.status === "available" ? "success" : "danger",
                      }}
                    />
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
