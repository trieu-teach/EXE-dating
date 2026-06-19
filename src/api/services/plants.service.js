/**
 * Plants (love tree) service — STAGE 6.
 *
 *   GET  /api/plants/{matchId}    → { level, xp, wateredAt, ... }
 *   POST /api/plants/{matchId}/water
 */

import { API_ENDPOINTS } from '../config.js'
import { get, post } from '../http.js'

export const plantsService = {
  get(matchId) {
    return get(API_ENDPOINTS.plants.get(matchId))
  },

  water(matchId, { material } = {}) {
    return post(API_ENDPOINTS.plants.water(matchId), { material })
  },
}
