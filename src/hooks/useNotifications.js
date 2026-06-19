/**
 * Polling hook for notifications. Returns unread count, items, and helpers
 * to mark-read. Polling interval is configurable; pass 0 to disable.
 */

import { useCallback, useEffect, useState } from 'react'
import { notificationsService } from '../api'

const DEFAULT_POLL_MS = 30_000

export function useNotifications({ pollIntervalMs = DEFAULT_POLL_MS } = {}) {
  const [items, setItems] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      const res = await notificationsService.getAll({ limit: 30 })
      const list = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : []
      setItems(list)
      setUnreadCount(
        typeof res?.unreadCount === 'number'
          ? res.unreadCount
          : list.filter((n) => !n.isRead && !n.isRead).length,
      )
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    if (!pollIntervalMs) return undefined
    const id = setInterval(load, pollIntervalMs)
    return () => clearInterval(id)
  }, [load, pollIntervalMs])

  const markRead = useCallback(async (ids) => {
    await notificationsService.markRead(ids)
    await load()
  }, [load])

  return { items, unreadCount, loading, error, refetch: load, markRead }
}
