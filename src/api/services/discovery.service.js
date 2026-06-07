import { API_ENDPOINTS } from '../config.js'
import { get, post, withMockFallback } from '../http.js'
import { MOCK_CANDIDATES } from '../mocks/discovery.mock.js'
import { withVerificationFields } from '../../utils/identityVerification.js'
import { getUser } from '../../utils/session.js'
import { getUserMatchingProfile, rankMatchCandidates, MATCHING_STEPS } from '../../utils/matching.js'

function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms))
}

function buildFeed(user) {
  const candidates = MOCK_CANDIDATES.map(withVerificationFields)
  let ranked = rankMatchCandidates(candidates, user)

  if (getUser()?.discoveryPrefs?.verifiedOnly) {
    ranked = ranked.filter((p) => p.identityVerified)
  }

  return {
    profiles: ranked,
    picks: ranked.slice(0, 3).map((p) => ({
      id: p.id,
      name: p.name,
      image: p.image,
      match: p.match,
    })),
  }
}

export const discoveryService = {
  async getFeed() {
    return withMockFallback(
      () => get(API_ENDPOINTS.discovery.feed),
      async () => {
        await delay()
        return buildFeed(getUserMatchingProfile())
      },
    )
  },

  async runMatching() {
    return withMockFallback(
      () => post(API_ENDPOINTS.discovery.match),
      async () => {
        const user = getUserMatchingProfile()

        for (let i = 0; i < MATCHING_STEPS.length; i++) {
          await delay(650)
        }

        const matches = rankMatchCandidates(MOCK_CANDIDATES.map(withVerificationFields), user)
        const list = matches.filter((m) => m.match >= 68)
        const ranked = list.length ? list : matches

        return {
          userCriteria: {
            interests: user.interests,
            personality: user.personality,
            location: user.locationLabel,
            ageRange: `${user.ageMin}–${user.ageMax}`,
          },
          bestMatch: ranked[0],
          suggestions: ranked.slice(1, 4),
          totalScanned: MOCK_CANDIDATES.length,
        }
      },
    )
  },

  async connectMatch(profileId) {
    return withMockFallback(
      () => post(API_ENDPOINTS.discovery.like(profileId)),
      async () => {
        await delay(400)
        return {
          success: true,
          matched: true,
          conversationId: profileId,
        }
      },
    )
  },

  async like(profileId) {
    return this.connectMatch(profileId)
  },

  async pass(profileId) {
    return withMockFallback(
      () => post(API_ENDPOINTS.discovery.pass(profileId)),
      async () => ({ success: true }),
    )
  },

  async superLike(profileId) {
    return withMockFallback(
      () => post(API_ENDPOINTS.discovery.superLike(profileId)),
      async () => ({ success: true }),
    )
  },

  async sendIcebreaker(profileId) {
    return withMockFallback(
      () => post(API_ENDPOINTS.discovery.icebreaker(profileId)),
      async () => ({ success: true }),
    )
  },
}
