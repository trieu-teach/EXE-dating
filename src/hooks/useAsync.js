import { useCallback, useEffect, useRef, useState } from 'react'
import { normalizeError } from '../api/errors.js'

/**
 * Hook chuẩn cho mọi trang gọi API
 * @template T
 * @param {() => Promise<T>} fetcher
 * @param {unknown[]} [deps]
 * @param {{ immediate?: boolean }} [options]
 */
export function useAsync(fetcher, deps = [], options = {}) {
  const { immediate = true } = options
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetcherRef.current()
      setData(result)
      return result
    } catch (err) {
      const normalized = normalizeError(err)
      setError(normalized)
      throw normalized
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!immediate) return undefined
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await fetcherRef.current()
        if (!cancelled) setData(result)
      } catch (err) {
        if (!cancelled) setError(normalizeError(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, error, loading, refetch: execute, setData }
}
