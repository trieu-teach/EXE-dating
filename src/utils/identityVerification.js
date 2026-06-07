import { getUser, saveUser } from './session.js'

const SETTINGS_KEY = 'samemess_app_settings'

/** Điểm uy tín — đã xác minh webcam cao hơn rõ rệt */
export const TRUST_SCORE_VERIFIED = 88
export const TRUST_SCORE_UNVERIFIED = 42
export const TRUST_SCORE_DELTA = TRUST_SCORE_VERIFIED - TRUST_SCORE_UNVERIFIED

export const VERIFICATION_STATUS = {
  verified: {
    label: 'Đã xác minh danh tính',
    shortLabel: 'Đã xác minh',
    icon: '✓',
  },
  unverified: {
    label: 'Chưa xác minh danh tính',
    shortLabel: 'Chưa xác minh',
    icon: '○',
  },
}

export function getAppSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveAppSettings(partial) {
  const next = { ...getAppSettings(), ...partial }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
  return next
}

/** Xác minh bắt buộc hay tùy chọn (mặc định: không bắt buộc) */
export function isVerificationRequired() {
  return Boolean(getAppSettings().verificationRequired)
}

export function setVerificationRequired(required) {
  saveAppSettings({ verificationRequired: Boolean(required) })
}

export function isIdentityVerified(user = getUser()) {
  return Boolean(user?.identityVerified)
}

export function getTrustScore(user = getUser()) {
  if (typeof user?.trustScore === 'number') return user.trustScore
  return isIdentityVerified(user) ? TRUST_SCORE_VERIFIED : TRUST_SCORE_UNVERIFIED
}

export function getVerificationStatus(user = getUser()) {
  return isIdentityVerified(user) ? VERIFICATION_STATUS.verified : VERIFICATION_STATUS.unverified
}

export function saveIdentityVerification({
  photo = null,
  method = 'camera_pc',
} = {}) {
  saveUser({
    identityVerified: true,
    verificationMethod: method,
    verifiedAt: new Date().toISOString(),
    trustScore: TRUST_SCORE_VERIFIED,
    verificationPhoto: photo,
  })
}

export function clearIdentityVerification() {
  saveUser({
    identityVerified: false,
    verificationMethod: null,
    verifiedAt: null,
    trustScore: TRUST_SCORE_UNVERIFIED,
    verificationPhoto: null,
  })
}

export function withVerificationFields(profile) {
  const verified = Boolean(profile?.identityVerified)
  return {
    ...profile,
    identityVerified: verified,
    trustScore: profile?.trustScore ?? (verified ? TRUST_SCORE_VERIFIED : TRUST_SCORE_UNVERIFIED),
    verificationMethod: profile?.verificationMethod ?? (verified ? 'camera_pc' : null),
  }
}

/** Điều hướng sau đăng nhập / onboard */
export function getPostAuthRoute(user = getUser()) {
  if (!user?.onboarded) return '/create-profile'
  if (isVerificationRequired() && !isIdentityVerified(user)) {
    return '/account-verification'
  }
  if (!isIdentityVerified(user)) {
    return '/discovery'
  }
  return '/discovery'
}
