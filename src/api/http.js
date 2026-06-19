/**
 * SameMess frontend → backend HTTP client.
 *
 * Implements the rules from CURSOR_API_GUIDE.md:
 *  - Adds `Authorization: Bearer <accessToken>` to every request.
 *  - Sends cookies (`credentials: 'include'`) for refresh-token round trips.
 *  - On 401, transparently calls `/api/auth/refresh` once and retries the
 *    original request. If refresh itself fails, the access token is cleared
 *    and a `samemess:session-expired` event is dispatched on `window`.
 *  - Upload endpoints use `multipart/form-data` and never set Content-Type
 *    manually (the browser will inject the correct boundary).
 *  - 60s timeout — Render free tier may sleep and the first request can be
 *    slow. Caller may override per request via `timeoutMs`.
 */

import { API_BASE_URL } from './config.js'
import { ApiError, normalizeError } from './errors.js'
import { getAccessToken, setAccessToken } from './tokenStore.js'

// DEBUG_API is hard-coded to true so the dev / preview / production builds
// all surface request logs in the browser console. If the page is acting up,
// the user can copy these logs and we can debug without DevTools hunting.
// Set VITE_DEBUG_API=false in .env to silence.
const DEBUG_API =
  String(import.meta.env.VITE_DEBUG_API ?? 'true').toLowerCase() !== 'false'

let refreshInFlight = null
let refreshFailStreak = 0
let sessionExpiredNotified = false

function fmt(value) {
  try { return JSON.stringify(value, null, 2) } catch { return String(value) }
}

function safeJson(text) {
  try { return JSON.parse(text) } catch { return text }
}

function logRequest({ method, url, body, headers }) {
  // Always log via console.log so it survives any "Verbose/Info" filter.
  console.log(`[API →] ${method} ${url}`)
  if (DEBUG_API) {
    console.log('  headers:', headers)
    if (body !== undefined) console.log('  body:', fmt(body))
  }
}

function logResponse({ method, url, status, ms, data }) {
  const ok = status >= 200 && status < 300
  const tag = ok ? '✓' : '✗'
  console.log(`[API ${tag}] ${method} ${url} · ${status} · ${ms}ms`)
  if (DEBUG_API) console.log('  response:', fmt(data))
}

function logError({ method, url, message, status, code, details }) {
  console.warn(`[API ✗] ${method} ${url} · ${status || 'NETWORK'} · ${message}`)
  if (DEBUG_API && code) console.warn('  code:', code)
  if (DEBUG_API && details) console.warn('  details:', fmt(details))
}

function notifySessionExpired() {
  if (typeof window === 'undefined') return
  if (sessionExpiredNotified) return
  sessionExpiredNotified = true
  window.dispatchEvent(new CustomEvent('samemess:session-expired'))
  setTimeout(() => { sessionExpiredNotified = false }, 2000)
}

async function refreshAccessToken() {
  if (refreshInFlight) return refreshInFlight
  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      })
      const text = await res.text()
      const data = text ? safeJson(text) : null
      if (!res.ok) {
        refreshFailStreak += 1
        if (refreshFailStreak < 2) {
          throw new ApiError('Refresh thử lại', { status: res.status, code: 'REFRESH_TRANSIENT' })
        }
        throw new ApiError('Refresh token hết hạn', { status: res.status, code: 'REFRESH_FAILED' })
      }
      refreshFailStreak = 0
      const newToken = data?.accessToken ?? null
      if (newToken) setAccessToken(newToken)
      return { token: newToken, user: data?.user ?? null }
    } finally {
      refreshInFlight = null
    }
  })()
  return refreshInFlight
}

