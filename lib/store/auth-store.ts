"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

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

export type AuthUser = {
  id: string
  email: string
  password: string
  name: string
  role: UserRole
  avatar?: string
  phone?: string
  address?: string
  orders: Order[]
  whitelist: Product[]
  // role-specific
  shopName?: string   // supplier
  permissions?: string[] // admin
}

// ─── Mock users ───────────────────────────────────────────────────────────────

// SVG data-URL avatars — no external dependency
const AVATAR_USER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e8dcc8'/%3E%3Ccircle cx='50' cy='36' r='20' fill='%23b8956a'/%3E%3Cellipse cx='50' cy='90' rx='32' ry='22' fill='%23b8956a'/%3E%3C/svg%3E"

const AVATAR_SUPPLIER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e8dcc8'/%3E%3Crect x='22' y='48' width='56' height='34' fill='%23b8956a'/%3E%3Cpolygon points='14,48 86,48 76,22 24,22' fill='%238b6f4e'/%3E%3Crect x='40' y='62' width='20' height='20' fill='%23e8dcc8'/%3E%3C/svg%3E"

const AVATAR_ADMIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%231c1917'/%3E%3Ctext x='50' y='68' font-size='52' font-weight='bold' text-anchor='middle' fill='%23f0e4d0' font-family='Georgia%2Cserif'%3EA%3C/text%3E%3C/svg%3E"

export const MOCK_USERS: AuthUser[] = [
  {
    id: "u-001",
    email: "user1@styleloop.vn",
    password: "user123",
    name: "Linh Nguyễn",
    role: "user",
    orders: [],
    whitelist: [],
    avatar: AVATAR_USER,
  },
  {
    id: "u-002",
    email: "user2@styleloop.vn",
    password: "user123",
    name: "Trang Phạm",
    role: "user",
    orders: [],
    whitelist: [],
    avatar: AVATAR_USER,
  },
  {
    id: "u-003",
    email: "user3@styleloop.vn",
    password: "user123",
    name: "Mai Trần",
    role: "user",
    orders: [],
    whitelist: [],
    avatar: AVATAR_USER,
  },
]

export const MOCK_ADMINS: AuthUser[] = [
  {
    id: "a-001",
    email: "admin@styleloop.vn",
    password: "admin123",
    name: "Vincent Lê",
    role: "admin",
    permissions: ["users.manage", "orders.manage", "products.manage", "reports.view"],
    orders: [],
    whitelist: [],
    avatar: AVATAR_ADMIN,
  },
]

export const MOCK_SUPPLIERS: AuthUser[] = [
  {
    id: "s-001",
    email: "supplier1@styleloop.vn",
    password: "supplier123",
    name: "Bảo Lê",
    role: "supplier",
    shopName: "Bảo Closet",
    phone: "0931111111",
    address: "120 Phan Xích Long, Q.Phú Nhuận, TP.HCM",
    orders: [],
    whitelist: [],
    avatar: AVATAR_SUPPLIER,
  },
  {
    id: "s-002",
    email: "supplier2@styleloop.vn",
    password: "supplier123",
    name: "Yến Vũ",
    role: "supplier",
    shopName: "Yến Vintage",
    phone: "0932222222",
    address: "55 Trần Hưng Đạo, Q.5, TP.HCM",
    orders: [],
    whitelist: [],
    avatar: AVATAR_SUPPLIER,
  },
  {
    id: "s-003",
    email: "supplier3@styleloop.vn",
    password: "supplier123",
    name: "Khoa Trịnh",
    role: "supplier",
    shopName: "Khoa Y2K Studio",
    phone: "0933333333",
    address: "9 Lý Tự Trọng, Q.1, TP.HCM",
    orders: [],
    whitelist: [],
    avatar: AVATAR_SUPPLIER,
  },
  {
    id: "s-004",
    email: "supplier4@styleloop.vn",
    password: "supplier123",
    name: "Lan Hoàng",
    role: "supplier",
    shopName: "GenZ Vibes",
    phone: "0934444444",
    address: "88 Xuân Thủy, Cầu Giấy, Hà Nội",
    orders: [],
    whitelist: [],
    avatar: AVATAR_SUPPLIER,
  },
  {
    id: "s-005",
    email: "supplier5@styleloop.vn",
    password: "supplier123",
    name: "Minh Linh",
    role: "supplier",
    shopName: "Linh's Fashion",
    phone: "0935555555",
    address: "22 Láng Hạ, Đống Đa, Hà Nội",
    orders: [],
    whitelist: [],
    avatar: AVATAR_SUPPLIER,
  },
]

export const ALL_MOCK_ACCOUNTS: AuthUser[] = [
  ...MOCK_USERS,
  ...MOCK_ADMINS,
  ...MOCK_SUPPLIERS,
]

// ─── Store ────────────────────────────────────────────────────────────────────

export type PublicUser = Omit<AuthUser, "password">

type AuthState = {
  isAuthenticated: boolean
  currentUserId: string | null
  /** Derived from users + currentUserId — not persisted */
  user: PublicUser | null
  /** Source of truth for all users and their orders — persisted */
  users: AuthUser[]
  login: (
    email: string,
    password: string
  ) => { success: true; user: PublicUser } | { success: false; message: string }
  logout: () => void
  register: (input: {
    email: string
    password: string
    name: string
    role?: UserRole
    shopName?: string
    phone?: string
  }) => { success: true; user: PublicUser } | { success: false; message: string }
  updateProfile: (patch: { name?: string; phone?: string; address?: string; password?: string; shopName?: string }) => void
  addOrder: (order: Omit<Order, "id" | "createdAt" | "userId">) => Order
  confirmOrder: (orderId: string) => void
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  toggleWhitelist: (product: Product) => void
}

