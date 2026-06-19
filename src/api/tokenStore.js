/**
 * In-memory access token store.
 *
 * Per CURSOR_API_GUIDE.md §1 the access token is held in memory (NOT localStorage)
 * to minimise XSS exposure. The refresh token lives in an HttpOnly cookie set by
 * the server, so we only need to remember the access token in this module.
 *
 * The token is exposed via a tiny pub/sub so React components can re-render when
 * it changes (login, refresh, logout).
 */

let accessToken = null
const subscribers = new Set()

function emit() {
  for (const fn of subscribers) {
    try { fn(accessToken) } catch { /* ignore */ }
  }
}

export function setAccessToken(token) {
  accessToken = token || null
  emit()
}

export function getAccessToken() {
  return accessToken
}

export function subscribeAccessToken(fn) {
  subscribers.add(fn)
  return () => subscribers.delete(fn)
}
