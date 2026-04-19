export type CategoryCardProps = {
  name: string
  itemCount: string
  image: string
  imageAlt: string
  accent?: "pink" | "lilac" | "peach" | "mint" | "butter"
}

const ACCENT_DOT: Record<NonNullable<CategoryCardProps["accent"]>, string> = {
  pink: "bg-[oklch(0.6_0.062_60)]",
  lilac: "bg-[oklch(0.55_0.05_55)]",
  peach: "bg-[oklch(0.66_0.06_60)]",
  mint: "bg-[oklch(0.5_0.04_60)]",
  butter: "bg-[oklch(0.7_0.05_70)]",
}

export function CategoryCard({
  name,
  itemCount,
  image,
  imageAlt,
  accent = "pink",
}: CategoryCardProps) {
  return (
    <div className="group relative flex-shrink-0">
      <div className="relative h-72 w-[220px] cursor-pointer overflow-hidden rounded-md bg-[oklch(0.99_0.008_78)] p-1.5 ring-1 ring-[oklch(0.86_0.018_70)] shadow-[0_18px_40px_-22px_oklch(0.34_0.03_55/0.4)] transition-transform duration-500 group-hover:-translate-y-1.5">
        <div className="relative size-full overflow-hidden rounded-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={imageAlt}
            className="size-full object-cover transition-transform duration-[900ms] group-hover:scale-110"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-[oklch(0.18_0.014_55/0.65)] via-transparent to-transparent"
          />
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center justify-between gap-2 rounded-sm bg-[oklch(0.99_0.008_78)]/95 px-3 py-1.5 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className={`size-1.5 rounded-full ${ACCENT_DOT[accent]}`} />
                <p className="font-display text-[13px] font-semibold tracking-tight text-[oklch(0.18_0.014_55)]">
                  {name}
                </p>
              </div>
              <p className="text-[10px] tracking-[0.12em] text-[oklch(0.5_0.024_60)] uppercase">
                {itemCount}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
