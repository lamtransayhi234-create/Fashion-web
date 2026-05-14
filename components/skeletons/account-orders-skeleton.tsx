import { Skeleton } from "@/components/ui/skeleton"
import { OrderRowSkeleton } from "./order-row-skeleton"

/**
 * /account/orders skeleton — user's rentals.
 * Layout: breadcrumb · heading · filter tabs · order rows.
 */
export function AccountOrdersSkeleton() {
  return (
    <div className="min-h-screen bg-[oklch(0.962_0.012_78)]">
      {/* Breadcrumb */}
      <div className="border-b border-[oklch(0.88_0.018_70)] bg-[oklch(0.94_0.014_75)]">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-8 py-3 lg:px-12">
          <Skeleton className="h-3 w-16 rounded-sm" />
          <span className="text-[oklch(0.78_0.04_70)]">/</span>
          <Skeleton className="h-3 w-24 rounded-sm" />
          <span className="text-[oklch(0.78_0.04_70)]">/</span>
          <Skeleton className="h-3 w-28 rounded-sm" />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-8 py-12 lg:px-12">
        {/* Heading */}
        <div className="mb-10 space-y-3">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[oklch(0.6_0.062_60)]" />
            <Skeleton className="h-3 w-24 rounded-sm" />
          </div>
          <Skeleton className="h-12 w-1/2 rounded-sm" />
          <Skeleton className="h-4 w-3/4 rounded-sm" />
        </div>

        {/* Filter tabs */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 shrink-0 rounded-full" />
          ))}
        </div>

        {/* Rows */}
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <OrderRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
