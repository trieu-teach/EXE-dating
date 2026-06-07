import { API_ENDPOINTS } from '../config.js'
import { get, put, withMockFallback } from '../http.js'

function delay(ms = 250) {
  return new Promise((r) => setTimeout(r, ms))
}

export const settingsService = {
  async getSecurity() {
    return withMockFallback(
      () => get(API_ENDPOINTS.settings.security),
      async () => {
        await delay()
        return { twoFactor: false, loginAlerts: true }
      },
    )
  },

  async getDevices() {
    return withMockFallback(
      () => get(API_ENDPOINTS.settings.devices),
      async () => {
        await delay()
        return {
          devices: [
            { id: '1', name: 'Chrome · Windows', current: true, lastActive: 'Vừa xong' },
          ],
        }
      },
    )
  },

  async getDiscoverySettings() {
    return withMockFallback(
      () => get(API_ENDPOINTS.settings.discovery),
      async () => {
        await delay()
        return { distanceKm: 25, ageMin: 22, ageMax: 35, showMe: 'everyone' }
      },
    )
  },

  async getInterests() {
    return withMockFallback(
      () => get(API_ENDPOINTS.settings.interests),
      async () => {
        await delay()
        return { selected: [], groups: [] }
      },
    )
  },

  async updateDiscoverySettings(payload) {
    return withMockFallback(
      () => put(API_ENDPOINTS.settings.discovery, payload),
      async () => ({ success: true }),
    )
  },

  async changePassword(payload) {
    return withMockFallback(
      () => put(API_ENDPOINTS.settings.changePassword, payload),
      async () => ({ success: true }),
    )
  },
}
