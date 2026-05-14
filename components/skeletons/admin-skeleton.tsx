import { Skeleton } from "@/components/ui/skeleton"

/**
 * /admin skeleton — submissions queue.
 * Layout: heading · stats · pending submission cards with approve/reject.
 */
export function AdminSkeleton() {
  return (
    <div className="min-h-screen bg-[oklch(0.962_0.012_78)]">
      <div className="mx-auto max-w-6xl px-8 py-12 lg:px-12">
        {/* Heading */}
        <div className="mb-10 space-y-3">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[oklch(0.6_0.062_60)]" />
            <Skeleton className="h-3 w-32 rounded-sm" />
          </div>
          <Skeleton className="h-12 w-1/2 rounded-sm" />
          <Skeleton className="h-4 w-2/3 rounded-sm" />
        </div>

        {/* Stats */}
        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-md bg-[oklch(0.99_0.008_78)] p-5 ring-1 ring-[oklch(0.88_0.018_70)]"
            >
              <Skeleton className="size-12 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-8 w-12 rounded-sm" />
                <Skeleton className="h-3 w-24 rounded-sm" />
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-32 rounded-full" />
          ))}
        </div>

        {/* Submission cards */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="grid gap-5 rounded-md bg-[oklch(0.99_0.008_78)] p-5 ring-1 ring-[oklch(0.88_0.018_70)] sm:grid-cols-[150px_1fr_auto]"
            >
              {/* Image */}
              <Skeleton className="aspect-[3/4] w-full rounded-sm sm:h-44" />

              {/* Meta */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-20 rounded-sm" />
                  <Skeleton className="h-6 w-24 rounded-sm" />
                </div>
                <Skeleton className="h-6 w-3/4 rounded-sm" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-full rounded-sm" />
                  <Skeleton className="h-3 w-5/6 rounded-sm" />
                </div>
                <div className="mt-auto flex gap-3">
                  <Skeleton className="h-3 w-24 rounded-sm" />
                  <Skeleton className="h-3 w-20 rounded-sm" />
                  <Skeleton className="h-3 w-16 rounded-sm" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-row gap-2 sm:flex-col">
                <Skeleton className="h-10 w-28 rounded-full" />
                <Skeleton className="h-10 w-28 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
