"use client"

import { create } from "zustand"

import { getSupabase } from "@/lib/supabase/client"
import type {
  Product,
  ProductCategory,
  Provider,
  ProductSize,
  ProductStatus,
  ProductType,
  SubmittedProduct,
} from "@/lib/data/products"
import type { Database } from "@/lib/supabase/types"

type ProductRow    = Database["public"]["Tables"]["products"]["Row"]
type SubmissionRow = Database["public"]["Tables"]["product_submissions"]["Row"]

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

const rowToSubmission = (
  r: SubmissionRow,
  supplierName: string,
  shopName: string,
): SubmittedProduct => ({
  id: r.id,
  supplierId: r.supplier_id,
  supplierName,
  shopName,
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

type ProductState = {
  allProducts: Product[]
  submittedProducts: SubmittedProduct[]
  providers: Provider[]
  /** @deprecated kept for backwards-compat — same as `providers` */
  dynamicProviders: Provider[]
  loaded: boolean

  init: () => Promise<void>
  refetch: () => Promise<void>

  submitProduct: (
    data: Omit<
      SubmittedProduct,
      "id" | "supplierId" | "supplierName" | "shopName" | "uploadStatus" | "submittedAt"
    >,
    supplier: { id: string; name: string; shopName?: string },
  ) => Promise<void>
  approveProduct: (id: string) => Promise<void>
  rejectProduct: (id: string, reason: string) => Promise<void>
}

const _useProductStore = create<ProductState>()((set, get) => ({
  allProducts: [],
  submittedProducts: [],
  providers: [],
  dynamicProviders: [],
  loaded: false,

  init: async () => {
    if (get().loaded) return
    await get().refetch()
  },

  refetch: async () => {
    const supabase = getSupabase()
    const [{ data: prodRows }, { data: subRows }, { data: supplierRows }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase
        .from("product_submissions")
        .select("*, supplier:profiles!product_submissions_supplier_id_fkey(name, shop_name)")
        .order("submitted_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("id, name, shop_name, avatar, address")
        .eq("role", "supplier"),
    ])

    type SubRowWithSupplier = SubmissionRow & {
      supplier: { name: string; shop_name: string | null } | null
    }

    type SupplierProfileLite = {
      id: string
      name: string
      shop_name: string | null
      avatar: string | null
      address: string | null
    }

    const providers: Provider[] = (supplierRows ?? []).map((p) => {
      const sp = p as SupplierProfileLite
      return {
        id: sp.id,
        shopName: sp.shop_name ?? sp.name,
        handle: `@${sp.name.toLowerCase().replace(/\s+/g, ".")}`,
        avatar: sp.avatar ?? "",
        location: sp.address ?? "",
      }
    })

    set({
      allProducts: (prodRows ?? []).map(rowToProduct),
      submittedProducts: (subRows ?? []).map((row) => {
        const r = row as SubRowWithSupplier
        const name = r.supplier?.name ?? ""
        const shop = r.supplier?.shop_name ?? r.supplier?.name ?? ""
        return rowToSubmission(r, name, shop)
      }),
      providers,
      dynamicProviders: providers,
      loaded: true,
    })
  },

  submitProduct: async (data, supplier) => {
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
    await get().refetch()
  },

  approveProduct: async (id) => {
    const supabase = getSupabase()
    const sub = get().submittedProducts.find((s) => s.id === id)
    if (!sub || sub.uploadStatus !== "pending") return

    const { data: prod, error: insErr } = await supabase
      .from("products")
      .insert({
        src: sub.src,
        name: sub.name,
        brand_price: sub.brandPrice,
        rental_price: sub.rentalPrice,
        description: sub.description,
        category: sub.category,
        type: sub.type,
        sizes: sub.sizes,
        color: sub.color,
        tags: sub.tags,
        rating: 5,
        provider_id: sub.supplierId,
      } as never)
      .select("id")
      .single()
    if (insErr || !prod) throw insErr ?? new Error("Insert product failed")
    const productId = (prod as { id: string }).id

    const { error: updErr } = await supabase
      .from("product_submissions")
      .update({ upload_status: "approved", product_id: productId } as never)
      .eq("id", id)
    if (updErr) throw updErr

    await get().refetch()
  },

  rejectProduct: async (id, reason) => {
    const { error } = await getSupabase()
      .from("product_submissions")
      .update({ upload_status: "rejected", reject_reason: reason } as never)
      .eq("id", id)
    if (error) throw error
    await get().refetch()
  },
}))

// Compat shim cho useProductStore.persist.* — sẽ remove ở Task 23
type ProductPersistShim = {
  hasHydrated: () => boolean
  onFinishHydration: (cb: () => void) => () => void
}
const productPersistShim: ProductPersistShim = {
  hasHydrated: () => _useProductStore.getState().loaded,
  onFinishHydration: (cb) =>
    _useProductStore.subscribe((s, prev) => {
      if (!prev.loaded && s.loaded) cb()
    }),
}
;(_useProductStore as unknown as { persist: ProductPersistShim }).persist = productPersistShim

export const useProductStore = _useProductStore as typeof _useProductStore & {
  persist: ProductPersistShim
}
