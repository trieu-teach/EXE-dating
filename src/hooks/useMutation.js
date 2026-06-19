/**
 * Small wrapper around useAsync to expose a `mutate` function that runs an
 * async operation and exposes loading/error state.
 */

import { useCallback, useState } from 'react'

export function useMutation(mutator) {
  const [state, setState] = useState({ loading: false, error: null, data: null })

  const mutate = useCallback(async (...args) => {
    setState({ loading: true, error: null, data: null })
    try {
      const data = await mutator(...args)
      setState({ loading: false, error: null, data })
      return data
    } catch (err) {
      setState({ loading: false, error: err, data: null })
      throw err
    }
  }, [mutator])

  return { ...state, mutate, reset: () => setState({ loading: false, error: null, data: null }) }
}
