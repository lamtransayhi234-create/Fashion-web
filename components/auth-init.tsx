"use client"

import { useEffect } from "react"

import { useAuthStore } from "@/lib/store/auth-store"
import { useProductStore } from "@/lib/store/product-store"

export function AuthInit({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useAuthStore.getState().init()
    useProductStore.getState().init()
  }, [])
  return <>{children}</>
}
