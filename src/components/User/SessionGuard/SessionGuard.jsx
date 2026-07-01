import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext.jsx'

const PUBLIC_ROUTES = new Set(['/', '/login', '/register', '/verify-otp', '/forgot-password', '/reset-password'])
// Route công khai có tham số động (khách/quán không đăng nhập vẫn xem được), so khớp theo tiền tố.
const PUBLIC_PREFIXES = ['/voucher/']

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
    const isPublic = PUBLIC_ROUTES.has(pathname) || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
    if (!isAuthenticated && !isPublic) {
      navigate('/', { replace: true, state: { from: pathname } })
    }
  }, [bootstrapping, isAuthenticated, pathname, navigate])

  return null
}
