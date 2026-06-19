/**
 * Venues service — Meetup §1.
 *
 *   GET /api/meetup/nearby/{matchId}?category=&radiusKm=  → VenueDto[]
 *   GET /api/venues/{venueId}                              → VenueDto
 *
 * VenueDto: { id, name, category, address, district, city,
 *             latitude, longitude, imageUrl, priceRange,
 *             description, distanceKm }
 */

import { API_ENDPOINTS } from '../config.js'
import { get } from '../http.js'

export const venuesService = {
  nearby(matchId, { category = '', radiusKm = 10 } = {}) {
    const qs = new URLSearchParams()
    if (category) qs.set('category', category)
    qs.set('radiusKm', String(Math.min(radiusKm, 30)))
    const base = API_ENDPOINTS.venues.nearby(matchId)
    return get(qs.toString() ? `${base}?${qs.toString()}` : base)
  },

  detail(venueId) {
    return get(API_ENDPOINTS.venues.detail(venueId))
  },
}
