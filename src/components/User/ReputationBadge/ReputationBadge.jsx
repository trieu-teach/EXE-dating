import { Link } from 'react-router-dom'
import { useReputation } from '../../../hooks/useReputation.js'
import './ReputationBadge.css'

/**
 * Compact reputation badge with optional cap indicator.
 *
 * Props:
 *   - size: 'sm' | 'md'  (default 'sm')
 *   - showLabel: include "Uy tín" text
 *   - showCapNote: when capped, include a small "max 65" hint
 */
export default function ReputationBadge({
  size = 'sm',
  showLabel = true,
  showCapNote = true,
}) {
  const { score, rank, loading, isPhotoVerified, capped } = useReputation()

  if (loading || score == null) {
    return <span className={`rep-badge rep-${size} is-loading`} aria-hidden>…</span>
  }

  const tone = isPhotoVerified ? 'verified' : 'limited'
  return (
    <Link
      to="/reputation"
      className={`rep-badge rep-${size} rep-${tone}`}
      title={
        isPhotoVerified
          ? `Uy tín: ${score}${rank ? ` · Hạng ${rank}` : ''}`
          : `Xác minh khuôn mặt để mở khóa uy tín đầy đủ (tối đa 65 khi chưa xác minh). Hiện tại: ${score}.`
      }
    >
      <span className="rep-value">{score}</span>
      {showLabel && <span className="rep-label">Uy tín</span>}
      {showCapNote && capped && (
        <span className="rep-cap" aria-hidden>/ 65</span>
      )}
    </Link>
  )
}
