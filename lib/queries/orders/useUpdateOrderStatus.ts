"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/queries/queryKeys"
import { getSupabase } from "@/lib/supabase/client"
import type { OrderStatus } from "@/lib/store/auth-store"

type UpdateOrderStatusInput = { id: string; status: OrderStatus }

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: UpdateOrderStatusInput) => {
      const { error } = await getSupabase()
        .from("orders")
        .update({ status } as never)
        .eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.orders.all })
    },
  })
}
