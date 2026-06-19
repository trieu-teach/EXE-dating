/**
 * Reputation service — STAGE 8.
 *
 *   GET /api/reputation/me    → { score, rank, badges? }
 */

import { API_ENDPOINTS } from '../config.js'
import { get } from '../http.js'

export const reputationService = {
  me() {
    return get(API_ENDPOINTS.reputation.me)
  },
}
