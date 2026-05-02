"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type UserRole = "user" | "admin" | "supplier"

// ─── Order type ───────────────────────────────────────────────────────────────

export type OrderStatus = "pending" | "confirmed" | "completed" | "cancelled"

export type Order = {
  id: string
  userId: string
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
  // role-specific
  shopName?: string   // supplier
  permissions?: string[] // admin
}

// ─── Mock users ───────────────────────────────────────────────────────────────

export const MOCK_USERS: AuthUser[] = [
  {
    id: "u-001",
    email: "user1@styleloop.vn",
    password: "user123",
    name: "Linh Nguyễn",
    role: "user",
    phone: "0901234567",
    address: "12 Lê Lợi, Q.1, TP.HCM",
    orders: [],
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces",
  },
  {
    id: "u-002",
    email: "user2@styleloop.vn",
    password: "user123",
    name: "Trang Phạm",
    role: "user",
    phone: "0902345678",
    address: "45 Nguyễn Huệ, Q.1, TP.HCM",
    orders: [],
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces",
  },
  {
    id: "u-003",
    email: "user3@styleloop.vn",
    password: "user123",
    name: "Mai Trần",
    role: "user",
    phone: "0903456789",
    address: "88 Hai Bà Trưng, Q.3, TP.HCM",
    orders: [],
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces",
  },
]

export const MOCK_ADMINS: AuthUser[] = [
  {
    id: "a-001",
    email: "admin@styleloop.vn",
    password: "admin123",
    name: "Vincent Lê",
    role: "admin",
    phone: "0911111111",
    permissions: ["users.manage", "orders.manage", "products.manage", "reports.view"],
    orders: [],
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces",
  },
  {
    id: "a-002",
    email: "admin2@styleloop.vn",
    password: "admin123",
    name: "Hà Đặng",
    role: "admin",
    phone: "0922222222",
    permissions: ["users.manage", "reports.view"],
    orders: [],
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces",
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
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
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
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=faces",
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
    avatar:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop&crop=faces",
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
  }) => { success: true; user: PublicUser } | { success: false; message: string }
  addOrder: (order: Omit<Order, "id" | "createdAt" | "userId">) => Order
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

      register: ({ email, password, name, role = "user", shopName }) => {
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
          shopName: role === "supplier" ? shopName : undefined,
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
    }),
    {
      name: "styleloop-auth",
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
