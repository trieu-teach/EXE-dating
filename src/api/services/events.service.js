import { API_ENDPOINTS } from '../config.js'
import { get, post, withMockFallback } from '../http.js'
import {
  EVENTS,
  EVENT_CATEGORIES,
  FEATURED_EVENT_ID,
  HISTORY_EVENTS,
  PREMIUM_FEATURES,
  PREMIUM_PLANS,
  getEventById,
} from '../../data/events.js'

function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms))
}

export const eventsService = {
  async getList() {
    return withMockFallback(
      () => get(API_ENDPOINTS.events.list),
      async () => {
        await delay()
        return {
          categories: EVENT_CATEGORIES,
          featuredId: FEATURED_EVENT_ID,
          events: EVENTS,
        }
      },
    )
  },

  async getById(eventId) {
    return withMockFallback(
      () => get(API_ENDPOINTS.events.detail(eventId)),
      async () => {
        await delay()
        const event = getEventById(eventId)
        if (!event) throw new Error('NOT_FOUND')
        return { event }
      },
    )
  },

  async register(eventId) {
    return withMockFallback(
      () => post(API_ENDPOINTS.events.register(eventId)),
      async () => {
        await delay()
        return { success: true, eventId, rewardEligible: true }
      },
    )
  },

  async getHistory() {
    return withMockFallback(
      () => get(API_ENDPOINTS.events.history),
      async () => {
        await delay()
        return {
          totalAttended: 12,
          monthDelta: 2,
          events: HISTORY_EVENTS,
        }
      },
    )
  },

  async getReward(eventId) {
    return withMockFallback(
      () => get(`${API_ENDPOINTS.events.reward}?eventId=${eventId}`),
      async () => {
        await delay()
        return {
          code: 'SAMEMESS50',
          title: 'Giảm 50% cho buổi hẹn đầu tiên',
          venue: 'The Blue Note Coffee & Lounge',
          expiresAt: '2025-12-31',
          trustScoreDelta: 10,
        }
      },
    )
  },
}

export const premiumService = {
  async getPlans() {
    return withMockFallback(
      () => get(API_ENDPOINTS.premium.plans),
      async () => {
        await delay()
        return { plans: PREMIUM_PLANS, features: PREMIUM_FEATURES }
      },
    )
  },

  async subscribe(planId) {
    return withMockFallback(
      () => post(API_ENDPOINTS.premium.subscribe, { planId }),
      async () => ({ success: true, planId }),
    )
  },
}
