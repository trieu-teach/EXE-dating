const rawBase = import.meta.env.VITE_API_BASE_URL ?? ''
const useMockEnv = import.meta.env.VITE_USE_MOCK_API

export const API_BASE_URL = rawBase.replace(/\/$/, '')

/** Khi true: gọi mock local; khi false: chỉ dùng response từ backend */
export const USE_MOCK_API =
  useMockEnv === undefined || useMockEnv === '' ? true : useMockEnv === 'true'

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    verifyOtp: '/auth/verify-otp',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  profile: {
    me: '/profile/me',
    update: '/profile',
    verification: '/profile/verification',
  },
  discovery: {
    feed: '/discovery/feed',
    match: '/discovery/match',
    like: (id) => `/discovery/${id}/like`,
    pass: (id) => `/discovery/${id}/pass`,
    superLike: (id) => `/discovery/${id}/super-like`,
    icebreaker: (id) => `/discovery/${id}/icebreaker`,
  },
  search: {
    results: '/search',
  },
  chat: {
    conversations: '/chat/conversations',
    messages: (id) => `/chat/conversations/${id}/messages`,
    send: (id) => `/chat/conversations/${id}/messages`,
    aiSuggestions: (id) => `/chat/conversations/${id}/ai-suggestions`,
  },
  dates: {
    suggestions: '/dates/suggestions',
  },
  events: {
    list: '/events',
    detail: (id) => `/events/${id}`,
    register: (id) => `/events/${id}/register`,
    history: '/events/history',
    reward: '/events/reward',
  },
  daily: {
    connection: '/daily/connection',
    complete: '/daily/complete',
  },
  loveTree: {
    state: '/love-tree',
    care: '/love-tree/care',
    levelUp: '/love-tree/level-up',
  },
  safety: {
    settings: '/safety/settings',
    pin: '/safety/pin',
    pinForgot: '/safety/pin/forgot',
    pinVerifyOtp: '/safety/pin/verify-otp',
    checkin: '/safety/checkin',
    emergency: '/safety/emergency',
  },
  premium: {
    plans: '/premium/plans',
    subscribe: '/premium/subscribe',
  },
  settings: {
    security: '/settings/security',
    devices: '/settings/devices',
    changePassword: '/settings/password',
    discovery: '/settings/discovery',
    interests: '/settings/interests',
  },
  connection: {
    reminders: '/connection/reminders',
    nudges: (id) => `/connection/conversations/${id}/nudges`,
    dismissNudge: (id) => `/connection/conversations/${id}/nudges/dismiss`,
    proposeMeetup: (id) => `/connection/conversations/${id}/meetup`,
  },
}
