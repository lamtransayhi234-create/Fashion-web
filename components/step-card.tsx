import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type StepCardProps = {
  index: number
  title: string
  description: string
  icon: LucideIcon
  tone: "primary" | "secondary" | "tertiary" | "muted"
}

const TONE_STYLES: Record<StepCardProps["tone"], string> = {
  primary:
    "bg-[oklch(0.6_0.062_60)] text-[oklch(0.97_0.012_78)] ring-[oklch(0.5_0.06_55)]",
  secondary:
    "bg-[oklch(0.78_0.04_70)] text-[oklch(0.18_0.014_55)] ring-[oklch(0.66_0.05_60)]",
  tertiary:
    "bg-[oklch(0.86_0.034_70)] text-[oklch(0.18_0.014_55)] ring-[oklch(0.74_0.04_60)]",
  muted:
    "bg-[oklch(0.91_0.022_75)] text-[oklch(0.18_0.014_55)] ring-[oklch(0.78_0.04_70)]",
}

const NUMBER_STYLES: Record<StepCardProps["tone"], string> = {
  primary: "bg-[oklch(0.99_0.008_78)] text-[oklch(0.6_0.062_60)]",
  secondary: "bg-[oklch(0.18_0.014_55)] text-[oklch(0.97_0.012_78)]",
  tertiary: "bg-[oklch(0.18_0.014_55)] text-[oklch(0.97_0.012_78)]",
  muted: "bg-[oklch(0.18_0.014_55)] text-[oklch(0.97_0.012_78)]",
}

export function StepCard({
  index,
  title,
  description,
  icon: Icon,
  tone,
}: StepCardProps) {
  return (
    <div className="group relative flex flex-col items-center gap-5 text-center">
      <div
        className={cn(
          "relative flex size-24 items-center justify-center rounded-full ring-1 transition-all duration-500 group-hover:scale-105",
          TONE_STYLES[tone]
        )}
      >
        <Icon className="size-9" strokeWidth={1.4} />
        <span
          className={cn(
            "absolute -top-2 -right-2 flex size-8 items-center justify-center rounded-full text-[12px] font-semibold ring-4 ring-[oklch(0.965_0.012_78)]",
            NUMBER_STYLES[tone]
          )}
        >
          {index.toString().padStart(2, "0")}
        </span>
      </div>
      <h3 className="font-display text-xl font-medium tracking-tight text-[oklch(0.18_0.014_55)]">
        {title}
      </h3>
      <p className="max-w-[220px] text-[13px] leading-relaxed text-[oklch(0.5_0.024_60)]">
        {description}
      </p>
    </div>
  )
}
