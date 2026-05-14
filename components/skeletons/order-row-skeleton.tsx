import { Skeleton } from "@/components/ui/skeleton"

/**
 * Atom: 1 row trong list orders. Reusable cho /account/orders + /account/ordered.
 * Layout: thumb (3:4) + meta (3 lines) + status chip + actions.
 */
export function OrderRowSkeleton() {
  return (
    <div className="flex items-stretch gap-4 rounded-md bg-[oklch(0.99_0.008_78)] p-4 ring-1 ring-[oklch(0.88_0.018_70)]">
      {/* Thumb */}
      <Skeleton className="aspect-[3/4] h-28 shrink-0 rounded-sm" />

      {/* Meta */}
      <div className="flex flex-1 flex-col justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-2/3 rounded-sm" />
          <Skeleton className="h-3 w-1/2 rounded-sm" />
          <Skeleton className="h-3 w-1/3 rounded-sm" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-24 rounded-sm" />
          <Skeleton className="h-3 w-20 rounded-sm" />
        </div>
      </div>

      {/* Right: status + actions */}
      <div className="flex shrink-0 flex-col items-end justify-between">
        <Skeleton className="h-6 w-24 rounded-sm" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
    </div>
  )
}
