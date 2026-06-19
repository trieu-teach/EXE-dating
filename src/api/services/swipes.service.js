/**
 * Swipes service — STAGE 4.
 *
 *   POST /api/swipes               { targetUserId, action: "Like" | "Pass" | "SuperLike" }
 *                                  → { isMatch: boolean, matchId?: string }
 *   GET  /api/swipes/liked-me
 *   GET  /api/swipes/superliked-me
 *   POST /api/swipes/undo          (Plus/Gold only — Free gets 403)
 */

import { API_ENDPOINTS } from '../config.js'
import { get, post } from '../http.js'

export const swipesService = {
  swipe({ targetUserId, action }) {
    return post(API_ENDPOINTS.swipes.create, { targetUserId, action })
  },

  likedMe() {
    return get(API_ENDPOINTS.swipes.likedMe)
  },

  superLikedMe() {
    return get(API_ENDPOINTS.swipes.superLikedMe)
  },

  undo() {
    return post(API_ENDPOINTS.swipes.undo)
  },
}
