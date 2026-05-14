"use client"

import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { AuthInit } from "@/components/auth-init"

export function Providers({ children }: { children: React.ReactNode }) {
  // Tạo client 1 lần per browser session (tránh share cross-request trên SSR)
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,          // 30s — data tươi
            gcTime: 5 * 60 * 1000,         // 5 min — cache giữ trong memory
            refetchOnWindowFocus: false,   // không tự refetch khi tab focus lại
            retry: 1,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={client}>
      <AuthInit>{children}</AuthInit>
    </QueryClientProvider>
  )
}
