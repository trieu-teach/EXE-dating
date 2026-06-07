import { useCallback, useState } from 'react'
import { normalizeError } from '../api/errors.js'

/**
 * Hook cho form / hành động POST PUT
 * @template T, A
 * @param {(args: A) => Promise<T>} mutator
 */
export function useMutation(mutator) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const mutate = useCallback(
    async (args) => {
      setLoading(true)
      setError(null)
      try {
        const result = await mutator(args)
        setData(result)
        return result
      } catch (err) {
        const normalized = normalizeError(err)
        setError(normalized)
        throw normalized
      } finally {
        setLoading(false)
      }
    },
    [mutator],
  )

  return { mutate, data, error, loading, reset: () => setError(null) }
}