function buildHeaders(customHeaders, hasBody) {
  const headers = { Accept: 'application/json', ...customHeaders }
  if (hasBody && !headers['Content-Type'] && !(customHeaders && customHeaders['Content-Type'] === null)) {
    headers['Content-Type'] = 'application/json'
  }
  const token = getAccessToken()
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

function extractMessage(data, status) {
  if (data && typeof data === 'object') {
    if (data.message) return data.message
    if (data.error) return data.error
    if (data.detail) return data.detail
    if (data.title) return data.title
  }
  return `Lỗi máy chủ (${status})`
}

function throwHttpError({ method, url, status, data }) {
  const message = extractMessage(data, status)
  const err = new ApiError(message, {
    status,
    code: (data && typeof data === 'object' && data.code) || 'HTTP_ERROR',
    details: data,
  })
  logError({ method, url, message, status, code: err.code, details: data })

  // 403 on profile-dependent endpoints → event so UI can prompt the user
  if (status === 403 && (url.includes('/discovery') || url.includes('/swipes'))) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('samemess:profile-incomplete', { detail: { url } }))
    }
  }
  throw err
}

/**
 * @template T
 * @param {string} path
 * @param {RequestInit & { body?: any, _retried?: boolean, timeoutMs?: number, noContentType?: boolean }} [options]
 * @returns {Promise<T>}
 */
export async function request(path, options = {}) {
  if (!API_BASE_URL) {
    throw new ApiError('Chưa cấu hình VITE_API_BASE_URL trong .env', { code: 'NO_BASE_URL' })
  }

  const {
    body,
    headers: customHeaders,
    _retried,
    timeoutMs = 60_000,
    noContentType = false,
    ...rest
  } = options

  const hasJsonBody = body !== undefined && !(body instanceof FormData) && !noContentType
  const headers = buildHeaders(customHeaders, hasJsonBody)
  if (body instanceof FormData) {
    // let the browser set the boundary
    delete headers['Content-Type']
  }

  const method = (rest.method ?? 'GET').toUpperCase()
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`

  logRequest({ method, url, body, headers })

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  const t0 = performance.now()
  try {
    const res = await fetch(url, {
      ...rest,
      method,
      headers,
      credentials: 'include',
      body: body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
      signal: controller.signal,
    })

    const text = await res.text()
    const data = text ? safeJson(text) : null
    const ms = Math.round(performance.now() - t0)

    const token = getAccessToken()
    if (res.status === 401 && token && !_retried && !url.includes('/api/auth/')) {
      try {
        const refreshed = await refreshAccessToken()
        if (refreshed?.token) {
          return request(path, { ...options, _retried: true })
        }
      } catch (refreshErr) {
        if (refreshErr?.code === 'REFRESH_FAILED') {
          setAccessToken(null)
          notifySessionExpired()
        }
        const err = new ApiError('Phiên đăng nhập đã hết hạn', {
          status: 401,
          code: refreshErr?.code === 'REFRESH_FAILED' ? 'SESSION_EXPIRED' : 'REFRESH_TRANSIENT',
        })
        logError({ method, url, message: err.message, status: 401, code: err.code })
        throw err
      }
    }

    if (!res.ok) throwHttpError({ method, url, status: res.status, data })

    logResponse({ method, url, status: res.status, ms, data })
    return data
  } catch (err) {
    if (err instanceof ApiError) throw err
    if (err?.name === 'AbortError') {
      const e = new ApiError('Máy chủ phản hồi chậm (timeout). Vui lòng thử lại.', {
        code: 'TIMEOUT',
      })
      logError({ method, url, message: e.message, status: 0, code: e.code })
      throw e
    }
    const normalized = normalizeError(err)
    logError({ method, url, message: normalized.message, status: normalized.status, code: normalized.code })
    throw normalized
  } finally {
    clearTimeout(timer)
  }
}

export const get = (path, opts) => request(path, { ...opts, method: 'GET' })
export const post = (path, body, opts) => request(path, { ...opts, method: 'POST', body })
export const put = (path, body, opts) => request(path, { ...opts, method: 'PUT', body })
export const patch = (path, body, opts) => request(path, { ...opts, method: 'PATCH', body })
export const del = (path, opts) => request(path, { ...opts, method: 'DELETE' })

/**
 * Upload a FormData payload. Caller MUST NOT set Content-Type manually.
 * @template T
 * @param {string} path
 * @param {FormData} formData
 * @param {{ timeoutMs?: number }} [opts]
 * @returns {Promise<T>}
 */
export function upload(path, formData, opts = {}) {
  return request(path, {
    method: 'POST',
    body: formData,
    noContentType: true,
    ...opts,
  })
}
