"use client"

import { create } from "zustand"

import { getSupabase } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"

export type UserRole = "user" | "admin" | "supplier"

// ─── Order type ───────────────────────────────────────────────────────────────
// Giữ lại để consumer pages import (Order type vẫn dùng nhiều chỗ).
// Data + mutations đã chuyển sang lib/queries/orders/*.

export type OrderStatus = "pending" | "confirmed" | "completed" | "cancelled"

export type Order = {
  id: string
  userId: string
  providerId: string
  productId: string
  productName: string
  productSrc: string
  productType: string
  size: string
  color: string
  fromDate: string          // "yyyy-MM-dd"
  toDate: string
  nights: number
  rentalPricePerDay: number
  total: number
  deposit: number
  address: string
  phone: string
  paymentMethod: "bank" | "momo"
  paymentMethodLabel: string
  note: string
  status: OrderStatus
  createdAt: string         // ISO timestamp
}

export type PublicUser = {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  phone?: string
  address?: string
  shopName?: string
  permissions?: string[]
}

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"]

const profileToUser = (p: ProfileRow): PublicUser => ({
  id: p.id,
  email: p.email,
  name: p.name,
  role: p.role,
  avatar: p.avatar ?? undefined,
  phone: p.phone ?? undefined,
  address: p.address ?? undefined,
  shopName: p.shop_name ?? undefined,
  permissions: p.permissions ?? undefined,
})

type Result<T> = { success: true; user: T } | { success: false; message: string }

type AuthState = {
  isAuthenticated: boolean
  user: PublicUser | null
  hydrated: boolean

  /** Gọi 1 lần ở root layout */
  init: () => Promise<void>

  login: (email: string, password: string) => Promise<Result<PublicUser>>
  logout: () => Promise<void>
  register: (input: {
    email: string
    password: string
    name: string
    role?: UserRole
    shopName?: string
    phone?: string
  }) => Promise<Result<PublicUser>>
  updateProfile: (patch: {
    name?: string
    phone?: string
    address?: string
    shopName?: string
  }) => Promise<{ success: boolean; message?: string }>
  changePassword: (newPassword: string) => Promise<{ success: boolean; message?: string }>
}

let unsubscribe: (() => void) | null = null

export const useAuthStore = create<AuthState>()((set, get) => ({
  isAuthenticated: false,
  user: null,
  hydrated: false,

  init: async () => {
    if (get().hydrated) return
    const supabase = getSupabase()

    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single()
      if (profile) {
        set({ isAuthenticated: true, user: profileToUser(profile) })
      }
    }
    set({ hydrated: true })

    // Subscribe cho logout/refresh giữa các tab
    if (!unsubscribe) {
      const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          set({ isAuthenticated: false, user: null })
          return
        }
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()
          if (profile) set({ isAuthenticated: true, user: profileToUser(profile) })
        }
      })
      unsubscribe = () => sub.subscription.unsubscribe()
    }
  },

  login: async (email, password) => {
    const supabase = getSupabase()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    if (error || !data.user) {
      return { success: false, message: "Email hoặc mật khẩu không đúng." }
    }
    const { data: profile } = await supabase
      .from("profiles").select("*").eq("id", data.user.id).single()
    if (!profile) return { success: false, message: "Không tìm thấy hồ sơ." }
    const u = profileToUser(profile)
    set({ isAuthenticated: true, user: u })
    return { success: true, user: u }
  },

  logout: async () => {
    await getSupabase().auth.signOut()
    set({ isAuthenticated: false, user: null })
  },

  register: async ({ email, password, name, role = "user", shopName, phone }) => {
    if (!email || !password || !name) {
      return { success: false, message: "Vui lòng điền đầy đủ thông tin." }
    }
    const supabase = getSupabase()
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { name, role, shop_name: shopName, phone },
      },
    })
    if (error || !data.user) {
      const msg = error?.message?.includes("already")
        ? "Email này đã được đăng ký."
        : error?.message ?? "Đăng ký thất bại."
      return { success: false, message: msg }
    }

    const { data: profile } = await supabase
      .from("profiles").select("*").eq("id", data.user.id).single()
    if (!profile) {
      return { success: false, message: "Tạo hồ sơ thất bại, vui lòng thử lại." }
    }
    const u = profileToUser(profile)
    set({ isAuthenticated: true, user: u })
    return { success: true, user: u }
  },

  updateProfile: async (patch) => {
    const id = get().user?.id
    if (!id) return { success: false, message: "Chưa đăng nhập." }
    const supabase = getSupabase()
    const dbPatch: Database["public"]["Tables"]["profiles"]["Update"] = {
      ...(patch.name      !== undefined && { name: patch.name }),
      ...(patch.phone     !== undefined && { phone: patch.phone }),
      ...(patch.address   !== undefined && { address: patch.address }),
      ...(patch.shopName  !== undefined && { shop_name: patch.shopName }),
    }
    const { data, error } = await supabase
      .from("profiles")
      .update(dbPatch as never)
      .eq("id", id)
      .select("*")
      .single()
    if (error || !data) return { success: false, message: error?.message ?? "Cập nhật thất bại." }
    set({ user: profileToUser(data) })
    return { success: true }
  },

  changePassword: async (newPassword) => {
    const { error } = await getSupabase().auth.updateUser({ password: newPassword })
    if (error) return { success: false, message: error.message }
    return { success: true }
  },
}))

export const ROLE_LABEL: Record<UserRole, string> = {
  user:     "Khách hàng",
  admin:    "Quản trị viên",
  supplier: "Nhà cung cấp",
}

