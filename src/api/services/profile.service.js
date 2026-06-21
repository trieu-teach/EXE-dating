/**
 * Profile service — covers STAGE 1 of E2E_USER_FLOW.
 *
 *   PUT  /api/profile                       update info
 *   PUT  /api/profile/location              required before Discovery
 *   POST /api/profile/photos                multipart → { id, url }
 *   PUT  /api/profile/photos/{id}/primary   set primary
 *   PUT  /api/profile/photos/order          reorder
 *   DELETE /api/profile/photos/{id}
 *   POST /api/profile/boost
 *   POST /api/profile/verify-face           multipart selfie
 *   GET  /api/profile/verification
 *   GET  /api/profile/me                    { ..., isProfileCompleted }
 */

import { API_ENDPOINTS } from '../config.js'
import { del, get, post, put, upload } from '../http.js'

export const profileService = {
  me() {
    return get(API_ENDPOINTS.profile.me)
  },

  byId(userId) {
    return get(API_ENDPOINTS.profile.byId(userId))
  },

  update(payload) {
    return put(API_ENDPOINTS.profile.update, payload)
  },

  updateLocation({ latitude, longitude }) {
    return put(API_ENDPOINTS.profile.location, { latitude, longitude })
  },

  uploadPhoto(file) {
    const fd = new FormData()
    fd.append('file', file)
    return upload(API_ENDPOINTS.profile.photos, fd)
  },

  setPrimary(photoId) {
    return put(API_ENDPOINTS.profile.photoPrimary(photoId))
  },

  reorder(photoIds) {
    return put(API_ENDPOINTS.profile.photoReorder, { photoIds })
  },

  deletePhoto(photoId) {
    return del(API_ENDPOINTS.profile.photoDelete(photoId))
  },

  boost() {
    return post(API_ENDPOINTS.profile.boost)
  },

  verifyFace(file) {
    const fd = new FormData()
    fd.append('file', file)
    return upload(API_ENDPOINTS.profile.verifyFace, fd)
  },

  verification() {
    return get(API_ENDPOINTS.profile.verification)
  },
}
