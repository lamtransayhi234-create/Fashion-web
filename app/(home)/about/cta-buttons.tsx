"use client"

import Link from "next/link"
import { useSyncExternalStore } from "react"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/store/auth-store"

export function CtaButtons() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const hydrated = useSyncExternalStore(
    (cb) => useAuthStore.persist.onFinishHydration(cb),
    () => useAuthStore.persist.hasHydrated(),
    () => false
  )

  const showRegister = hydrated && !isAuthenticated

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {showRegister && (
        <Link href="/register" className="w-full sm:w-auto">
          <Button className="ribbon-tan group/btn relative h-auto w-full cursor-pointer rounded-full px-8 py-4 text-[12px] font-semibold tracking-[0.22em] uppercase transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_24px_48px_-14px_oklch(0.34_0.03_55/0.55)]">
            Tạo tài khoản
            <ArrowRight className="ml-2 size-4 transition-transform duration-300 group-hover/btn:translate-x-1.5" />
          </Button>
        </Link>
      )}
      <Link href="/products" className="w-full sm:w-auto">
        <Button
          variant="outline"
          className="h-auto w-full cursor-pointer rounded-full border !border-[oklch(0.18_0.014_55)] bg-transparent px-8 py-4 text-[12px] font-semibold tracking-[0.22em] text-[oklch(0.18_0.014_55)] uppercase transition-all duration-300 hover:bg-[oklch(0.18_0.014_55)] hover:text-[oklch(0.97_0.012_78)]"
        >
          Khám phá tủ đồ
        </Button>
      </Link>
    </div>
  )
}
