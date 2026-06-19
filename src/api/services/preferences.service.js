/**
 * Preferences service — STAGE 2 of E2E_USER_FLOW.
 *
 *   GET  /api/preferences
 *   PUT  /api/preferences
 *   body: { interestedInGender: "Male" | "Female" | "Everyone",
 *           minAge, maxAge, maxDistanceKm }
 */

import { API_ENDPOINTS } from '../config.js'
import { get, put } from '../http.js'

export const preferencesService = {
  get() {
    return get(API_ENDPOINTS.preferences.get)
  },

  update(payload) {
    return put(API_ENDPOINTS.preferences.update, payload)
  },
}
