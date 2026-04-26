"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type UserRole = "user" | "admin" | "supplier"

export type AuthUser = {
  id: string
  email: string
  password: string
  name: string
  role: UserRole
  avatar?: string
  phone?: string
  address?: string
  // role-specific
  shopName?: string // supplier
  permissions?: string[] // admin
}

// ───────── Mock users (3 arrays) ─────────

export const MOCK_USERS: AuthUser[] = [
  {
    id: "u-001",
    email: "user1@styleloop.vn",
    password: "user123",
    name: "Linh Nguyễn",
    role: "user",
    phone: "0901234567",
    address: "12 Lê Lợi, Q.1, TP.HCM",
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
    avatar:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop&crop=faces",
  },
]

export const ALL_MOCK_ACCOUNTS: AuthUser[] = [
  ...MOCK_USERS,
  ...MOCK_ADMINS,
  ...MOCK_SUPPLIERS,
]

// ───────── Store ─────────

type PublicUser = Omit<AuthUser, "password">

type AuthState = {
  isAuthenticated: boolean
  user: PublicUser | null
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
      user: null,

      login: (email, password) => {
        const normalized = email.trim().toLowerCase()
        const found = ALL_MOCK_ACCOUNTS.find(
          (u) => u.email.toLowerCase() === normalized && u.password === password
        )
        if (!found) {
          return {
            success: false,
            message: "Email hoặc mật khẩu không đúng.",
          }
        }
        const publicUser = stripPassword(found)
        set({ isAuthenticated: true, user: publicUser })
        return { success: true, user: publicUser }
      },

      logout: () => set({ isAuthenticated: false, user: null }),

      register: ({ email, password, name, role = "user", shopName }) => {
        const normalized = email.trim().toLowerCase()
        if (!email || !password || !name) {
          return { success: false, message: "Vui lòng điền đầy đủ thông tin." }
        }
        if (
          ALL_MOCK_ACCOUNTS.some((u) => u.email.toLowerCase() === normalized)
        ) {
          return { success: false, message: "Email này đã được đăng ký." }
        }
        const newUser: AuthUser = {
          id: `${role[0]}-${Date.now()}`,
          email: normalized,
          password,
          name,
          role,
          shopName: role === "supplier" ? shopName : undefined,
        }
        // push into the in-memory mock array so the user can log in again
        if (role === "admin") MOCK_ADMINS.push(newUser)
        else if (role === "supplier") MOCK_SUPPLIERS.push(newUser)
        else MOCK_USERS.push(newUser)
        ALL_MOCK_ACCOUNTS.push(newUser)

        const publicUser = stripPassword(newUser)
        set({ isAuthenticated: true, user: publicUser })
        // ensure no stale state
        void get
        return { success: true, user: publicUser }
      },
    }),
    {
      name: "styleloop-auth",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
)

export const ROLE_LABEL: Record<UserRole, string> = {
  user: "Khách hàng",
  admin: "Quản trị viên",
  supplier: "Nhà cung cấp",
}