const stripPassword = (u: AuthUser): PublicUser => {
  const { password: _pw, ...rest } = u
  void _pw
  return rest
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      currentUserId: null,
      user: null,
      users: ALL_MOCK_ACCOUNTS,

      login: (email, password) => {
        const { users } = get()
        const normalized = email.trim().toLowerCase()
        const found = users.find(
          (u) => u.email.toLowerCase() === normalized && u.password === password
        )
        if (!found) {
          return { success: false, message: "Email hoặc mật khẩu không đúng." }
        }
        const publicUser = stripPassword(found)
        set({ isAuthenticated: true, currentUserId: found.id, user: publicUser })
        return { success: true, user: publicUser }
      },

      logout: () => set({ isAuthenticated: false, currentUserId: null, user: null }),

      register: ({ email, password, name, role = "user", shopName, phone }) => {
        const normalized = email.trim().toLowerCase()
        if (!email || !password || !name) {
          return { success: false, message: "Vui lòng điền đầy đủ thông tin." }
        }
        const { users } = get()
        if (users.some((u) => u.email.toLowerCase() === normalized)) {
          return { success: false, message: "Email này đã được đăng ký." }
        }
        const newUser: AuthUser = {
          id: `${role[0]}-${Date.now()}`,
          email: normalized,
          password,
          name,
          role,
          orders: [],
          whitelist: [],
          shopName: role === "supplier" ? shopName : undefined,
          phone: role === "supplier" ? phone : undefined,
        }
        const publicUser = stripPassword(newUser)
        set((state) => ({
          users: [...state.users, newUser],
          isAuthenticated: true,
          currentUserId: newUser.id,
          user: publicUser,
        }))
        return { success: true, user: publicUser }
      },

      updateProfile: (patch) => {
        const userId = get().currentUserId
        if (!userId) return
        set((state) => {
          const updatedUsers = state.users.map((u) => {
            if (u.id !== userId) return u
            return {
              ...u,
              ...(patch.name !== undefined && { name: patch.name }),
              ...(patch.phone !== undefined && { phone: patch.phone }),
              ...(patch.address !== undefined && { address: patch.address }),
              ...(patch.password !== undefined && { password: patch.password }),
              ...(patch.shopName !== undefined && { shopName: patch.shopName }),
            }
          })
          const updatedRaw = updatedUsers.find((u) => u.id === userId)
          return {
            users: updatedUsers,
            user: updatedRaw ? stripPassword(updatedRaw) : state.user,
          }
        })
      },

      addOrder: (orderData) => {
        const userId = get().currentUserId ?? "unknown"
        const order: Order = {
          ...orderData,
          id: `ord-${Date.now()}`,
          userId,
          createdAt: new Date().toISOString(),
        }
        set((state) => {
          const updatedUsers = state.users.map((u) =>
            u.id === userId ? { ...u, orders: [order, ...u.orders] } : u
          )
          const updatedRaw = updatedUsers.find((u) => u.id === userId)
          return {
            users: updatedUsers,
            user: updatedRaw ? stripPassword(updatedRaw) : state.user,
          }
        })
        return order
      },

      confirmOrder: (orderId) => {
        get().updateOrderStatus(orderId, "confirmed")
      },

      updateOrderStatus: (orderId, status) => {
        set((state) => {
          const updatedUsers = state.users.map((u) => {
            const idx = u.orders.findIndex((o) => o.id === orderId)
            if (idx === -1) return u
            const updatedOrders = [...u.orders]
            updatedOrders[idx] = { ...updatedOrders[idx], status }
            return { ...u, orders: updatedOrders }
          })
          const currentRaw = updatedUsers.find((u) => u.id === state.currentUserId)
          return {
            users: updatedUsers,
            user: currentRaw ? stripPassword(currentRaw) : state.user,
          }
        })
      },

      toggleWhitelist: (product) => {
        const userId = get().currentUserId
        if (!userId) return
        set((state) => {
          const updatedUsers = state.users.map((u) => {
            if (u.id !== userId) return u
            const current = u.whitelist
            const isLiked = current.some((w) => w.id === product.id)
            const next = isLiked
              ? current.filter((w) => w.id !== product.id)
              : [...current, product]
            return { ...u, whitelist: next }
          })
          const updatedRaw = updatedUsers.find((u) => u.id === userId)
          return {
            users: updatedUsers,
            user: updatedRaw ? stripPassword(updatedRaw) : state.user,
          }
        })
      },
    }),
    {
      name: "styleloop-auth",
      version: 3,
      partialize: (state) => ({
        isAuthenticated:  state.isAuthenticated,
        currentUserId:    state.currentUserId,
        users:            state.users,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.currentUserId) {
          const found = state.users.find((u) => u.id === state.currentUserId)
          if (found) state.user = stripPassword(found)
        }
      },
    }
  )
)

export const ROLE_LABEL: Record<UserRole, string> = {
  user:     "Khách hàng",
  admin:    "Quản trị viên",
  supplier: "Nhà cung cấp",
}
