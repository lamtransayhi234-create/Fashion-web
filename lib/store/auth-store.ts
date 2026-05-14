"use client"

import { create } from "zustand"

import { getSupabase } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"
import type {
  Product,
  ProductCategory,
  ProductSize,
  ProductStatus,
  ProductType,
} from "@/lib/data/products"

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
type OrderRow   = Database["public"]["Tables"]["orders"]["Row"]
type ProductRow = Database["public"]["Tables"]["products"]["Row"]

const rowToOrder = (r: OrderRow): Order => ({
  id: r.id,
  userId: r.user_id,
  providerId: r.provider_id,
  productId: r.product_id,
  productName: r.product_name,
  productSrc: r.product_src,
  productType: r.product_type,
  size: r.size,
  color: r.color ?? "",
  fromDate: r.from_date,
  toDate: r.to_date,
  nights: r.nights,
  rentalPricePerDay: Number(r.rental_price_per_day),
  total: Number(r.total),
  deposit: Number(r.deposit),
  address: r.address,
  phone: r.phone,
  paymentMethod: r.payment_method,
  paymentMethodLabel: r.payment_method_label,
  note: r.note ?? "",
  status: r.status,
  createdAt: r.created_at,
})

const rowToProduct = (r: ProductRow): Product => ({
  id: r.id,
  src: r.src,
  name: r.name,
  brandPrice: Number(r.brand_price),
  rentalPrice: Number(r.rental_price),
  status: r.status as ProductStatus,
  description: r.description ?? "",
  category: r.category as ProductCategory,
  type: r.type as ProductType,
  sizes: r.sizes as ProductSize[],
  color: r.color ?? "",
  tags: r.tags ?? [],
  rating: (r.rating ?? 5) as 4 | 5,
  providerId: r.provider_id,
})

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
        await get().refetchUserData()
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
    await get().refetchUserData()
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

  refetchUserData: async () => {
    const u = get().user
    if (!u) {
      set({ orders: [], whitelist: [] })
      return
    }
    const supabase = getSupabase()

    // Orders: user thấy của mình; supplier thấy của shop; admin thấy hết (do RLS)
    let orderQuery = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
    if (u.role === "user") orderQuery = orderQuery.eq("user_id", u.id)
    else if (u.role === "supplier") orderQuery = orderQuery.eq("provider_id", u.id)
    const { data: orderRows } = await orderQuery

    // Whitelist với product join
    const { data: whitelistRows } = await supabase
      .from("whitelist")
      .select("product:products(*)")
      .eq("user_id", u.id)

    type WhitelistJoin = { product: ProductRow | null }

    set({
      orders: (orderRows ?? []).map(rowToOrder),
      whitelist: ((whitelistRows ?? []) as WhitelistJoin[])
        .map((w) => w.product)
        .filter((p): p is ProductRow => p !== null)
        .map(rowToProduct),
    })
  },

  addOrder: async (orderData) => {
    const u = get().user
    if (!u) throw new Error("Chưa đăng nhập")
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: u.id,
        provider_id: orderData.providerId,
        product_id: orderData.productId,
        product_name: orderData.productName,
        product_src: orderData.productSrc,
        product_type: orderData.productType,
        size: orderData.size,
        color: orderData.color,
        from_date: orderData.fromDate,
        to_date: orderData.toDate,
        nights: orderData.nights,
        rental_price_per_day: orderData.rentalPricePerDay,
        total: orderData.total,
        deposit: orderData.deposit,
        address: orderData.address,
        phone: orderData.phone,
        payment_method: orderData.paymentMethod,
        payment_method_label: orderData.paymentMethodLabel,
        note: orderData.note,
        status: orderData.status ?? "pending",
      } as never)
      .select("*")
      .single()
    if (error || !data) throw error ?? new Error("Insert order failed")
    await get().refetchUserData()
    return rowToOrder(data as OrderRow)
  },

  updateOrderStatus: async (orderId, status) => {
    const { error } = await getSupabase()
      .from("orders")
      .update({ status } as never)
      .eq("id", orderId)
    if (error) throw error
    await get().refetchUserData()
  },

  confirmOrder: async (orderId) => {
    await get().updateOrderStatus(orderId, "confirmed")
  },

  toggleWhitelist: async (product) => {
    const u = get().user
    if (!u) throw new Error("Chưa đăng nhập")
    const supabase = getSupabase()
    const isLiked = get().whitelist.some((w) => w.id === product.id)
    if (isLiked) {
      await supabase.from("whitelist").delete().eq("user_id", u.id).eq("product_id", product.id)
    } else {
      await supabase
        .from("whitelist")
        .insert({ user_id: u.id, product_id: product.id } as never)
    }
    await get().refetchUserData()
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
