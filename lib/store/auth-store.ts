"use client"

import { create } from "zustand"

import { getSupabase } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"
import type { Product } from "@/lib/data/products"

export type UserRole = "user" | "admin" | "supplier"

// ─── Order type ───────────────────────────────────────────────────────────────

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
  hydrated: boolean       // thay cho persist.hasHydrated cũ

  /** Danh sách orders/whitelist của user hiện tại — fetched lazily ở Phase 6 */
  orders: Order[]
  whitelist: Product[]
  /** All users — chỉ admin fetch được; default empty cho các page cũ */
  users: PublicUser[]

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

  // Stubs — wired to Supabase ở Phase 6 (Task 17/18/19)
  addOrder: (order: Omit<Order, "id" | "createdAt" | "userId">) => Promise<Order>
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>
  confirmOrder: (orderId: string) => Promise<void>
  toggleWhitelist: (product: Product) => Promise<void>
  refetchUserData: () => Promise<void>
}

let unsubscribe: (() => void) | null = null

const _useAuthStore = create<AuthState>()((set, get) => ({
  isAuthenticated: false,
  user: null,
  hydrated: false,
  orders: [],
  whitelist: [],
  users: [],

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
          set({ isAuthenticated: false, user: null, orders: [], whitelist: [] })
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
    set({ isAuthenticated: false, user: null, orders: [], whitelist: [] })
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

  // ─── Stubs (Phase 6 sẽ wire vào Supabase) ──────────────────────────────────
  addOrder: async () => {
    throw new Error("addOrder chưa wired — sẽ implement ở Task 17/18")
  },
  updateOrderStatus: async () => {
    throw new Error("updateOrderStatus chưa wired — sẽ implement ở Task 17")
  },
  confirmOrder: async () => {
    throw new Error("confirmOrder chưa wired — sẽ implement ở Task 17")
  },
  toggleWhitelist: async () => {
    throw new Error("toggleWhitelist chưa wired — sẽ implement ở Task 17/19")
  },
  refetchUserData: async () => {
    /* no-op, sẽ implement ở Task 17 */
  },
}))

export const ROLE_LABEL: Record<UserRole, string> = {
  user:     "Khách hàng",
  admin:    "Quản trị viên",
  supplier: "Nhà cung cấp",
}

// Backwards-compat shim: cho `useAuthStore.persist.hasHydrated()` trong các page chưa migrate xong.
// Sẽ remove ở Task 23 sau khi đổi tất cả consumer sang `(s) => s.hydrated`.
type PersistShim = {
  hasHydrated: () => boolean
  onFinishHydration: (cb: () => void) => () => void
}
const persistShim: PersistShim = {
  hasHydrated: () => _useAuthStore.getState().hydrated,
  onFinishHydration: (cb) =>
    _useAuthStore.subscribe((s, prev) => {
      if (!prev.hydrated && s.hydrated) cb()
    }),
}
;(_useAuthStore as unknown as { persist: PersistShim }).persist = persistShim

export const useAuthStore = _useAuthStore as typeof _useAuthStore & { persist: PersistShim }
