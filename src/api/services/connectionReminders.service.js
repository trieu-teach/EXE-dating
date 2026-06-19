/**
 * Connection reminders / nudges / meetup service — STAGE 7.
 *
 *   GET  /api/connection/reminders
 *   GET  /api/connection/nudges/{conversationId}      → { items: [{ id, code, title, body }] }
 *   POST /api/connection/nudges/{conversationId}/dismiss  { nudgeId }
 *   POST /api/connection/meetup/{conversationId}/propose { venueId, proposedAt, note }
 */

import { API_ENDPOINTS } from '../config.js'
import { get, post } from '../http.js'

export const connectionRemindersService = {
  reminders() {
    return get(API_ENDPOINTS.connection.reminders)
  },

  nudges(conversationId) {
    return get(API_ENDPOINTS.connection.nudges(conversationId))
  },

  dismissNudge(conversationId, nudgeId) {
    return post(API_ENDPOINTS.connection.dismissNudge(conversationId), { nudgeId })
  },

  proposeMeetup(conversationId, payload) {
    return post(API_ENDPOINTS.connection.proposeMeetup(conversationId), payload)
  },
}
