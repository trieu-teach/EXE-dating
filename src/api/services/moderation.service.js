/**
 * Block & report service — STAGE 13.
 *
 *   POST /api/users/{id}/block
 *   DELETE /api/users/{id}/block
 *   GET  /api/blocks                          BlockedUserDto[]
 *   POST /api/users/{id}/report  { reason, description? }
 */

import { API_ENDPOINTS } from '../config.js'
import { del, get, post } from '../http.js'

export const blocksService = {
  block(userId) {
    return post(API_ENDPOINTS.block.block(userId))
  },

  unblock(userId) {
    return del(API_ENDPOINTS.block.unblock(userId))
  },

  list() {
    return get(API_ENDPOINTS.block.list)
  },
}

export const reportsService = {
  report(userId, { reason, description }) {
    return post(API_ENDPOINTS.report.create(userId), { reason, description })
  },
}
