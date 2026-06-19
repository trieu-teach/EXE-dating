/**
 * Notifications service — STAGE 8.
 *
 *   GET  /api/notifications
 *   POST /api/notifications/read  { ids: [] }     // empty = mark all
 *   GET  /api/notifications/vapid-public-key
 *   POST /api/notifications/subscribe   { endpoint, keys:{p256dh,auth} }
 *   POST /api/notifications/unsubscribe { endpoint }
 */

import { API_ENDPOINTS } from '../config.js'
import { get, post } from '../http.js'

function withQuery(path, params = {}) {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue
    qs.set(k, String(v))
  }
  const s = qs.toString()
  return s ? `${path}?${s}` : path
}

export const notificationsService = {
  getAll(params = {}) {
    return get(withQuery(API_ENDPOINTS.notifications.feed, params))
  },

  markRead(ids) {
    return post(API_ENDPOINTS.notifications.read, { ids: Array.isArray(ids) ? ids : [] })
  },

  vapidKey() {
    return get(API_ENDPOINTS.notifications.vapidKey)
  },

  subscribe(payload) {
    return post(API_ENDPOINTS.notifications.subscribe, payload)
  },

  unsubscribe(payload) {
    return post(API_ENDPOINTS.notifications.unsubscribe, payload)
  },
}
