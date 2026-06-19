/**
 * Daily service — STAGE 7.
 *
 *   GET  /api/daily/connection              → { quests, totalXp, userXp }
 *   POST /api/daily/complete                { questIds: [] }  → cộng XP
 */

import { API_ENDPOINTS } from '../config.js'
import { get, post } from '../http.js'

export const dailyService = {
  get() {
    return get(API_ENDPOINTS.daily.connection)
  },

  complete(questIds) {
    return post(API_ENDPOINTS.daily.complete, { questIds: Array.isArray(questIds) ? questIds : [] })
  },
}
