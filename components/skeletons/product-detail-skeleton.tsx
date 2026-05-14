import { Skeleton } from "@/components/ui/skeleton"
import { ProductGridSkeleton } from "./product-grid-skeleton"

/**
 * /product/[id] page skeleton.
 * Layout: breadcrumb · 2-col (gallery left, info right) · "similar" grid.
 */
export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[oklch(0.962_0.012_78)]">
      {/* Breadcrumb */}
      <div className="border-b border-[oklch(0.88_0.018_70)] bg-[oklch(0.94_0.014_75)]">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-8 py-3 lg:px-12">
          <Skeleton className="h-3 w-16 rounded-sm" />
          <span className="text-[oklch(0.78_0.04_70)]">/</span>
          <Skeleton className="h-3 w-20 rounded-sm" />
          <span className="text-[oklch(0.78_0.04_70)]">/</span>
          <Skeleton className="h-3 w-32 rounded-sm" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-8 py-12 lg:px-12">
        {/* Top: gallery + info */}
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Gallery — aspect 3:4 */}
          <div className="space-y-4">
            <Skeleton className="aspect-[3/4] w-full rounded-md" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-sm" />
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-7">
            {/* Eyebrow */}
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[oklch(0.6_0.062_60)]" />
              <Skeleton className="h-3 w-24 rounded-sm" />
            </div>

            {/* Title */}
            <div className="space-y-3">
              <Skeleton className="h-10 w-5/6 rounded-sm" />
              <Skeleton className="h-10 w-3/5 rounded-sm" />
            </div>

            {/* Price row */}
            <div className="flex items-end gap-4">
              <Skeleton className="h-9 w-32 rounded-sm" />
              <Skeleton className="h-5 w-20 rounded-sm" />
              <Skeleton className="h-6 w-14 rounded-sm" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-3 w-full rounded-sm" />
              <Skeleton className="h-3 w-11/12 rounded-sm" />
              <Skeleton className="h-3 w-4/5 rounded-sm" />
            </div>

            {/* Size chips */}
            <div className="space-y-3">
              <Skeleton className="h-3 w-16 rounded-sm" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-12 rounded-sm" />
                ))}
              </div>
            </div>

            {/* Date range */}
            <div className="space-y-3">
              <Skeleton className="h-3 w-32 rounded-sm" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>

            {/* CTAs */}
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-12 flex-1 rounded-full" />
              <Skeleton className="h-12 w-44 rounded-full" />
            </div>

            {/* Provider card */}
            <div className="mt-4 flex items-center gap-3 rounded-md bg-[oklch(0.99_0.008_78)] p-4 ring-1 ring-[oklch(0.88_0.018_70)]">
              <Skeleton className="size-12 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32 rounded-sm" />
                <Skeleton className="h-3 w-24 rounded-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Similar products */}
        <div className="mt-24 space-y-8">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[oklch(0.6_0.062_60)]" />
            <Skeleton className="h-3 w-28 rounded-sm" />
          </div>
          <Skeleton className="h-10 w-1/3 rounded-sm" />
          <ProductGridSkeleton count={4} columns={4} />
        </div>
      </div>
    </div>
  )
}
