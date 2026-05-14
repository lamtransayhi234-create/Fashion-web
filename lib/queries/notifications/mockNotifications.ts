"use client"

import { useEffect, useState } from "react"

import type { SupplierNotification } from "./types"

/**
 * MOCK — hardcoded sample notifications for UI preview.
 * Sẽ thay bằng useGetSupplierNotifications (Task N.4) ở Task N.7.
 *
 * 6 entries: 3 approved + 3 rejected (mixed reject reasons), varying timestamps.
 * `reviewedAt` được compute relative to "now" để text "X giờ trước" làm việc đúng.
 */
function buildMock(): SupplierNotification[] {
  const now = Date.now()
  const min = 60_000
  const hour = 60 * min
  const day = 24 * hour
  return [
    {
      id: "mock-1",
      type: "approved",
      productName: "Đầm cami hai dây satin kem",
      productSrc:
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80",
      reviewedAt: new Date(now - 3 * min).toISOString(),
    },
    {
      id: "mock-2",
      type: "rejected",
      productName: "Áo blazer tweed cổ điển",
      productSrc:
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80",
      rejectReason: "Ảnh chất lượng thấp, vui lòng chụp rõ nét hơn dưới ánh sáng tự nhiên.",
      reviewedAt: new Date(now - 2 * hour).toISOString(),
    },
    {
      id: "mock-3",
      type: "approved",
      productName: "Set lụa hoa nhí pastel",
      productSrc:
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80",
      reviewedAt: new Date(now - 1 * day).toISOString(),
    },
    {
      id: "mock-4",
      type: "rejected",
      productName: "Túi xách da nâu vintage",
      productSrc:
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80",
      rejectReason: "Thông tin sản phẩm chưa đầy đủ — thiếu mô tả chất liệu.",
      reviewedAt: new Date(now - 3 * day).toISOString(),
    },
    {
      id: "mock-5",
      type: "approved",
      productName: "Giày cao gót mũi nhọn đen",
      productSrc:
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80",
      reviewedAt: new Date(now - 5 * day).toISOString(),
    },
    {
      id: "mock-6",
      type: "rejected",
      productName: "Mũ rộng vành cói",
      productSrc:
        "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400&q=80",
      rejectReason: "Sản phẩm trùng với đăng ký trước đó — vui lòng kiểm tra lại.",
      reviewedAt: new Date(now - 7 * day).toISOString(),
    },
  ]
}

/**
 * Drop-in replacement cho useGetSupplierNotifications (real hook).
 * Return shape: { data, isLoading } khớp với React Query API → swap dễ.
 */
export function useMockSupplierNotifications() {
  const [data, setData] = useState<SupplierNotification[]>([])

  useEffect(() => {
    // Compute relative timestamps mỗi lần mount để "vài giây trước" luôn fresh
    setData(buildMock())
  }, [])

  return { data, isLoading: false as const }
}
