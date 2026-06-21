/**
 * Auth service — covers STAGE 0 of E2E_USER_FLOW.
 *
 * Endpoints (CURSOR_API_GUIDE.md §5.BướcA):
 *   POST /api/auth/register          → { message, email }
 *   POST /api/auth/verify-email      → AuthResponseDto { accessToken, user }
 *   POST /api/auth/login             → AuthResponseDto
 *   POST /api/auth/refresh           → AuthResponseDto   (cookie)
 *   POST /api/auth/logout
 *   GET  /api/auth/me
 *   POST /api/auth/forgot-password   → { message }
 *   POST /api/auth/reset-password    → { message }
 */

import { API_ENDPOINTS } from '../config.js'
import { get, post, del } from '../http.js'
import { setAccessToken } from '../tokenStore.js'

export const authService = {
  register(payload) {
    return post(API_ENDPOINTS.auth.register, payload)
  },

  async verifyEmail({ email, otpCode }) {
    const res = await post(API_ENDPOINTS.auth.verifyEmail, { email, otpCode })
    if (res?.accessToken) setAccessToken(res.accessToken)
    return res
  },

  async login({ email, password }) {
    const res = await post(API_ENDPOINTS.auth.login, { email, password })
    if (res?.accessToken) setAccessToken(res.accessToken)
    return res
  },

  async refresh() {
    const res = await post(API_ENDPOINTS.auth.refresh)
    if (res?.accessToken) setAccessToken(res.accessToken)
    return res
  },

  async logout() {
    try {
      await post(API_ENDPOINTS.auth.logout)
    } finally {
      setAccessToken(null)
    }
  },

  me() {
    return get(API_ENDPOINTS.auth.me)
  },

  forgotPassword({ email }) {
    return post(API_ENDPOINTS.auth.forgotPassword, { email })
  },

  resetPassword({ email, otpCode, newPassword }) {
    return post(API_ENDPOINTS.auth.resetPassword, { email, otpCode, newPassword })
  },

  // Xoá vĩnh viễn tài khoản hiện tại (dùng khi user bị ban bấm "Thoát")
  async deleteAccount() {
    try {
      await del(API_ENDPOINTS.auth.deleteAccount)
    } finally {
      setAccessToken(null)
    }
  },
}
