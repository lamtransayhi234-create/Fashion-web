import { Skeleton } from "@/components/ui/skeleton"

/**
 * /supplier skeleton — supplier dashboard với form đăng sản phẩm + history.
 * Layout: heading · 2-col (form left, history right).
 */
export function SupplierSkeleton() {
  return (
    <div className="min-h-screen bg-[oklch(0.962_0.012_78)]">
      <div className="mx-auto max-w-7xl px-8 py-12 lg:px-12">
        {/* Heading */}
        <div className="mb-10 space-y-3">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[oklch(0.6_0.062_60)]" />
            <Skeleton className="h-3 w-28 rounded-sm" />
          </div>
          <Skeleton className="h-12 w-1/2 rounded-sm" />
          <Skeleton className="h-4 w-3/5 rounded-sm" />
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
          {/* Form */}
          <div className="space-y-5 rounded-md bg-[oklch(0.99_0.008_78)] p-7 ring-1 ring-[oklch(0.88_0.018_70)]">
            <Skeleton className="h-4 w-32 rounded-sm" />

            {/* Image uploader */}
            <Skeleton className="aspect-[3/4] w-full max-w-[280px] rounded-md" />

            {/* Field rows */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-28 rounded-sm" />
                <Skeleton className="h-11 w-full rounded-full" />
              </div>
            ))}

            {/* Two-col fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-24 rounded-sm" />
                  <Skeleton className="h-11 w-full rounded-full" />
                </div>
              ))}
            </div>

            {/* Size chips */}
            <div className="space-y-2">
              <Skeleton className="h-3 w-20 rounded-sm" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-12 rounded-sm" />
                ))}
              </div>
            </div>

            {/* Submit */}
            <Skeleton className="h-12 w-full rounded-full" />
          </div>

          {/* History column */}
          <aside className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32 rounded-sm" />
              <Skeleton className="h-3 w-12 rounded-sm" />
            </div>

            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex gap-3 rounded-md bg-[oklch(0.99_0.008_78)] p-3 ring-1 ring-[oklch(0.88_0.018_70)]"
              >
                <Skeleton className="aspect-[3/4] h-20 shrink-0 rounded-sm" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded-sm" />
                  <Skeleton className="h-3 w-1/2 rounded-sm" />
                  <Skeleton className="h-5 w-20 rounded-sm" />
                </div>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </div>
  )
}
