/**
 * Subscription / plans service — STAGE 11.
 *
 *   GET  /api/plans                         (public) → PlanDto[]
 *   GET  /api/subscription/me
 *   POST /api/subscription/order            { planCode } → { txnRef, paymentUrl }
 *   POST /api/subscription/mock-confirm/{txnRef}      (DEV only)
 */

import { API_ENDPOINTS } from '../config.js'
import { get, post } from '../http.js'

export const subscriptionService = {
  plans() {
    return get(API_ENDPOINTS.subscription.plans)
  },

  me() {
    return get(API_ENDPOINTS.subscription.me)
  },

  order(planCode) {
    return post(API_ENDPOINTS.subscription.order, { planCode })
  },

  // PayOS: tạo đơn → trả { checkoutUrl, qrCode, orderCode, amountVnd }
  payosCreate(planCode) {
    return post(API_ENDPOINTS.subscription.payosCreate, { planCode })
  },

  // PayOS: chốt thanh toán khi quay về (hỏi PayOS trạng thái thật) — dùng cho cả gói lẫn voucher
  payosVerify(orderCode) {
    return post(API_ENDPOINTS.subscription.payosVerify, { orderCode: Number(orderCode) })
  },

  mockConfirm(txnRef) {
    return post(API_ENDPOINTS.subscription.mockConfirm(txnRef))
  },
}
