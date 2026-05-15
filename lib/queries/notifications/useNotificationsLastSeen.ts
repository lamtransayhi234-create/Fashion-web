"use client"

import { useCallback, useEffect, useState } from "react"

import { useAuthStore } from "@/lib/store/auth-store"

const KEY_PREFIX = "styleloop-notif-seen-"
const LEGACY_SUPPLIER_PREFIX = "styleloop-supplier-notif-seen-"

export type NotificationScope = "supplier" | "user"

/**
 * localStorage-backed "last seen" timestamp per (scope, user).
 * Notification được coi là unread khi timestamp > lastSeen.
 *
 * Scope cho phép phân tách bell của supplier (admin duyệt sản phẩm) và
 * user (supplier đổi trạng thái đơn) — 2 bell không can thiệp nhau.
 *
 * Legacy: nếu chưa có key mới mà có key cũ "styleloop-supplier-notif-seen-{uid}",
 * tự migrate sang key mới (scope=supplier) — tránh reset cosmetic.
 */
export function useNotificationsLastSeen(scope: NotificationScope) {
  const user = useAuthStore((s) => s.user)
  const [lastSeen, setLastSeen] = useState<number>(0)

  useEffect(() => {
    if (!user) {
      setLastSeen(0)
      return
    }
    const key = KEY_PREFIX + scope + "-" + user.id
    let stored = window.localStorage.getItem(key)

    if (!stored && scope === "supplier") {
      const legacy = window.localStorage.getItem(LEGACY_SUPPLIER_PREFIX + user.id)
      if (legacy) {
        window.localStorage.setItem(key, legacy)
        stored = legacy
      }
    }

    setLastSeen(stored ? Date.parse(stored) : 0)
  }, [user, scope])

  const markAllSeen = useCallback(() => {
    if (!user) return
    const now = new Date().toISOString()
    window.localStorage.setItem(KEY_PREFIX + scope + "-" + user.id, now)
    setLastSeen(Date.parse(now))
  }, [user, scope])

  const isUnread = useCallback(
    (timestamp: string) => Date.parse(timestamp) > lastSeen,
    [lastSeen],
  )

  return { lastSeen, markAllSeen, isUnread }
}
