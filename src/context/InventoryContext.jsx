import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { gamificationService } from '../api'
import { MATERIALS } from '../constants/gamification.js'

/**
 * Shared inventory state for the entire user session.
 *
 * Multiple pages (Tasks, LoveTree, possibly Premium) all need to know how
 * many Water/Sun/Fertilizer the user has. Without a context each page would
 * load its own copy → if you water a plant on the LoveTree page then jump to
 * the Tasks page, the stock shown there would be stale until a manual
 * refresh.
 *
 * Usage:
 *   const { inventory, refresh, loading } = useInventory()
 *
 * Call `refresh()` after any action that changes the inventory
 * (watering a plant, claiming a task reward, etc.).
 */
const InventoryContext = createContext(null)

function normalize(list) {
  const next = { Water: 0, Sun: 0, Fertilizer: 0 }
  for (const item of (list || [])) {
    if (MATERIALS.includes(item.material)) {
      next[item.material] = Number(item.quantity ?? 0)
    }
  }
  return next
}

export function InventoryProvider({ children }) {
  const [inventory, setInventory] = useState({ Water: 0, Sun: 0, Fertilizer: 0 })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async (mode = 'silent') => {
    if (mode === 'initial') setLoading(true)
    if (mode === 'visible') setRefreshing(true)
    setError(null)
    try {
      const inv = await gamificationService.inventory()
      const list = Array.isArray(inv) ? inv : (inv?.items ?? [])
      setInventory(normalize(list))
    } catch (err) {
      setError(err?.message || 'Không tải được kho nguyên liệu.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Initial load.
  useEffect(() => { refresh('initial') }, [refresh])

  // Refresh when the tab becomes visible again (e.g. user comes back from
  // another page that may have changed the stock).
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh('visible')
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [refresh])

  // Optimistic local update — call this after watering to subtract 1
  // instantly without waiting for the API round-trip.
  const decrement = useCallback((material) => {
    setInventory((cur) => ({
      ...cur,
      [material]: Math.max(0, Number(cur[material] ?? 0) - 1),
    }))
  }, [])

  const value = useMemo(() => ({
    inventory,
    loading,
    refreshing,
    error,
    refresh,
    decrement,
  }), [inventory, loading, refreshing, error, refresh, decrement])

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
}

export function useInventory() {
  const ctx = useContext(InventoryContext)
  if (!ctx) {
    // Safe fallback if used outside the provider (e.g. in a test) — return
    // a no-op default so the page doesn't crash.
    return {
      inventory: { Water: 0, Sun: 0, Fertilizer: 0 },
      loading: false,
      refreshing: false,
      error: null,
      refresh: async () => {},
      decrement: () => {},
    }
  }
  return ctx
}