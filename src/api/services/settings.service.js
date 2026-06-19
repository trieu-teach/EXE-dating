/**
 * Settings service — STAGE 2.
 *
 *   GET /api/settings/security              { twoFactorEnabled, loginAlertsEnabled, ... }
 *   PUT /api/settings/security              { twoFactorEnabled?, loginAlertsEnabled? }
 *   GET /api/settings/devices               DeviceDto[]
 *   GET /api/settings/discovery             (= preferences)
 *   PUT /api/settings/discovery
 *   GET /api/settings/interests             → my interest ids
 *   PUT /api/settings/interests             { interestIds: [] }  (max 10)
 *   PUT /api/settings/password              { currentPassword, newPassword }  // thu hồi sessions
 */

import { API_ENDPOINTS } from '../config.js'
import { get, put } from '../http.js'

export const settingsService = {
  getSecurity() {
    return get(API_ENDPOINTS.settings.security)
  },

  updateSecurity(payload) {
    return put(API_ENDPOINTS.settings.security, payload)
  },

  getDevices() {
    return get(API_ENDPOINTS.settings.devices)
  },

  getDiscovery() {
    return get(API_ENDPOINTS.settings.discovery)
  },

  updateDiscovery(payload) {
    return put(API_ENDPOINTS.settings.discovery, payload)
  },

  getInterests() {
    return get(API_ENDPOINTS.settings.interests)
  },

  updateInterests({ interestIds }) {
    return put(API_ENDPOINTS.settings.interests, { interestIds })
  },

  changePassword({ currentPassword, newPassword }) {
    return put(API_ENDPOINTS.settings.password, { currentPassword, newPassword })
  },
}
