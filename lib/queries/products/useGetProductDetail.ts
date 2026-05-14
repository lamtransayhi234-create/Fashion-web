"use client"

import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/queries/queryKeys"
import { getSupabase } from "@/lib/supabase/client"
import { rowToProduct } from "./useGetProducts"
import type { Product } from "@/lib/data/products"

export function useGetProductDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.products.detail(id ?? ""),
    enabled: !!id,
    queryFn: async (): Promise<Product | null> => {
      if (!id) return null
      const { data, error } = await getSupabase()
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle()
      if (error) throw error
      return data ? rowToProduct(data) : null
    },
  })
}
