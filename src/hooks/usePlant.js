import { useCallback, useEffect, useState } from 'react'
import { plantsService } from '../api'
import { useInventory } from '../context/InventoryContext.jsx'

/**
 * Hook for a single match's love tree.
 *
 *   const { plant, loading, watering, error, water, refresh, lastResult } = usePlant(matchId)
 *
 * - `water(material)` POSTs /api/plants/{matchId}/water, then **always
 *   re-fetches** GET /api/plants/{matchId} so we display the authoritative
 *   state.
 *
 * - The WaterResultDto from the backend is **partial** (level, growthPercent,
 *   streakCount, leveledUp, bonusApplied, milestoneReached, message) — it
 *   does NOT include the streak / iWateredToday / bothWateredToday flags.
 *   We need a fresh PlantDto to update the whole UI consistently.
 *
 * - We optimistically update the growth bar from the WaterResultDto **first**
 *   (so the user sees an instant +5/+12/+25% feedback), then overwrite with
 *   the authoritative PlantDto. This avoids the "bar doesn't move" issue
 *   when the backend response and the refetched plant happen to be in
 *   different render cycles.
 *
 * - We also call `useInventory().refresh()` and `decrement()` so the stock
 *   numbers in the buttons stay in sync across the app.
 */
export function usePlant(matchId) {
  const { refresh: refreshInventory, decrement } = useInventory()
  const [plant, setPlant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [watering, setWatering] = useState(false)
  const [error, setError] = useState(null)
  const [lastResult, setLastResult] = useState(null)

  console.log('[usePlant] render', { matchId, watering, loading, plant })

  const normalise = useCallback((raw) => {
    if (!raw) return null
    const xp = Number(raw.xp ?? 0)
    const gp = Number(raw.growthPercent ?? raw.growth ?? raw.progress ?? xp)
    const ppl = Number(raw.percentPerLevel ?? raw.maxGrowthPercent ?? raw.xpForNextLevel ?? 100)
    return {
      ...raw,
      level: Number(raw.level ?? 1),
      growthPercent: Math.max(0, Math.min(100, gp)),
      percentPerLevel: Math.max(1, ppl),
      streakCount: Number(raw.streakCount ?? 0),
      iWateredToday: Boolean(raw.iWateredToday),
      bothWateredToday: Boolean(raw.bothWateredToday),
    }
  }, [])

  const refresh = useCallback(async () => {
    if (!matchId) {
      setPlant(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const p = await plantsService.get(matchId)
      const next = normalise(p)
      setPlant(next)
      if (import.meta.env.DEV) {
         
        console.log('[usePlant] refresh plantDto →', next)
      }
    } catch (err) {
      setError(err?.message || 'Không tải được cây.')
      setPlant(null)
    } finally {
      setLoading(false)
    }
  }, [matchId, normalise])

  useEffect(() => { refresh() }, [refresh])

  const water = useCallback(async (material) => {
    console.log('[usePlant] water() called', { matchId, material })
    if (!matchId) {
      console.warn('[usePlant] water() aborted: no matchId')
      return null
    }
    setWatering(true)
    setError(null)
    try {
      // Optimistic local decrement so the button label updates instantly.
      decrement(material)

      console.log('[usePlant] POST /api/plants/' + matchId + '/water', { material })
      const res = await plantsService.water(matchId, { material })
      console.log('[usePlant] water() response →', res)
      setLastResult(res || null)

      // Apply the WaterResultDto immediately so the growth bar jumps even
      // if the network refetch below is slow.
      if (res && typeof res === 'object') {
        setPlant((cur) => {
          if (!cur) return cur
          const next = { ...cur }
          if (typeof res.level === 'number') next.level = res.level
          if (typeof res.growthPercent === 'number') {
            next.growthPercent = res.growthPercent
          }
          if (typeof res.streakCount === 'number') next.streakCount = res.streakCount
          return next
        })
      }

      // Then re-fetch the authoritative PlantDto so the streak flags and
      // other fields are up to date.
      try {
        const fresh = await plantsService.get(matchId)
        const normalised = normalise(fresh)
        console.log('[usePlant] refetch /api/plants/' + matchId, normalised)
        setPlant(normalised)
      } catch (err) {
        console.warn('[usePlant] refetch failed →', err)
      }

      // Sync inventory from server (authoritative stock count).
      refreshInventory()
      return res
    } catch (err) {
      console.error('[usePlant] water() failed →', err)
      setError(err?.message || 'Không tưới được cây.')
      // Roll back the optimistic decrement on failure.
      refreshInventory()
      throw err
    } finally {
      setWatering(false)
    }
  }, [matchId, decrement, normalise, refreshInventory])

  return { plant, loading, watering, error, lastResult, water, refresh }
}