import { API_BASE_URL, USE_MOCK_API } from './config.js'
import { ApiError, normalizeError } from './errors.js'
import { getAccessToken } from '../utils/session.js'

/**
 * @template T
 * @param {string} path - path tương đối, ví dụ `/discovery/feed`
 * @param {RequestInit & { body?: object }} [options]
 * @returns {Promise<T>}
 */
export async function request(path, options = {}) {
  const { body, headers: customHeaders, ...rest } = options
  const headers = {
    Accept: 'application/json',
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...customHeaders,
  }

  const token = getAccessToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`

  if (!API_BASE_URL && !USE_MOCK_API) {
    throw new ApiError('Chưa cấu hình VITE_API_BASE_URL.', { code: 'NO_BASE_URL' })
  }

  try {
    const res = await fetch(url, {
      ...rest,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    const text = await res.text()
    let data = null
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = text
      }
    }

    if (!res.ok) {
      const message =
        (data && typeof data === 'object' && (data.message || data.error)) ||
        `Lỗi máy chủ (${res.status})`
      throw new ApiError(message, {
        status: res.status,
        code: data?.code || 'HTTP_ERROR',
        details: data,
      })
    }

    return data
  } catch (err) {
    throw normalizeError(err)
  }
}

export function get(path) {
  return request(path, { method: 'GET' })
}

export function post(path, body) {
  return request(path, { method: 'POST', body })
}

export function put(path, body) {
  return request(path, { method: 'PUT', body })
}

export function patch(path, body) {
  return request(path, { method: 'PATCH', body })
}

export function del(path) {
  return request(path, { method: 'DELETE' })
}

/**
 * Gọi API thật; nếu mock bật hoặc lỗi mạng thì fallback mockFn
 * @template T
 */
export async function withMockFallback(apiFn, mockFn) {
  if (USE_MOCK_API || !API_BASE_URL) {
    return mockFn()
  }
  try {
    return await apiFn()
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[API] Fallback mock:', err.message)
    }
    return mockFn()
  }
}
