"use client"

import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/lib/queries/queryKeys"
import { getSupabase } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"
import type {
  ProductCategory,
  ProductSize,
  ProductType,
  SubmittedProduct,
} from "@/lib/data/products"

type SubmissionRow = Database["public"]["Tables"]["product_submissions"]["Row"]

type SubRowWithSupplier = SubmissionRow & {
  supplier: { name: string; shop_name: string | null } | null
}

const rowToSubmission = (r: SubRowWithSupplier): SubmittedProduct => ({
  id: r.id,
  supplierId: r.supplier_id,
  supplierName: r.supplier?.name ?? "",
  shopName: r.supplier?.shop_name ?? r.supplier?.name ?? "",
  uploadStatus: r.upload_status,
  rejectReason: r.reject_reason ?? undefined,
  submittedAt: r.submitted_at,
  src: r.src,
  name: r.name,
  brandPrice: Number(r.brand_price),
  rentalPrice: Number(r.rental_price),
  description: r.description ?? "",
  category: r.category as ProductCategory,
  type: r.type as ProductType,
  sizes: r.sizes as ProductSize[],
  color: r.color ?? "",
  tags: r.tags ?? [],
})

export function useGetSubmissions() {
  return useQuery({
    queryKey: queryKeys.submissions.list(),
    queryFn: async (): Promise<SubmittedProduct[]> => {
      const { data, error } = await getSupabase()
        .from("product_submissions")
        .select(
          "*, supplier:profiles!product_submissions_supplier_id_fkey(name, shop_name)",
        )
        .order("submitted_at", { ascending: false })
      if (error) throw error
      return ((data ?? []) as SubRowWithSupplier[]).map(rowToSubmission)
    },
  })
}
