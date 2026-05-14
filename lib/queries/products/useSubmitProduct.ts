"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/queries/queryKeys"
import { getSupabase } from "@/lib/supabase/client"
import type { SubmittedProduct } from "@/lib/data/products"

type SubmitProductInput = {
  data: Omit<
    SubmittedProduct,
    "id" | "supplierId" | "supplierName" | "shopName" | "uploadStatus" | "submittedAt"
  >
  supplier: { id: string; name: string; shopName?: string }
}

export function useSubmitProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ data, supplier }: SubmitProductInput) => {
      const { error } = await getSupabase()
        .from("product_submissions")
        .insert({
          supplier_id: supplier.id,
          src: data.src,
          name: data.name,
          brand_price: data.brandPrice,
          rental_price: data.rentalPrice,
          description: data.description,
          category: data.category,
          type: data.type,
          sizes: data.sizes,
          color: data.color,
          tags: data.tags,
        } as never)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.submissions.all })
    },
  })
}
