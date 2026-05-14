import { Skeleton } from "@/components/ui/skeleton"
import { OrderRowSkeleton } from "./order-row-skeleton"

/**
 * /account/ordered skeleton — supplier's incoming orders.
 * Layout: breadcrumb · heading · stats cards · filter · order rows.
 */
export function AccountOrderedSkeleton() {
  return (
    <div className="min-h-screen bg-[oklch(0.962_0.012_78)]">
      {/* Breadcrumb */}
      <div className="border-b border-[oklch(0.88_0.018_70)] bg-[oklch(0.94_0.014_75)]">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-8 py-3 lg:px-12">
          <Skeleton className="h-3 w-16 rounded-sm" />
          <span className="text-[oklch(0.78_0.04_70)]">/</span>
          <Skeleton className="h-3 w-24 rounded-sm" />
          <span className="text-[oklch(0.78_0.04_70)]">/</span>
          <Skeleton className="h-3 w-32 rounded-sm" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-8 py-12 lg:px-12">
        {/* Heading */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[oklch(0.6_0.062_60)]" />
            <Skeleton className="h-3 w-32 rounded-sm" />
          </div>
          <Skeleton className="h-12 w-3/5 rounded-sm" />
        </div>

        {/* Stats row */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="space-y-3 rounded-md bg-[oklch(0.99_0.008_78)] p-5 ring-1 ring-[oklch(0.88_0.018_70)]"
            >
              <Skeleton className="size-10 rounded-full" />
              <Skeleton className="h-8 w-16 rounded-sm" />
              <Skeleton className="h-3 w-24 rounded-sm" />
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 shrink-0 rounded-full" />
          ))}
        </div>

        {/* Order rows */}
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <OrderRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
