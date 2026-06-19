/**
 * Events service — STAGE 10.
 *
 *   GET  /api/events                          EventDto[]
 *   GET  /api/events/{id}                     EventDto
 *   POST /api/events/{id}/register            { registrationId, status }
 *   GET  /api/events/history
 *   GET  /api/events/reward?eventId=          { xp, badge }
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

export const eventsService = {
  list() {
    return get(API_ENDPOINTS.events.list)
  },

  detail(eventId) {
    return get(API_ENDPOINTS.events.detail(eventId))
  },

  register(eventId) {
    return post(API_ENDPOINTS.events.register(eventId))
  },

  history() {
    return get(API_ENDPOINTS.events.history)
  },

  reward(eventId) {
    return get(withQuery(API_ENDPOINTS.events.reward, { eventId }))
  },
}
