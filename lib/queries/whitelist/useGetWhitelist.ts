"use client"

import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/queries/queryKeys"
import { getSupabase } from "@/lib/supabase/client"
import { useAuthStore } from "@/lib/store/auth-store"
import { rowToProduct } from "@/lib/queries/products/useGetProducts"
import type { Product } from "@/lib/data/products"
import type { Database } from "@/lib/supabase/types"

type ProductRow = Database["public"]["Tables"]["products"]["Row"]
type WhitelistJoin = { product: ProductRow | null }

export function useGetWhitelist() {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: queryKeys.whitelist.list(user?.id ?? ""),
    enabled: !!user,
    queryFn: async (): Promise<Product[]> => {
      if (!user) return []
      const { data, error } = await getSupabase()
        .from("whitelist")
        .select("product:products(*)")
        .eq("user_id", user.id)
      if (error) throw error
      return ((data ?? []) as WhitelistJoin[])
        .map((w) => w.product)
        .filter((p): p is ProductRow => p !== null)
        .map(rowToProduct)
    },
  })
}
