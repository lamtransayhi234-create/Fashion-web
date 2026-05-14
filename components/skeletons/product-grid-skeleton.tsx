import { ProductCardSkeleton } from "./product-card-skeleton"

type Props = {
  count?: number
  columns?: 2 | 3 | 4
}

/**
 * Grid of product card skeletons. Reusable cho mọi nơi render product list.
 */
export function ProductGridSkeleton({ count = 8, columns = 3 }: Props) {
  const colsClass =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 4
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"

  return (
    <div className={`grid gap-6 ${colsClass}`}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
