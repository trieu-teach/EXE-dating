import {
  TRUST_SCORE_UNVERIFIED,
  TRUST_SCORE_VERIFIED,
  getVerificationStatus,
  isIdentityVerified,
} from '../../../utils/identityVerification.js'
import './VerificationBadge.css'

export default function VerificationBadge({
  verified: verifiedProp,
  trustScore: trustProp,
  showTrust = false,
  showLabel = true,
  size = 'md',
  className = '',
}) {
  const verified =
    verifiedProp !== undefined ? verifiedProp : isIdentityVerified()
  const status = verified
    ? getVerificationStatus({ identityVerified: true })
    : getVerificationStatus({ identityVerified: false })
  const trust = trustProp ?? (verified ? TRUST_SCORE_VERIFIED : TRUST_SCORE_UNVERIFIED)

  return (
    <span
      className={`verify-badge verify-badge--${verified ? 'verified' : 'unverified'} verify-badge--${size} ${className}`.trim()}
      title={verified ? status.label : `${status.label} · Uy tín thấp hơn`}
    >
      <span className="verify-badge__icon" aria-hidden="true">
        {verified ? '✓' : '○'}
      </span>
      {showLabel && <span className="verify-badge__text">{status.shortLabel}</span>}
      {showTrust && (
        <span className="verify-badge__trust">{trust} uy tín</span>
      )}
    </span>
  )
}
