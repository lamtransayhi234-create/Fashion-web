"use client"

import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/queries/queryKeys"
import { getSupabase } from "@/lib/supabase/client"
import { useAuthStore } from "@/lib/store/auth-store"

import type { SupplierNotification } from "./types"

type Row = {
  id: string
  name: string
  src: string
  upload_status: "pending" | "approved" | "rejected"
  reject_reason: string | null
  reviewed_at: string | null
}

export function useGetSupplierNotifications() {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: queryKeys.notifications.supplier(user?.id ?? ""),
    enabled: !!user && user.role === "supplier",
    queryFn: async (): Promise<SupplierNotification[]> => {
      if (!user) return []
      const { data, error } = await getSupabase()
        .from("product_submissions")
        .select("id, name, src, upload_status, reject_reason, reviewed_at")
        .eq("supplier_id", user.id)
        .in("upload_status", ["approved", "rejected"])
        .not("reviewed_at", "is", null)
        .order("reviewed_at", { ascending: false })
        .limit(20)
      if (error) throw error
      return ((data ?? []) as Row[]).map((r) => ({
        id: r.id,
        type: r.upload_status as "approved" | "rejected",
        productName: r.name,
        productSrc: r.src,
        rejectReason: r.reject_reason ?? undefined,
        reviewedAt: r.reviewed_at!,
      }))
    },
  })
}
