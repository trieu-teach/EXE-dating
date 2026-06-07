import { API_ENDPOINTS } from '../config.js'
import { get, post, put, withMockFallback } from '../http.js'

function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms))
}

export const safetyService = {
  async getSettings() {
    return withMockFallback(
      () => get(API_ENDPOINTS.safety.settings),
      async () => {
        await delay()
        return {
          contactName: 'Nguyễn Thu Hà',
          contactPhone: '090 123 4567',
          safeZone: true,
          safeTime: '15:00',
          radiusMeters: 500,
        }
      },
    )
  },

  async saveSettings(payload) {
    return withMockFallback(
      () => put(API_ENDPOINTS.safety.settings, payload),
      async () => ({ success: true }),
    )
  },

  async setupPin(pin) {
    return withMockFallback(
      () => post(API_ENDPOINTS.safety.pin, { pin }),
      async () => ({ success: true }),
    )
  },

  async requestPinReset(channel) {
    return withMockFallback(
      () => post(API_ENDPOINTS.safety.pinForgot, { channel }),
      async () => ({ success: true }),
    )
  },

  async verifyPinOtp(otp) {
    return withMockFallback(
      () => post(API_ENDPOINTS.safety.pinVerifyOtp, { otp }),
      async () => ({ success: true }),
    )
  },

  async confirmCheckin(payload) {
    return withMockFallback(
      () => post(API_ENDPOINTS.safety.checkin, payload),
      async () => ({ success: true }),
    )
  },

  async getEmergencyAlert() {
    return withMockFallback(
      () => get(API_ENDPOINTS.safety.emergency),
      async () => {
        await delay()
        return {
          contactName: 'Trần Minh Tuấn',
          location: 'Phố đi bộ Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
          updatedMinutesAgo: 2,
        }
      },
    )
  },
}
