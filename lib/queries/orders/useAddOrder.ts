"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/queries/queryKeys"
import { getSupabase } from "@/lib/supabase/client"
import { useAuthStore, type Order } from "@/lib/store/auth-store"
import { rowToOrder } from "./useGetOrders"
import type { Database } from "@/lib/supabase/types"

type OrderRow = Database["public"]["Tables"]["orders"]["Row"]

type AddOrderInput = Omit<Order, "id" | "createdAt" | "userId">

export function useAddOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (orderData: AddOrderInput): Promise<Order> => {
      const u = useAuthStore.getState().user
      if (!u) throw new Error("Chưa đăng nhập")
      const { data, error } = await getSupabase()
        .from("orders")
        .insert({
          user_id: u.id,
          provider_id: orderData.providerId,
          product_id: orderData.productId,
          product_name: orderData.productName,
          product_src: orderData.productSrc,
          product_type: orderData.productType,
          size: orderData.size,
          color: orderData.color,
          from_date: orderData.fromDate,
          to_date: orderData.toDate,
          nights: orderData.nights,
          rental_price_per_day: orderData.rentalPricePerDay,
          total: orderData.total,
          deposit: orderData.deposit,
          address: orderData.address,
          phone: orderData.phone,
          payment_method: orderData.paymentMethod,
          payment_method_label: orderData.paymentMethodLabel,
          note: orderData.note,
          status: orderData.status ?? "pending",
        } as never)
        .select("*")
        .single()
      if (error || !data) throw error ?? new Error("Insert order failed")
      return rowToOrder(data as OrderRow)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.orders.all })
    },
  })
}
