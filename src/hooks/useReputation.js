import { useEffect, useState, useCallback } from 'react'
import { reputationService } from '../api'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * Hook that reads the user's reputation score, applies a client-side cap of
 * 65 if face verification is missing, and exposes a `refresh()` function.
 *
 * The cap is enforced in the UI so unverified users see the bounded score
 * even if the server still returns a higher value. The server is the source
 * of truth — but the contract is documented:
 *
 *   if user.isPhotoVerified === false  →  score = min(score, 65)
 */
export function useReputation() {
  const { user } = useAuth()
  const isPhotoVerified = Boolean(user?.isPhotoVerified)
  const [score, setScore] = useState(null)
  const [rank, setRank] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await reputationService.me()
      const raw = Number(data?.score ?? 0)
      const capped = isPhotoVerified ? raw : Math.min(raw, 65)
      setScore(capped)
      setRank(data?.rank ?? null)
    } catch (err) {
      setError(err?.message || 'Không tải được uy tín.')
      // Fallback when API fails: still show the cap for unverified users.
      setScore(isPhotoVerified ? null : 0)
    } finally {
      setLoading(false)
    }
  }, [isPhotoVerified])

  useEffect(() => { refresh() }, [refresh])

  return { score, rank, loading, error, isPhotoVerified, refresh, capped: !isPhotoVerified }
}
