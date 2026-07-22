/**
 * Review sau buổi hẹn (Date Pass đã dùng).
 *
 *   GET  /api/reviews/pending  → buổi hẹn chưa đánh giá [{ datePassOrderId, partnerId, partnerName, ... }]
 *   POST /api/reviews          { datePassOrderId, rating(1..5), comment? } → review
 *
 * Điểm sao + danh sách review của một người nằm trong ProfileDto
 * (ratingAvg, ratingCount, reviewsLocked, reviews) — lấy qua profileService.
 */
import { API_ENDPOINTS } from '../config.js'
import { get, post } from '../http.js'

export const reviewService = {
  pending() { return get(API_ENDPOINTS.reviews.pending) },
  create({ datePassOrderId, rating, comment }) {
    return post(API_ENDPOINTS.reviews.create, { datePassOrderId, rating, comment })
  },
}
