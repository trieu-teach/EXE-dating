/**
 * Matches service — STAGE 5.
 *
 *   GET    /api/matches                 → MatchDto[]
 *   DELETE /api/matches/{id}            unmatch
 *
 * The backend's MatchDto uses `matchId` (not `id`) — we normalise to a
 * common shape so callers can always read `m.id`.
 */

import { API_ENDPOINTS } from '../config.js'
import { del, get } from '../http.js'

function normaliseMatch(raw) {
  if (!raw || typeof raw !== 'object') return raw
  // Backend may send `matchId`, `id`, or nested under a wrapper. Accept all.
  const id = raw.id || raw.matchId || raw.MatchId || raw.match_id
  if (!id) return raw
  // Strip the backend's key, then re-attach as `id` to keep a single source.
  const { id: _id, matchId: _matchId, MatchId: _MatchId, match_id: _match_id, ...rest } = raw
  return { id, ...rest }
}

function normaliseList(payload) {
  if (Array.isArray(payload)) return payload.map(normaliseMatch)
  if (payload && Array.isArray(payload.items)) return payload.items.map(normaliseMatch)
  return payload
}

export const matchesService = {
  async list() {
    const data = await get(API_ENDPOINTS.matches.list)
    return normaliseList(data)
  },

  unmatch(matchId) {
    return del(API_ENDPOINTS.matches.delete(matchId))
  },
}
