"use client"

import { ProductCard, type ProductCardProps } from "@/components/product-card"
import { ProductCardSkeleton } from "@/components/skeletons/product-card-skeleton"
import { useGetProducts } from "@/lib/queries/products/useGetProducts"
import { useGetProviders } from "@/lib/queries/providers/useGetProviders"

const FEATURED_COUNT = 4

export function HotProducts() {
  const { data: products = [], isLoading: productsLoading } = useGetProducts()
  const { data: providers = [], isLoading: providersLoading } = useGetProviders()

  if (productsLoading || providersLoading) {
    return (
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {Array.from({ length: FEATURED_COUNT }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  const providerById = new Map(providers.map((v) => [v.id, v]))

  const featured: ProductCardProps[] = products
    .filter((p) => p.status === "available")
    .slice(0, FEATURED_COUNT)
    .map((p) => {
      const provider = providerById.get(p.providerId)
      return {
        product: p,
        pricePerDay: `${p.rentalPrice.toLocaleString("vi-VN")}đ/ngày`,
        image: p.src,
        imageAlt: p.name,
        owner: {
          handle: provider?.handle ?? "",
          avatar: provider?.avatar ?? "",
          location: provider?.location ?? "",
        },
        rating: p.rating,
        availability:
          p.status === "available"
            ? { label: "Sẵn sàng ngay", tone: "success" as const }
            : { label: "Hết hàng", tone: "danger" as const },
      }
    })

  if (featured.length === 0) {
    return (
      <p className="py-16 text-center text-[13px] tracking-[0.18em] text-[oklch(0.5_0.024_60)] uppercase">
        Chưa có sản phẩm nổi bật
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
      {featured.map((product) => (
        <ProductCard key={product.product.id} {...product} />
      ))}
    </div>
  )
}
