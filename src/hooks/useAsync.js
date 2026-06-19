/**
 * Generic async-resource hook. Given an async loader and a deps array,
 * returns `{ data, loading, error, reload, setData }`.
 *
 * The `loader` is captured into a memoised callback. We intentionally
 * disable the exhaustive-deps lint for `useCallback` here because the
 * caller passes a plain array — the rule expects an inline literal in
 * older versions of the plugin, but accepts a variable too.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

export function useAsync(loader, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const cancelled = useRef(false)
  const memoLoader = useCallback(loader, deps) // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/use-memo

  const reload = useCallback(async (...args) => {
    cancelled.current = false
    setLoading(true)
    try {
      const res = await memoLoader(...args)
      if (!cancelled.current) {
        setData(res)
        setError(null)
      }
      return res
    } catch (err) {
      if (!cancelled.current) setError(err)
      throw err
    } finally {
      if (!cancelled.current) setLoading(false)
    }
  }, [memoLoader])

  useEffect(() => {
    cancelled.current = false
    let active = true
    setLoading(true)
    memoLoader()
      .then((res) => { if (active) { setData(res); setError(null) } })
      .catch((err) => { if (active) setError(err) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false; cancelled.current = true }
  }, [memoLoader])

  return { data, loading, error, reload, setData }
}
