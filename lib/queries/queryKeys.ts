/**
 * Central query key factory cho TanStack Query.
 * Mọi useQuery / invalidateQueries dùng key từ đây để consistent.
 */

export const queryKeys = {
  products: {
    all: ["products"] as const,
    list: () => [...queryKeys.products.all, "list"] as const,
    detail: (id: string) => [...queryKeys.products.all, "detail", id] as const,
  },
  submissions: {
    all: ["submissions"] as const,
    list: (userId: string) =>
      [...queryKeys.submissions.all, "list", userId] as const,
  },
  orders: {
    all: ["orders"] as const,
    list: (scope: "mine" | "shop" | "all", userId: string) =>
      [...queryKeys.orders.all, "list", scope, userId] as const,
  },
  whitelist: {
    all: ["whitelist"] as const,
    list: (userId: string) => [...queryKeys.whitelist.all, "list", userId] as const,
  },
  providers: {
    all: ["providers"] as const,
    list: () => [...queryKeys.providers.all, "list"] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    supplier: (userId: string) =>
      [...queryKeys.notifications.all, "supplier", userId] as const,
    userOrders: (userId: string) =>
      [...queryKeys.notifications.all, "userOrders", userId] as const,
  },
  users: {
    all: ["users"] as const,
    list: () => [...queryKeys.users.all, "list"] as const,
  },
} as const
