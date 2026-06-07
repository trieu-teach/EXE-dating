import { API_ENDPOINTS } from '../config.js'
import { get, post, put, withMockFallback } from '../http.js'
import {
  getTrustScore,
  getVerificationStatus,
  isIdentityVerified,
  isVerificationRequired,
  saveIdentityVerification,
} from '../../utils/identityVerification.js'
import { getAvatarUrl, getProfilePhotos } from '../../utils/profilePhotos.js'
import { getUser } from '../../utils/session.js'

function delay(ms = 250) {
  return new Promise((r) => setTimeout(r, ms))
}

export const profileService = {
  async getMe() {
    return withMockFallback(
      () => get(API_ENDPOINTS.profile.me),
      async () => {
        await delay()
        const local = getUser()
        const profile = local?.profile ?? {}
        const photos = getProfilePhotos()
        return {
          name: local?.name ?? profile.fullName ?? 'Người dùng SameMess',
          displayName: profile.fullName ?? local?.name ?? 'Nguyễn Minh Anh',
          username: local?.username ?? 'minhanh_23',
          email: local?.email ?? 'minhanh@gmail.com',
          avatarUrl: getAvatarUrl(),
          profilePhotos: photos,
          photoCount: photos.length || (local?.photoCount ?? 0),
          identityVerified: isIdentityVerified(local),
          verificationMethod: local?.verificationMethod ?? null,
          verifiedAt: local?.verifiedAt ?? null,
          trustScore: getTrustScore(local),
          verificationStatus: getVerificationStatus(local),
          verificationRequired: isVerificationRequired(),
          stats: { likes: 12, connections: 5, completion: 89 },
          location: profile.city ?? 'Hà Nội, Việt Nam',
          age: profile.age ?? '25',
          occupation: profile.occupation ?? '',
          bio: profile.bio ?? '',
          personality: profile.personality ?? 'Cân bằng',
          shareSexualOrientation: Boolean(profile.sexualOrientation),
          sexualOrientation: profile.sexualOrientation ?? '',
        }
      },
    )
  },

  async updateProfile(payload) {
    return withMockFallback(
      () => put(API_ENDPOINTS.profile.update, payload),
      async () => ({ success: true, ...payload }),
    )
  },

  async submitVerification(payload) {
    return withMockFallback(
      () => post(API_ENDPOINTS.profile.verification, payload),
      async () => {
        await delay(600)
        if (payload?.type === 'face' && !payload?.photo) {
          throw new Error('Thiếu ảnh xác minh')
        }
        if (payload?.type === 'face' && payload?.photo) {
          saveIdentityVerification({ photo: payload.photo, method: 'camera_pc' })
        }
        return {
          success: true,
          verified: true,
          type: payload?.type ?? 'face',
          trustScore: getTrustScore(),
        }
      },
    )
  },
}
