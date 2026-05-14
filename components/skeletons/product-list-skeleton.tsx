import { Skeleton } from "@/components/ui/skeleton"
import { ProductGridSkeleton } from "./product-grid-skeleton"

/**
 * /products page skeleton: breadcrumb + heading + filter sidebar + product grid.
 */
export function ProductListSkeleton() {
  return (
    <div className="min-h-screen bg-[oklch(0.962_0.012_78)]">
      {/* Breadcrumb strip */}
      <div className="border-b border-[oklch(0.88_0.018_70)] bg-[oklch(0.94_0.014_75)]">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-8 py-3 lg:px-12">
          <Skeleton className="h-3 w-16 rounded-sm" />
          <span className="text-[oklch(0.78_0.04_70)]">/</span>
          <Skeleton className="h-3 w-24 rounded-sm" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-8 py-12 lg:px-12">
        {/* Header */}
        <div className="mb-12 space-y-4">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[oklch(0.6_0.062_60)]" />
            <Skeleton className="h-3 w-28 rounded-sm" />
          </div>
          <Skeleton className="h-12 w-1/2 rounded-sm" />
          <Skeleton className="h-4 w-2/3 rounded-sm" />
        </div>

        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          {/* Filter sidebar */}
          <aside className="hidden space-y-8 lg:block">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-3 w-20 rounded-sm" />
                <div className="space-y-2.5 pl-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <Skeleton className="size-3.5 rounded-sm" />
                      <Skeleton className="h-3 w-full max-w-[140px] rounded-sm" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </aside>

          {/* Grid */}
          <div className="space-y-6">
            {/* Sort row */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32 rounded-sm" />
              <Skeleton className="h-9 w-40 rounded-full" />
            </div>
            <ProductGridSkeleton count={9} columns={3} />
          </div>
        </div>
      </div>
    </div>
  )
}
