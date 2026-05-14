"use client"

import { useCallback, useEffect, useState } from "react"

import { useAuthStore } from "@/lib/store/auth-store"

const KEY_PREFIX = "styleloop-supplier-notif-seen-"

/**
 * localStorage-backed "last seen" timestamp per user.
 * Notification được coi là unread khi reviewedAt > lastSeen.
 */
export function useNotificationsLastSeen() {
  const user = useAuthStore((s) => s.user)
  const [lastSeen, setLastSeen] = useState<number>(0)

  useEffect(() => {
    if (!user) {
      setLastSeen(0)
      return
    }
    const stored = window.localStorage.getItem(KEY_PREFIX + user.id)
    setLastSeen(stored ? Date.parse(stored) : 0)
  }, [user])

  const markAllSeen = useCallback(() => {
    if (!user) return
    const now = new Date().toISOString()
    window.localStorage.setItem(KEY_PREFIX + user.id, now)
    setLastSeen(Date.parse(now))
  }, [user])

  const isUnread = useCallback(
    (reviewedAt: string) => Date.parse(reviewedAt) > lastSeen,
    [lastSeen],
  )

  return { lastSeen, markAllSeen, isUnread }
}
