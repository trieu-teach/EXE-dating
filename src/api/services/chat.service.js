/**
 * Chat service — STAGE 5.
 *
 *   GET  /api/conversations                                ConversationDto[]
 *   POST /api/conversations/by-match/{matchId}             ConversationDto
 *   GET  /api/conversations/{id}/messages?before=&limit=   MessageDto[]
 *   POST /api/conversations/{id}/messages  { content }     MessageDto
 *   POST /api/conversations/{id}/read                      void
 */

import { API_ENDPOINTS } from '../config.js'
import { get, post } from '../http.js'

function withQuery(path, params = {}) {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue
    qs.set(k, String(v))
  }
  const s = qs.toString()
  return s ? `${path}?${s}` : path
}

export const chatService = {
  conversations() {
    return get(API_ENDPOINTS.chat.conversations)
  },

  byMatch(matchId) {
    return post(API_ENDPOINTS.chat.byMatch(matchId))
  },

  messages(conversationId, params = {}) {
    return get(withQuery(API_ENDPOINTS.chat.messages(conversationId), params))
  },

  send(conversationId, content) {
    return post(API_ENDPOINTS.chat.messages(conversationId), { content })
  },

  markRead(conversationId) {
    return post(API_ENDPOINTS.chat.read(conversationId))
  },
}
