"use client"

import { create } from "zustand"

export type PendingRental = {
  productId: string
  providerId: string
  productName: string
  productSrc: string
  productType: string
  size: string
  color: string
  fromDate: string        // "yyyy-MM-dd"
  toDate: string
  nights: number
  rentalPricePerDay: number
  total: number
  brandPrice: number
}

type OrderState = {
  pending: PendingRental | null
  setPending: (order: PendingRental) => void
  clear: () => void
}

export const useOrderStore = create<OrderState>((set) => ({
  pending: null,
  setPending: (order) => set({ pending: order }),
  clear: () => set({ pending: null }),
}))
