import { API_ENDPOINTS } from '../config.js'
import { post, withMockFallback } from '../http.js'
import { saveUser } from '../../utils/session.js'

function delay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms))
}

export const authService = {
  async login({ email, password }) {
    return withMockFallback(
      () => post(API_ENDPOINTS.auth.login, { email, password }),
      async () => {
        await delay()
        const user = { email: email.trim().toLowerCase(), token: 'mock-jwt-token' }
        saveUser(user)
        return { user, token: user.token }
      },
    )
  },

  async register(payload) {
    return withMockFallback(
      () => post(API_ENDPOINTS.auth.register, payload),
      async () => {
        await delay()
        return { success: true, requiresOtp: true }
      },
    )
  },

  async verifyOtp(payload) {
    return withMockFallback(
      () => post(API_ENDPOINTS.auth.verifyOtp, payload),
      async () => {
        await delay()
        return { success: true }
      },
    )
  },

  async forgotPassword(payload) {
    return withMockFallback(
      () => post(API_ENDPOINTS.auth.forgotPassword, payload),
      async () => ({ success: true }),
    )
  },

  async resetPassword(payload) {
    return withMockFallback(
      () => post(API_ENDPOINTS.auth.resetPassword, payload),
      async () => ({ success: true }),
    )
  },
}
