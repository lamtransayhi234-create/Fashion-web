"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/queries/queryKeys"
import { getSupabase } from "@/lib/supabase/client"
import { useAuthStore } from "@/lib/store/auth-store"
import type { Product } from "@/lib/data/products"

export function useToggleWhitelist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (product: Product) => {
      const u = useAuthStore.getState().user
      if (!u) throw new Error("Chưa đăng nhập")
      const supabase = getSupabase()

      // Check exist
      const { data: existing } = await supabase
        .from("whitelist")
        .select("user_id")
        .eq("user_id", u.id)
        .eq("product_id", product.id)
        .maybeSingle()

      if (existing) {
        const { error } = await supabase
          .from("whitelist")
          .delete()
          .eq("user_id", u.id)
          .eq("product_id", product.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from("whitelist")
          .insert({ user_id: u.id, product_id: product.id } as never)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.whitelist.all })
    },
  })
}
