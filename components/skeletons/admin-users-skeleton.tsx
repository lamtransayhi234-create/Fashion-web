import { Skeleton } from "@/components/ui/skeleton"

/**
 * /admin/users skeleton — list of user/supplier rows in a table.
 */
export function AdminUsersSkeleton() {
  return (
    <div className="min-h-screen bg-[oklch(0.962_0.012_78)]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* Eyebrow */}
        <div className="mb-6 flex items-center gap-3">
          <span className="h-px w-8 bg-[oklch(0.6_0.062_60)]" />
          <Skeleton className="h-3 w-32 rounded-sm" />
        </div>

        {/* Heading */}
        <div className="mb-10 flex items-center gap-4">
          <Skeleton className="size-14 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-64 rounded-sm" />
            <Skeleton className="h-3 w-40 rounded-sm" />
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-md bg-[oklch(0.99_0.008_78)] p-4 ring-1 ring-[oklch(0.88_0.018_70)]"
            >
              <Skeleton className="mx-auto h-8 w-12 rounded-sm" />
              <Skeleton className="mx-auto mt-2 h-3 w-20 rounded-sm" />
            </div>
          ))}
        </div>

        {/* Filter row */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-10 w-full rounded-full sm:w-72" />
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-md bg-[oklch(0.99_0.008_78)] ring-1 ring-[oklch(0.88_0.018_70)]">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_1fr_120px_120px_60px] gap-3 border-b border-[oklch(0.88_0.018_70)] px-5 py-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-3 rounded-sm" />
            ))}
          </div>
          {/* Body rows */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_1fr_120px_120px_60px] items-center gap-3 border-b border-[oklch(0.88_0.018_70)]/60 px-5 py-3 last:border-0"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 shrink-0 rounded-full" />
                <Skeleton className="h-4 w-32 rounded-sm" />
              </div>
              <Skeleton className="h-4 w-40 rounded-sm" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-20 rounded-sm" />
              <Skeleton className="size-8 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
