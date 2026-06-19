import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { profileService } from '../../../api'
import { useAuth } from '../../../context/AuthContext.jsx'

const ONBOARDING_PATHS = [
  '/onboarding/preferences',
  '/onboarding/location',
  '/create-profile',
  '/onboarding/verify-face',
]

/**
 * Onboarding guard — ensures brand-new users complete the 4-step flow
 *   1. /onboarding/preferences (tiêu chí)
 *   2. /onboarding/location      (vị trí)
 *   3. /create-profile           (hồ sơ)
 *   4. /onboarding/verify-face   (xác minh khuôn mặt)
 * before being allowed into the main app.
 *
 * Returning users (already verified face) skip this guard entirely.
 */
export default function OnboardingGuard({ children }) {
  const { hasToken, bootstrapping } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [state, setState] = useState({ checking: true, allowed: false })

  useEffect(() => {
    if (bootstrapping) return
    if (!hasToken) {
      setState({ checking: false, allowed: true })
      return
    }

    const isOnboarding = ONBOARDING_PATHS.some((p) => pathname.startsWith(p))
    if (isOnboarding) {
      setState({ checking: false, allowed: true })
      return
    }

    let cancelled = false
    setState({ checking: true, allowed: false })

    Promise.all([
      profileService.me().catch(() => null),
      profileService.verification().catch(() => null),
    ]).then(([profile]) => {
      if (cancelled) return

      const latitude = Number(profile?.latitude)
      const longitude = Number(profile?.longitude)
      const hasLocation = Number.isFinite(latitude) && Number.isFinite(longitude) && (latitude !== 0 || longitude !== 0)
      const profileCompleted = Boolean(profile?.isProfileCompleted)
      // Note: face verification is OPTIONAL — unverified users still get into
      // the app, they just have a capped reputation score of 65 and no badge.

      if (!hasLocation) {
        navigate('/onboarding/location', { replace: true })
        return
      }
      if (!profileCompleted) {
        navigate('/create-profile', { replace: true })
        return
      }

      setState({ checking: false, allowed: true })
    })

    return () => { cancelled = true }
  }, [bootstrapping, hasToken, pathname, navigate])

  if (state.checking) {
    return (
      <div className="loading-block">
        <span className="spinner" />
        <span style={{ marginLeft: 8 }}>Đang kiểm tra hồ sơ…</span>
      </div>
    )
  }

  return children
}
