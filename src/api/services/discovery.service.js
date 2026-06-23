/**
 * Discovery service — STAGE 3.
 *
 *   GET /api/discovery?limit=10
 *   returns: [{ userId, displayName, age, bio, photoUrl, distanceKm, ... }]
 */

import { API_ENDPOINTS } from '../config.js'
import { get } from '../http.js'

export const discoveryService = {
  feed({ limit = 10, includeSwiped = false } = {}) {
    const qs = new URLSearchParams()
    if (limit) qs.set('limit', String(limit))
    if (includeSwiped) qs.set('includeSwiped', 'true')
    const path = API_ENDPOINTS.discovery.feed
    return get(qs.toString() ? `${path}?${qs.toString()}` : path)
  },
}
