export class ApiError extends Error {
  constructor(message, { status = 0, code = 'UNKNOWN', details = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export function normalizeError(err) {
  if (err instanceof ApiError) return err
  if (err?.name === 'AbortError') {
    return new ApiError('Yêu cầu đã bị hủy.', { code: 'ABORTED' })
  }
  return new ApiError(err?.message || 'Không thể kết nối máy chủ.', { code: 'NETWORK' })
}
