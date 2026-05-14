"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/lib/queries/queryKeys"
import { getSupabase } from "@/lib/supabase/client"

type RejectInput = { id: string; reason: string }

export function useRejectProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, reason }: RejectInput) => {
      const { error } = await getSupabase()
        .from("product_submissions")
        .update({ upload_status: "rejected", reject_reason: reason } as never)
        .eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.submissions.all })
    },
  })
}
