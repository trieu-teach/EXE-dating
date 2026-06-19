/**
 * Safely resolve an image URL.
 *
 * CURSOR_API_GUIDE.md §3: the `url` returned by the backend is an absolute
 * Cloudinary / randomuser URL — we MUST NOT prepend our API base URL.
 * Older payloads, however, may still return relative paths. To stay
 * resilient we check explicitly and only prefix when the value looks
 * like a relative path.
 */
export function resolveImageUrl(value) {
  if (!value || typeof value !== 'string') return ''
  const v = value.trim()
  if (!v) return ''
  if (v.startsWith('http://') || v.startsWith('https://') || v.startsWith('data:') || v.startsWith('blob:')) {
    return v
  }
  // relative path
  if (v.startsWith('/')) return v
  return v
}

/** Compute a human-readable distance in km. */
export function formatDistance(km) {
  if (km === null || km === undefined || Number.isNaN(Number(km))) return ''
  const n = Number(km)
  if (n < 1) return `${Math.round(n * 1000)} m`
  if (n < 10) return `${n.toFixed(1)} km`
  return `${Math.round(n)} km`
}

/** Format an ISO date string as `DD/MM/YYYY`. */
export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** Relative time like "vừa xong", "5 phút trước", "hôm qua". */
export function timeAgo(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const diff = Date.now() - d.getTime()
  const min = Math.floor(diff / 60_000)
  if (min < 1) return 'vừa xong'
  if (min < 60) return `${min} phút trước`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} giờ trước`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day} ngày trước`
  return formatDate(iso)
}
