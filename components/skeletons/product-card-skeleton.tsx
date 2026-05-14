import { Skeleton } from "@/components/ui/skeleton"

/**
 * Mirror layout của <ProductCard> — image (h-80) + body (p-5).
 * Dùng trong: home HOT PICKS, /products grid, /product/[id] "similar".
 */
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-md bg-[oklch(0.99_0.008_78)] shadow-[0_18px_40px_-22px_oklch(0.34_0.03_55/0.18)] ring-1 ring-[oklch(0.88_0.018_70)]">
      {/* Image — h-80 to match real card */}
      <Skeleton className="h-80 w-full rounded-none" />

      {/* Body */}
      <div className="space-y-3 p-5">
        {/* Title — Playfair 17px, single line */}
        <Skeleton className="h-5 w-3/4 rounded-sm" />

        {/* Owner row: avatar + handle + location */}
        <div className="flex items-center gap-2">
          <Skeleton className="size-7 shrink-0 rounded-full" />
          <Skeleton className="h-3 w-24 rounded-sm" />
          <Skeleton className="ml-auto h-3 w-16 rounded-sm" />
        </div>

        {/* Rating + availability chips */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-14 rounded-sm" />
          <Skeleton className="h-6 w-24 rounded-sm" />
        </div>
      </div>
    </div>
  )
}
