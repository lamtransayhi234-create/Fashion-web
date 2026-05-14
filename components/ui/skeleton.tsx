import { cn } from "@/lib/utils"

/**
 * Base skeleton primitive — warm sand bg + slow pulse, refined editorial feel.
 * Composed by page-specific skeletons in `components/skeletons/*`.
 *
 * Trên cream background (oklch 0.962), sand-2 (oklch 0.91) tạo subtle warm
 * placeholder không chói. Animate-pulse fade opacity tới ~50%, mềm mại.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-md bg-[oklch(0.91_0.022_75)]",
        className,
      )}
      {...props}
    />
  )
}
