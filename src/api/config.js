/**
 * SameMess API base configuration.
 *
 * All endpoints are described in CURSOR_API_GUIDE.md and E2E_USER_FLOW.md.
 * The single source of truth lives here — do not hard-code paths in pages.
 */

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'https://dating-app-backend-q5gk.onrender.com'
).replace(/\/$/, '')

/** WebSocket / SignalR hub for realtime chat. */
export const CHAT_HUB_URL = (import.meta.env.VITE_CHAT_HUB_URL ?? API_BASE_URL).replace(/\/$/, '')

/** Web Push (VAPID) public key — only loaded after login. */
export const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY ?? ''

/** Google Custom Search — used to suggest fallback images. Optional. */
export const GOOGLE_CSE_KEY = import.meta.env.VITE_GOOGLE_CSE_KEY ?? ''
export const GOOGLE_CSE_CX = import.meta.env.VITE_GOOGLE_CSE_CX ?? ''

export const API_ENDPOINTS = {
  auth: {
    register: '/api/auth/register',
    verifyEmail: '/api/auth/verify-email',
    login: '/api/auth/login',
    refresh: '/api/auth/refresh',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
    forgotPassword: '/api/auth/forgot-password',
    resetPassword: '/api/auth/reset-password',
  },
  profile: {
    me: '/api/profile/me',
    update: '/api/profile',
    location: '/api/profile/location',
    photos: '/api/profile/photos',
    photoDelete: (id) => `/api/profile/photos/${id}`,
    photoPrimary: (id) => `/api/profile/photos/${id}/primary`,
    photoReorder: '/api/profile/photos/order',
    verifyFace: '/api/profile/verify-face',
    verification: '/api/profile/verification',
    boost: '/api/profile/boost',
  },
  preferences: {
    get: '/api/preferences',
    update: '/api/preferences',
  },
  swipes: {
    create: '/api/swipes',
    likedMe: '/api/swipes/liked-me',
    superLikedMe: '/api/swipes/superliked-me',
    undo: '/api/swipes/undo',
  },
  discovery: {
    feed: '/api/discovery',
  },
  matches: {
    list: '/api/matches',
    delete: (id) => `/api/matches/${id}`,
  },
  chat: {
    conversations: '/api/conversations',
    byMatch: (matchId) => `/api/conversations/by-match/${matchId}`,
    messages: (id) => `/api/conversations/${id}/messages`,
    read: (id) => `/api/conversations/${id}/read`,
  },
  notifications: {
    feed: '/api/notifications',
    read: '/api/notifications/read',
    subscribe: '/api/notifications/subscribe',
    unsubscribe: '/api/notifications/unsubscribe',
    vapidKey: '/api/notifications/vapid-public-key',
  },
  reputation: {
    me: '/api/reputation/me',
  },
  subscription: {
    plans: '/api/plans',
    me: '/api/subscription/me',
    order: '/api/subscription/order',
    mockConfirm: (txnRef) => `/api/subscription/mock-confirm/${txnRef}`,
  },
  gamification: {
    tasks: '/api/tasks',
    inventory: '/api/inventory',
  },
  plants: {
    get: (matchId) => `/api/plants/${matchId}`,
    water: (matchId) => `/api/plants/${matchId}/water`,
  },
  ai: {
    icebreakers: (matchId) => `/api/ai/icebreakers/${matchId}`,
  },
  block: {
    list: '/api/blocks',
    block: (id) => `/api/users/${id}/block`,
    unblock: (id) => `/api/users/${id}/block`,
  },
  report: {
    create: (id) => `/api/users/${id}/report`,
  },
  settings: {
    security: '/api/settings/security',
    devices: '/api/settings/devices',
    discovery: '/api/settings/discovery',
    interests: '/api/settings/interests',
    password: '/api/settings/password',
  },
  search: {
    filters: '/api/search/filters',
    results: '/api/search/results',
  },
  events: {
    list: '/api/events',
    detail: (id) => `/api/events/${id}`,
    register: (id) => `/api/events/${id}/register`,
    history: '/api/events/history',
    reward: '/api/events/reward',
  },
  safety: {
    settings: '/api/safety/settings',
    pinSetup: '/api/safety/pin/setup',
    pinForgot: '/api/safety/pin/forgot',
    pinVerifyOtp: '/api/safety/pin/verify-otp',
    checkin: '/api/safety/checkin',
    emergency: '/api/safety/emergency',
  },
  daily: {
    connection: '/api/daily/connection',
    complete: '/api/daily/complete',
  },
  connection: {
    reminders: '/api/connection/reminders',
    nudges: (conversationId) => `/api/connection/nudges/${conversationId}`,
    dismissNudge: (conversationId) => `/api/connection/nudges/${conversationId}/dismiss`,
    proposeMeetup: (conversationId) => `/api/connection/meetup/${conversationId}/propose`,
    meetups: (conversationId) => `/api/connection/meetups/${conversationId}`,
    respondMeetup: (meetupId) => `/api/connection/meetup/${meetupId}/respond`,
  },
  venues: {
    nearby: (matchId) => `/api/meetup/nearby/${matchId}`,
    detail: (venueId) => `/api/venues/${venueId}`,
  },
  conversations: {
    venue: (conversationId) => `/api/conversations/${conversationId}/venue`,
  },
}
