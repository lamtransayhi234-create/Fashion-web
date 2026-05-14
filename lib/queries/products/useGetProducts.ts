"use client"

import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/queries/queryKeys"
import { getSupabase } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"
import type {
  Product,
  ProductCategory,
  ProductSize,
  ProductType,
} from "@/lib/data/products"

type ProductRow = Database["public"]["Tables"]["products"]["Row"]

const rowToProduct = (r: ProductRow): Product => ({
  id: r.id,
  src: r.src,
  name: r.name,
  brandPrice: Number(r.brand_price),
  rentalPrice: Number(r.rental_price),
  status: r.status,
  description: r.description ?? "",
  category: r.category as ProductCategory,
  type: r.type as ProductType,
  sizes: r.sizes as ProductSize[],
  color: r.color ?? "",
  tags: r.tags ?? [],
  rating: (r.rating ?? 5) as 4 | 5,
  providerId: r.provider_id,
})

export function useGetProducts() {
  return useQuery({
    queryKey: queryKeys.products.list(),
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await getSupabase()
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) throw error
      return (data ?? []).map(rowToProduct)
    },
  })
}

export { rowToProduct }
