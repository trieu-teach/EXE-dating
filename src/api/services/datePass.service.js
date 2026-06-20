/**
 * Date Pass service — combo ưu đãi hẹn hò (O2O).
 *
 *   GET  /api/datepass/combos            (public) → VenueComboDto[]
 *   GET  /api/datepass/eligible-matches  → cặp đủ điều kiện (cây ≥ Lv4)
 *   POST /api/datepass/order             { comboId, matchId, email? } → order (Pending)
 *   POST /api/datepass/order/{id}/confirm  (mock pay) → order (Paid) + gửi email
 *   POST /api/datepass/order/{id}/redeem   (quán quét) → order (Redeemed)
 *   GET  /api/datepass/my                → voucher của tôi
 *   GET  /api/datepass/revenue           → dashboard doanh thu
 */
import { API_ENDPOINTS } from '../config.js'
import { get, post } from '../http.js'

export const datePassService = {
  combos() { return get(API_ENDPOINTS.datepass.combos) },
  eligibleMatches() { return get(API_ENDPOINTS.datepass.eligibleMatches) },
  createOrder({ comboId, matchId, email, partnerEmail }) {
    return post(API_ENDPOINTS.datepass.order, {
      comboId, matchId,
      ...(email ? { email } : {}),
      ...(partnerEmail ? { partnerEmail } : {}),
    })
  },
  confirm(orderId) { return post(API_ENDPOINTS.datepass.confirm(orderId)) },
  redeem(orderId) { return post(API_ENDPOINTS.datepass.redeem(orderId)) },
  my() { return get(API_ENDPOINTS.datepass.my) },
  revenue() { return get(API_ENDPOINTS.datepass.revenue) },
}
