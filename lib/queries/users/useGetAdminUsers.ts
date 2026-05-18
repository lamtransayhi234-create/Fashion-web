"use client"

import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/queries/queryKeys"
import { getSupabase } from "@/lib/supabase/client"

export type AdminUserRow = {
  id: string
  email: string
  name: string
  role: "user" | "supplier"
  avatar: string | null
  shop_name: string | null
  created_at: string
}

export function useGetAdminUsers() {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: async (): Promise<AdminUserRow[]> => {
      const { data, error } = await getSupabase()
        .from("profiles")
        .select("id, email, name, role, avatar, shop_name, created_at")
        .in("role", ["user", "supplier"])
        .order("created_at", { ascending: false })
      if (error) throw error
      return (data ?? []) as AdminUserRow[]
    },
    staleTime: 60 * 1000,
  })
}
