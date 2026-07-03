/**
 * Admin service — dashboard, duyệt xác minh, quản lý quán & combo voucher.
 * Tất cả yêu cầu role Admin (backend chặn 403 nếu không phải admin).
 */
import { API_ENDPOINTS } from '../config.js'
import { get, post, del } from '../http.js'

export const adminService = {
  dashboard() { return get(API_ENDPOINTS.admin.dashboard) },
  charts(type = 'signups') { return get(`${API_ENDPOINTS.admin.charts}?type=${type}`) },

  // Xác minh khuôn mặt thủ công
  verifications() { return get(API_ENDPOINTS.admin.verifications) },
  approveVerification(userId) { return post(API_ENDPOINTS.admin.approveVerification(userId)) },
  rejectVerification(userId) { return post(API_ENDPOINTS.admin.rejectVerification(userId)) },

  // Quán
  venues() { return get(`${API_ENDPOINTS.admin.venues}?includeInactive=true`) },
  createVenue(payload) { return post(API_ENDPOINTS.admin.venues, payload) },
  deleteVenue(id) { return del(API_ENDPOINTS.admin.venue(id)) },

  // Combo (voucher)
  combos() { return get(API_ENDPOINTS.admin.combos) },
  createCombo(payload) { return post(API_ENDPOINTS.admin.combos, payload) },
  deleteCombo(id) { return del(API_ENDPOINTS.admin.combo(id)) },

  // Quản lý user
  users({ search = '', status = '', page = 1, pageSize = 50 } = {}) {
    const qs = new URLSearchParams({ page, pageSize })
    if (search) qs.set('search', search)
    if (status) qs.set('status', status)
    return get(`${API_ENDPOINTS.admin.users}?${qs.toString()}`)
  },
  banUser(userId) { return post(API_ENDPOINTS.admin.usersBulk, { action: 'ban', userIds: [userId] }) },
  unbanUser(userId) { return post(API_ENDPOINTS.admin.usersBulk, { action: 'unban', userIds: [userId] }) },

  // Tặng premium miễn phí (không thanh toán)
  grantPlan(userId, planCode) { return post(API_ENDPOINTS.admin.grantPlan, { userId, planCode }) },
}
