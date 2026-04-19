import { ArrowUpRight, Heart, MapPin, Sparkles, Star } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ProductCardProps = {
  title: string
  pricePerDay: string
  image: string
  imageAlt: string
  owner: {
    handle: string
    avatar: string
    location: string
  }
  rating: number
  availability: {
    label: string
    tone: "success" | "danger"
  }
}

export function ProductCard({
  title,
  pricePerDay,
  image,
  imageAlt,
  owner,
  rating,
  availability,
}: ProductCardProps) {
  return (
    <div className="group relative">
      <div className="relative overflow-hidden rounded-md bg-[oklch(0.99_0.008_78)] ring-1 ring-[oklch(0.88_0.018_70)] shadow-[0_18px_40px_-22px_oklch(0.34_0.03_55/0.35)] transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_28px_60px_-22px_oklch(0.34_0.03_55/0.45)]">
        <div className="relative h-80 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={imageAlt}
            className="size-full object-cover transition-all duration-[900ms] group-hover:scale-110 group-hover:blur-[2px]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[oklch(0.18_0.014_55/0.28)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
          <button
            type="button"
            aria-label="Lưu vào yêu thích"
            className="group/heart absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full bg-[oklch(0.99_0.008_78)]/90 text-[oklch(0.34_0.03_55)] shadow-[0_8px_18px_-8px_oklch(0.34_0.03_55/0.4)] backdrop-blur-md transition-all hover:scale-110 hover:text-[oklch(0.6_0.062_60)]"
          >
            <Heart className="size-4 transition-all group-hover/heart:fill-[oklch(0.6_0.062_60)]" />
          </button>

          <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-sm bg-[oklch(0.99_0.008_78)]/95 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-[oklch(0.34_0.03_55)] uppercase backdrop-blur-md">
            <Sparkles className="size-3 fill-[oklch(0.78_0.04_70)] stroke-[oklch(0.6_0.062_60)]" />
            hot pick
          </div>

          <div className="absolute bottom-4 left-4 z-10 ribbon-tan rounded-full px-4 py-1.5 text-[12px] font-semibold tracking-[0.04em]">
            {pricePerDay}
          </div>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              className="group/cta pointer-events-auto flex translate-y-1 items-center gap-3 rounded-full bg-[oklch(0.97_0.012_78)]/95 py-3 pr-3 pl-6 text-[11px] font-semibold tracking-[0.28em] text-[oklch(0.18_0.014_55)] uppercase opacity-0 shadow-[0_22px_50px_-16px_oklch(0.18_0.014_55/0.6)] ring-1 ring-[oklch(0.97_0.012_78)]/40 backdrop-blur-md transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 hover:bg-[oklch(0.18_0.014_55)] hover:text-[oklch(0.97_0.012_78)] hover:ring-[oklch(0.18_0.014_55)]"
            >
              <span>Thuê ngay</span>
              <span className="flex size-7 items-center justify-center rounded-full bg-[oklch(0.6_0.062_60)] text-[oklch(0.97_0.012_78)] transition-transform duration-300 group-hover/cta:rotate-45">
                <ArrowUpRight className="size-3.5" strokeWidth={1.8} />
              </span>
            </button>
          </div>
        </div>

        <div className="p-5">
          <div className="space-y-3">
            <h3 className="font-display truncate text-[17px] leading-tight font-medium tracking-tight text-[oklch(0.18_0.014_55)]">
              {title}
            </h3>

            <div className="flex items-center gap-2 text-sm text-[oklch(0.5_0.024_60)]">
              <Avatar className="size-7 ring-1 ring-[oklch(0.86_0.018_70)]">
                <AvatarImage src={owner.avatar} alt={owner.handle} />
                <AvatarFallback className="bg-[oklch(0.91_0.022_75)] text-[oklch(0.34_0.03_55)]">
                  {owner.handle.slice(1, 3).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-[12px] font-medium text-[oklch(0.34_0.03_55)]">
                {owner.handle}
              </span>
              <span className="ml-auto flex items-center gap-1 text-[11px] tracking-[0.06em] uppercase">
                <MapPin className="size-3" />
                {owner.location}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 rounded-sm bg-[oklch(0.94_0.014_75)] px-2.5 py-1 text-[12px] font-semibold text-[oklch(0.34_0.03_55)]">
                <Star className="size-3 fill-[oklch(0.6_0.062_60)] stroke-[oklch(0.6_0.062_60)]" />
                <span>{rating.toFixed(1)}</span>
              </div>
              <span
                className={cn(
                  "rounded-sm px-3 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase",
                  availability.tone === "success"
                    ? "bg-[oklch(0.91_0.022_75)] text-[oklch(0.34_0.03_55)]"
                    : "bg-[oklch(0.18_0.014_55)] text-[oklch(0.94_0.014_75)]"
                )}
              >
                {availability.label}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
