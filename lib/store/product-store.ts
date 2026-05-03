"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

import { products } from "@/lib/data/products"
import type { Product, ProductCategory, ProductSize, ProductType, Provider, SubmittedProduct } from "@/lib/data/products"

type ProductState = {
  allProducts: Product[]
  submittedProducts: SubmittedProduct[]
  dynamicProviders: Provider[]   // providers tạo từ supplier khi approve

  submitProduct: (
    data: Omit<SubmittedProduct, "id" | "supplierId" | "supplierName" | "shopName" | "uploadStatus" | "submittedAt">,
    supplier: { id: string; name: string; shopName?: string }
  ) => void
  approveProduct: (id: string) => void
  rejectProduct: (id: string, reason: string) => void
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      allProducts: products,
      submittedProducts: [],
      dynamicProviders: [],

      submitProduct: (data, supplier) => {
        const newSubmission: SubmittedProduct = {
          id: `sub-${Date.now()}`,
          supplierId: supplier.id,
          supplierName: supplier.name,
          shopName: supplier.shopName ?? supplier.name,
          uploadStatus: "pending",
          submittedAt: new Date().toISOString(),
          ...data,
        }
        set((state) => ({
          submittedProducts: [...state.submittedProducts, newSubmission],
        }))
      },

      approveProduct: (id) => {
        const { submittedProducts, dynamicProviders } = get()
        const idx = submittedProducts.findIndex((item) => item.id === id)
        if (idx === -1) return
        const item = submittedProducts[idx]
        if (item.uploadStatus !== "pending") return

        const newProduct: Product = {
          id: `prod-${item.id}`,
          src: item.src,
          name: item.name,
          brandPrice: item.brandPrice,
          rentalPrice: item.rentalPrice,
          description: item.description,
          category: item.category as ProductCategory,
          type: item.type as ProductType,
          sizes: item.sizes as ProductSize[],
          color: item.color,
          tags: item.tags,
          rating: 5 as const,
          providerId: item.supplierId,
          status: "available" as const,
        }

        // Tạo Provider entry nếu chưa có
        const providerExists = dynamicProviders.some((p) => p.id === item.supplierId)
        const newProvider: Provider = {
          id: item.supplierId,
          shopName: item.shopName,
          handle: `@${item.supplierName.toLowerCase().replace(/\s+/g, ".")}`,
          avatar: "",
          location: "TP.HCM",
        }

        set((state) => {
          const updated = [...state.submittedProducts]
          updated[idx] = { ...updated[idx], uploadStatus: "approved" }
          return {
            allProducts: [...state.allProducts, newProduct],
            submittedProducts: updated,
            dynamicProviders: providerExists
              ? state.dynamicProviders
              : [...state.dynamicProviders, newProvider],
          }
        })
      },

      rejectProduct: (id, reason) => {
        const { submittedProducts } = get()
        const idx = submittedProducts.findIndex((item) => item.id === id)
        if (idx === -1) return

        set((state) => {
          const updated = [...state.submittedProducts]
          updated[idx] = { ...updated[idx], uploadStatus: "rejected", rejectReason: reason }
          return { submittedProducts: updated }
        })
      },
    }),
    {
      name: "styleloop-products",
      version: 2,
      partialize: (state) => ({
        allProducts: state.allProducts,
        submittedProducts: state.submittedProducts,
        dynamicProviders: state.dynamicProviders,
      }),
      onRehydrateStorage: () => () => {},
    }
  )
)
