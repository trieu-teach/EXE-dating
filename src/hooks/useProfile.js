/**
 * Hook to load the current profile (`/api/profile/me`) and expose the
 * `isProfileCompleted` flag. Cached for the duration of the page load.
 */

import { useCallback, useEffect, useState } from 'react'
import { profileService } from '../api'
import { useAuth } from '../context/AuthContext.jsx'

export function useProfile() {
  const { hasToken, bootstrapping } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!hasToken) return null
    if (!silent) setLoading(true)
    try {
      const data = await profileService.me()
      setProfile(data)
      setError(null)
      return data
    } catch (err) {
      setError(err)
      return null
    } finally {
      if (!silent) setLoading(false)
    }
  }, [hasToken])

  useEffect(() => {
    if (bootstrapping) return
    load()
  }, [bootstrapping, load])

  return { profile, loading, error, reload: load, setProfile }
}
