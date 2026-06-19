/**
 * Safety service — STAGE 9.
 *
 *   GET  /api/safety/settings
 *   PUT  /api/safety/settings       { pinEnabled?, emergencyAlertEnabled?, checkinEnabled? }
 *   POST /api/safety/pin/setup      { pin }
 *   POST /api/safety/pin/forgot     { channel: "email" }
 *   POST /api/safety/pin/verify-otp { otp }
 *   POST /api/safety/checkin        { status: "safe" | "help" }
 *   GET  /api/safety/emergency
 *   PUT  /api/safety/emergency      { alertMessage, contacts: [{ name, phoneNumber, relationship }] }
 */

import { API_ENDPOINTS } from '../config.js'
import { get, post, put } from '../http.js'

export const safetyService = {
  getSettings() {
    return get(API_ENDPOINTS.safety.settings)
  },

  updateSettings(payload) {
    return put(API_ENDPOINTS.safety.settings, payload)
  },

  setupPin({ pin }) {
    return post(API_ENDPOINTS.safety.pinSetup, { pin })
  },

  forgotPin({ channel = 'email' } = {}) {
    return post(API_ENDPOINTS.safety.pinForgot, { channel })
  },

  verifyPinOtp({ otp }) {
    return post(API_ENDPOINTS.safety.pinVerifyOtp, { otp })
  },

  checkin({ status }) {
    return post(API_ENDPOINTS.safety.checkin, { status })
  },

  getEmergency() {
    return get(API_ENDPOINTS.safety.emergency)
  },

  updateEmergency(payload) {
    return put(API_ENDPOINTS.safety.emergency, payload)
  },
}
