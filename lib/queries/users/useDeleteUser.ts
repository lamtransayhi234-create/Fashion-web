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
      qc.invalidateQueries({ queryKey: queryKeys.users.all })
    },
  })
}
