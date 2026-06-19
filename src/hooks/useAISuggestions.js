/**
 * Hook to fetch AI icebreakers for a given match id. Caches per matchId
 * for the lifetime of the hook.
 */

import { useCallback, useEffect, useState } from 'react'
import { aiSuggestionsService } from '../api'

export function useAISuggestions(matchId) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasFetched, setHasFetched] = useState(false)

  const fetch = useCallback(async ({ force = false } = {}) => {
    if (!matchId) return []
    if (hasFetched && !force) return suggestions
    setLoading(true)
    try {
      const res = await aiSuggestionsService.icebreakers(matchId)
      const list = Array.isArray(res?.suggestions) ? res.suggestions
        : Array.isArray(res) ? res
        : []
      setSuggestions(list)
      setError(null)
      setHasFetched(true)
      return list
    } catch (err) {
      setError(err)
      return []
    } finally {
      setLoading(false)
    }
  }, [matchId, hasFetched, suggestions])

  useEffect(() => { fetch() }, [fetch])

  return { suggestions, loading, error, refetch: () => fetch({ force: true }) }
}
