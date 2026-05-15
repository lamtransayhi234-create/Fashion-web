"use client"

import Link from "next/link"
import { ArrowRight, Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/store/auth-store"

function ExploreButton({ href }: { href: string }) {
  return (
    <Link href={href} className="w-full lg:w-auto">
      <Button className="ribbon-tan group/btn relative isolate h-auto w-full cursor-pointer overflow-hidden rounded-full px-6 py-3 text-[11px] font-semibold tracking-[0.22em] uppercase transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-14px_oklch(0.34_0.03_55/0.55)] active:translate-y-0 active:duration-100 lg:w-auto">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-[120%] skew-x-[-18deg] bg-[linear-gradient(90deg,transparent_0%,oklch(0.97_0.012_78/0.35)_45%,oklch(0.97_0.012_78/0.55)_50%,oklch(0.97_0.012_78/0.35)_55%,transparent_100%)] transition-transform duration-[900ms] ease-out group-hover/btn:translate-x-[120%]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 ring-1 ring-[oklch(0.97_0.012_78/0.22)] transition-opacity duration-500 ring-inset group-hover/btn:opacity-100"
        />
        <span className="relative flex items-center gap-3">
          Khám phá tủ đồ
          <ArrowRight className="size-4 transition-transform duration-300 ease-out group-hover/btn:translate-x-1.5" />
        </span>
      </Button>
    </Link>
  )
}

function RentButton({ href }: { href: string }) {
  return (
    <Link href={href} className="w-full lg:w-auto">
      <Button
        variant="outline"
        className="group/btn2 relative isolate h-auto w-full cursor-pointer overflow-hidden rounded-full border !border-[oklch(0.18_0.014_55)] bg-transparent px-6 py-3 text-[11px] font-semibold tracking-[0.22em] text-[oklch(0.18_0.014_55)] uppercase transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-16px_oklch(0.18_0.014_55/0.5)] active:translate-y-0 lg:w-auto"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 translate-y-full bg-[oklch(0.18_0.014_55)] transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover/btn2:translate-y-0"
        />
        <span className="relative flex items-center gap-3 transition-colors duration-500 group-hover/btn2:text-[oklch(0.97_0.012_78)]">
          Cho thuê đồ
          <Heart className="size-4 transition-all duration-500 ease-out group-hover/btn2:scale-110 group-hover/btn2:fill-[oklch(0.6_0.062_60)] group-hover/btn2:stroke-[oklch(0.6_0.062_60)]" />
        </span>
      </Button>
    </Link>
  )
}

export function HeroCtas() {
  const hydrated = useAuthStore((s) => s.hydrated)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const role = useAuthStore((s) => s.user?.role)

  const showExplore = !hydrated || !isAuthenticated || role === "user" || role === "admin"
  const showRent = !hydrated || !isAuthenticated || role === "supplier"

  const exploreHref = hydrated && isAuthenticated ? "/products" : "/login"
  const rentHref = hydrated && isAuthenticated ? "/supplier" : "/login"

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {showExplore && <ExploreButton href={exploreHref} />}
      {showRent && <RentButton href={rentHref} />}
    </div>
  )
}
