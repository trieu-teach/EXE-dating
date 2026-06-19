import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext.jsx'

const PUBLIC_ROUTES = new Set(['/login', '/register', '/verify-otp', '/forgot-password', '/reset-password'])

/**
 * Redirects unauthenticated users to /login. Runs on every navigation so
 * the guard is enforced even on hard refresh.
 */
export default function SessionGuard() {
  const { isAuthenticated, bootstrapping } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    if (bootstrapping) return
    if (!isAuthenticated && !PUBLIC_ROUTES.has(pathname)) {
      navigate('/login', { replace: true, state: { from: pathname } })
    }
  }, [bootstrapping, isAuthenticated, pathname, navigate])

  return null
}
