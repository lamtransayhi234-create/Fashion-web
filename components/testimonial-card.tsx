import { Heart } from "lucide-react"

import { cn } from "@/lib/utils"

export type TestimonialCardProps = {
  quote: string
  author: string
  image: string
  imageAlt: string
  rotation: "rotated-card-1" | "rotated-card-2" | "rotated-card-3"
  accent?: "pink" | "peach" | "mint"
}

export function TestimonialCard({
  quote,
  author,
  image,
  imageAlt,
  rotation,
}: TestimonialCardProps) {
  return (
    <div
      className={cn(
        "group relative w-full max-w-[300px] bg-[oklch(0.99_0.008_78)] p-4 pb-14 ring-1 ring-[oklch(0.86_0.018_70)] shadow-[0_22px_50px_-22px_oklch(0.34_0.03_55/0.4)] transition-all duration-500 hover:rotate-0 hover:-translate-y-2",
        rotation
      )}
    >
      <div className="relative mb-4 aspect-square overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={imageAlt}
          className="size-full object-cover grayscale-[0.2] transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
        />
        <Heart className="absolute top-2 right-2 size-5 fill-[oklch(0.6_0.062_60)] stroke-[oklch(0.99_0.008_78)] drop-shadow-md" />
      </div>
      <p className="text-center font-display text-[14px] italic leading-relaxed text-[oklch(0.24_0.018_55)]">
        &ldquo;{quote}&rdquo;
      </p>
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 font-display text-[14px] tracking-[0.18em] text-[oklch(0.6_0.062_60)] uppercase">
        {author}
      </p>
    </div>
  )
}
