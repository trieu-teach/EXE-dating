import { IMAGE_LIBRARY } from '../../data/imageLibrary.js'

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_CSE_KEY ?? ''
const GOOGLE_CX = import.meta.env.VITE_GOOGLE_CSE_CX ?? ''

function delay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms))
}

function normalizeQuery(q) {
  return q.trim().toLowerCase()
}

export function searchImageLibrary(query = '') {
  const q = normalizeQuery(query)
  if (!q) return IMAGE_LIBRARY

  return IMAGE_LIBRARY.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      item.tags.some((tag) => tag.includes(q) || q.includes(tag)),
  )
}

export function getGoogleImageSearchUrl(query) {
  const q = encodeURIComponent(query.trim() || 'portrait photography')
  return `https://www.google.com/search?tbm=isch&q=${q}&safe=active`
}

export async function searchGoogleImages(query, { limit = 12 } = {}) {
  const q = query.trim()
  if (!q) return { results: [], fromApi: false, fallbackUrl: getGoogleImageSearchUrl('') }

  if (!GOOGLE_KEY || !GOOGLE_CX) {
    await delay(300)
    const local = searchImageLibrary(q).map((item) => ({
      id: item.id,
      url: item.url,
      thumb: `${item.url}&w=320`,
      title: item.label,
      source: 'library',
    }))
    return {
      results: local.slice(0, limit),
      fromApi: false,
      fallbackUrl: getGoogleImageSearchUrl(q),
      message:
        'Chưa cấu hình Google API — hiển thị ảnh thư viện tương tự. Bạn có thể mở Google Images hoặc thêm VITE_GOOGLE_CSE_KEY trong .env.',
    }
  }

  try {
    const params = new URLSearchParams({
      key: GOOGLE_KEY,
      cx: GOOGLE_CX,
      q,
      searchType: 'image',
      num: String(Math.min(10, limit)),
      safe: 'active',
    })
    const res = await fetch(`https://www.googleapis.com/customsearch/v1?${params}`)
    if (!res.ok) throw new Error('Google search failed')
    const data = await res.json()
    const results = (data.items ?? []).map((item, i) => ({
      id: `google-${i}-${item.link?.slice(-8) ?? i}`,
      url: item.link,
      thumb: item.image?.thumbnailLink ?? item.link,
      title: item.title ?? q,
      source: 'google',
    }))
    return { results, fromApi: true, fallbackUrl: getGoogleImageSearchUrl(q) }
  } catch {
    const local = searchImageLibrary(q).map((item) => ({
      id: item.id,
      url: item.url,
      thumb: `${item.url}&w=320`,
      title: item.label,
      source: 'library',
    }))
    return {
      results: local.slice(0, limit),
      fromApi: false,
      fallbackUrl: getGoogleImageSearchUrl(q),
      message: 'Không kết nối được Google — dùng ảnh thư viện thay thế.',
    }
  }
}
