"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/queries/queryKeys"

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
      const json: { ok?: boolean; error?: string } = await res.json()
      if (!res.ok) throw new Error(json.error || "delete_failed")
      return json
    },
    onSuccess: () => {
      // Cascade từ migration 0004 xoá luôn products/submissions/orders/whitelist
      // của user/supplier. Invalidate hết các cache liên quan để UI mới ngay.
      qc.invalidateQueries({ queryKey: queryKeys.users.all })
      qc.invalidateQueries({ queryKey: queryKeys.products.all })
      qc.invalidateQueries({ queryKey: queryKeys.submissions.all })
      qc.invalidateQueries({ queryKey: queryKeys.orders.all })
      qc.invalidateQueries({ queryKey: queryKeys.whitelist.all })
      qc.invalidateQueries({ queryKey: queryKeys.providers.all })
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all })
    },
  })
}
