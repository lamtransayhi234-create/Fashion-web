"use client"

import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/queries/queryKeys"
import { getSupabase } from "@/lib/supabase/client"
import type { Provider } from "@/lib/data/products"

type SupplierProfileLite = {
  id: string
  name: string
  shop_name: string | null
  avatar: string | null
  address: string | null
  phone: string | null
}

export function useGetProviders() {
  return useQuery({
    queryKey: queryKeys.providers.list(),
    queryFn: async (): Promise<Provider[]> => {
      const { data, error } = await getSupabase()
        .from("profiles")
        .select("id, name, shop_name, avatar, address, phone")
        .eq("role", "supplier")
      if (error) throw error
      return ((data ?? []) as SupplierProfileLite[]).map((p) => ({
        id: p.id,
        shopName: p.shop_name ?? p.name,
        handle: `@${p.name.toLowerCase().replace(/\s+/g, ".")}`,
        avatar: p.avatar ?? "",
        location: p.address ?? "",
      }))
    },
    staleTime: 5 * 60 * 1000, // providers ít đổi — cache 5 phút
  })
}
