"use client"

import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/queries/queryKeys"
import { getSupabase } from "@/lib/supabase/client"
import { useAuthStore, type Order } from "@/lib/store/auth-store"
import type { Database } from "@/lib/supabase/types"

type OrderRow = Database["public"]["Tables"]["orders"]["Row"]

const rowToOrder = (r: OrderRow): Order => ({
  id: r.id,
  userId: r.user_id,
  providerId: r.provider_id ?? "",
  productId: r.product_id ?? "",
  productName: r.product_name,
  productSrc: r.product_src,
  productType: r.product_type,
  size: r.size,
  color: r.color ?? "",
  fromDate: r.from_date,
  toDate: r.to_date,
  nights: r.nights,
  rentalPricePerDay: Number(r.rental_price_per_day),
  total: Number(r.total),
  deposit: Number(r.deposit),
  address: r.address,
  phone: r.phone,
  paymentMethod: r.payment_method,
  paymentMethodLabel: r.payment_method_label,
  note: r.note ?? "",
  status: r.status,
  createdAt: r.created_at,
})

/**
 * Lấy orders theo scope:
 * - "mine"  → user: orders mình đặt
 * - "shop"  → supplier: orders của shop
 * - "all"   → admin: tất cả orders
 *
 * Auto-derive scope từ user.role nếu không truyền.
 */
export function useGetOrders(scope?: "mine" | "shop" | "all") {
  const user = useAuthStore((s) => s.user)
  const derivedScope: "mine" | "shop" | "all" =
    scope ??
    (user?.role === "admin"
      ? "all"
      : user?.role === "supplier"
        ? "shop"
        : "mine")

  return useQuery({
    queryKey: queryKeys.orders.list(derivedScope),
    enabled: !!user,
    queryFn: async (): Promise<Order[]> => {
      if (!user) return []
      let q = getSupabase().from("orders").select("*").order("created_at", { ascending: false })
      if (derivedScope === "mine") q = q.eq("user_id", user.id)
      else if (derivedScope === "shop") q = q.eq("provider_id", user.id)
      const { data, error } = await q
      if (error) throw error
      return (data ?? []).map(rowToOrder)
    },
  })
}

export { rowToOrder }
