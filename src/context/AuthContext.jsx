/**
 * Auth context — exposes the currently logged-in user, the access token
 * status, and helper functions (login, register, verify, logout, refresh).
 *
 * The user record is cached in localStorage by `utils/session.js` so we can
 * hydrate the UI instantly on hard refresh. The access token is held only in
 * the in-memory `tokenStore` and refetched from `/api/auth/me` when needed.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authService, getAccessToken, subscribeAccessToken } from '../api'
import { clearUser, getUser, saveUser } from '../utils/session.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser())
  const [hasToken, setHasToken] = useState(() => Boolean(getAccessToken()))
  const [bootstrapping, setBootstrapping] = useState(true)

  useEffect(() => subscribeAccessToken((token) => setHasToken(Boolean(token))), [])

  const refreshMe = useCallback(async () => {
    if (!getAccessToken()) return null
    try {
      const me = await authService.me()
      if (me && typeof me === 'object') {
        saveUser({ ...me })
        setUser({ ...getUser() })
      }
      return me
    } catch {
      return null
    }
  }, [])

  // Bootstrap: if we have a token (e.g. from refresh on a previous tab),
  // confirm /me so the UI knows the session is alive.
  useEffect(() => {
    let cancelled = false
    if (!getAccessToken()) {
      setBootstrapping(false)
      return
    }
    refreshMe()
      .catch(() => { /* http.js handles 401 */ })
      .finally(() => { if (!cancelled) setBootstrapping(false) })
    return () => { cancelled = true }
  }, [refreshMe])

  const login = useCallback(async ({ email, password }) => {
    const res = await authService.login({ email, password })
    if (res?.user) saveUser({ ...res.user })
    setUser(getUser())
    return res
  }, [])

  const register = useCallback(async (payload) => {
    return authService.register(payload)
  }, [])

  const verifyEmail = useCallback(async ({ email, otpCode }) => {
    const res = await authService.verifyEmail({ email, otpCode })
    if (res?.user) saveUser({ ...res.user })
    setUser(getUser())
    return res
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      /* even if the server call fails, drop the local session */
    } finally {
      clearUser()
      setUser(null)
    }
  }, [])

  const updateProfile = useCallback((partial) => {
    saveUser(partial)
    setUser({ ...getUser() })
  }, [])

  const value = useMemo(() => ({
    user,
    hasToken,
    bootstrapping,
    isAuthenticated: hasToken,
    login,
    register,
    verifyEmail,
    logout,
    refreshMe,
    updateProfile,
  }), [user, hasToken, bootstrapping, login, register, verifyEmail, logout, refreshMe, updateProfile])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
