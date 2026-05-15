"use client"

import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/queries/queryKeys"
import { getSupabase } from "@/lib/supabase/client"
import { useAuthStore } from "@/lib/store/auth-store"

import type { UserOrderNotification } from "./types"

type Row = {
  id: string
  product_name: string
  product_src: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  status_updated_at: string | null
}

/**
 * Notification cho khách: supplier (hoặc admin) đổi trạng thái đơn hàng.
 * Derive từ bảng orders + cột status_updated_at (migration 0006).
 * Poll 60s để gần real-time mà không cần Supabase Realtime.
 */
export function useGetUserOrderNotifications() {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: queryKeys.notifications.userOrders(user?.id ?? ""),
    enabled: !!user && user.role === "user",
    refetchInterval: 60_000,
    queryFn: async (): Promise<UserOrderNotification[]> => {
      if (!user) return []
      const { data, error } = await getSupabase()
        .from("orders")
        .select("id, product_name, product_src, status, status_updated_at")
        .eq("user_id", user.id)
        .neq("status", "pending")
        .not("status_updated_at", "is", null)
        .order("status_updated_at", { ascending: false })
        .limit(20)
      if (error) throw error
      return ((data ?? []) as Row[]).map((r) => ({
        id: r.id,
        status: r.status as "confirmed" | "completed" | "cancelled",
        productName: r.product_name,
        productSrc: r.product_src,
        statusUpdatedAt: r.status_updated_at!,
      }))
    },
  })
}
