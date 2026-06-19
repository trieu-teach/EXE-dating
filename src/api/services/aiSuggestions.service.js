/**
 * AI suggestions service.
 *
 *   POST /api/ai/icebreakers/{matchId}   → { suggestions: string[] }
 */

import { API_ENDPOINTS } from '../config.js'
import { post } from '../http.js'

export const aiSuggestionsService = {
  icebreakers(matchId) {
    return post(API_ENDPOINTS.ai.icebreakers(matchId))
  },
}
