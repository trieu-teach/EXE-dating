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

/**
 * Parse a backend datetime an toàn theo UTC.
 * Backend (Npgsql legacy timestamp) trả về chuỗi KHÔNG có 'Z' (vd "2026-06-21T10:00:00")
 * → `new Date()` hiểu nhầm là giờ máy (local) gây lệch +7h ở VN. Ta thêm 'Z' để ép UTC.
 */
export function toDate(iso) {
  if (!iso) return null
  if (typeof iso === 'string') {
    const s = iso.trim()
    // Có dạng ISO không kèm timezone (không 'Z', không +hh:mm) → coi là UTC
    if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(s) && !/[zZ]|[+-]\d{2}:?\d{2}$/.test(s)) {
      const d = new Date(s.replace(' ', 'T') + 'Z')
      if (!Number.isNaN(d.getTime())) return d
    }
  }
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

/** Giờ:phút theo múi giờ VN (cho tin nhắn). */
export function formatTime(iso) {
  const d = toDate(iso)
  if (!d) return ''
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

/** Format an ISO date string as `DD/MM/YYYY`. */
export function formatDate(iso) {
  const d = toDate(iso)
  if (!d) return ''
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** Relative time like "vừa xong", "5 phút trước", "hôm qua". */
export function timeAgo(iso) {
  const d = toDate(iso)
  if (!d) return ''
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
