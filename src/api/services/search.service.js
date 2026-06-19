/**
 * Search service — STAGE 3.
 *
 *   GET /api/search/filters   → { interests: [{ id, name, group? }] }
 *   GET /api/search/results?gender=&city=&minAge=&maxAge=&interests=&distanceKm=&sort=distance
 */

import { API_ENDPOINTS } from '../config.js'
import { get } from '../http.js'

function toQuery(params = {}) {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue
    if (Array.isArray(v)) {
      qs.set(k, v.join(','))
    } else {
      qs.set(k, String(v))
    }
  }
  const s = qs.toString()
  return s ? `?${s}` : ''
}

export const searchService = {
  filters() {
    return get(API_ENDPOINTS.search.filters)
  },

  results(params = {}) {
    return get(`${API_ENDPOINTS.search.results}${toQuery(params)}`)
  },
}
