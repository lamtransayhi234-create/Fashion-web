"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/queries/queryKeys"
import { getSupabase } from "@/lib/supabase/client"
import type { SubmittedProduct } from "@/lib/data/products"

export function useApproveProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (sub: SubmittedProduct) => {
      const supabase = getSupabase()
      // 1. Insert vào products
      const { data: prod, error: insErr } = await supabase
        .from("products")
        .insert({
          src: sub.src,
          name: sub.name,
          brand_price: sub.brandPrice,
          rental_price: sub.rentalPrice,
          description: sub.description,
          category: sub.category,
          type: sub.type,
          sizes: sub.sizes,
          color: sub.color,
          tags: sub.tags,
          rating: 5,
          provider_id: sub.supplierId,
        } as never)
        .select("id")
        .single()
      if (insErr || !prod) throw insErr ?? new Error("Insert product failed")
      const productId = (prod as { id: string }).id

      // 2. Update submission status + reviewed_at
      const { error: updErr } = await supabase
        .from("product_submissions")
        .update({
          upload_status: "approved",
          product_id: productId,
          reviewed_at: new Date().toISOString(),
        } as never)
        .eq("id", sub.id)
      if (updErr) throw updErr
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.submissions.all })
      qc.invalidateQueries({ queryKey: queryKeys.products.all })
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all })
    },
  })
}
