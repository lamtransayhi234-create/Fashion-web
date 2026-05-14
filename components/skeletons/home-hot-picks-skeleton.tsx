import { ProductCardSkeleton } from "./product-card-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * HOT PICKS section skeleton trên trang home — 4 cards trong grid.
 * Eyebrow label + heading + grid of 4.
 */
export function HomeHotPicksSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-24 lg:px-12 lg:py-32">
      {/* Eyebrow */}
      <div className="mb-6 flex items-center gap-3">
        <span className="h-px w-10 bg-[oklch(0.6_0.062_60)]" />
        <Skeleton className="h-3 w-32 rounded-sm" />
      </div>

      {/* Heading */}
      <div className="mb-12 space-y-3">
        <Skeleton className="h-12 w-2/3 rounded-sm" />
        <Skeleton className="h-12 w-1/2 rounded-sm" />
      </div>

      {/* Grid 4 cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </section>
  )
}
