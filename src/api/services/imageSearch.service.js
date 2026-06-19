/**
 * Optional Google Custom Search helper.
 * Used as a fallback for image suggestions when the user has no photo.
 */

import { GOOGLE_CSE_KEY, GOOGLE_CSE_CX } from '../config.js'

export const imageSearchService = {
  isConfigured() {
    return Boolean(GOOGLE_CSE_KEY && GOOGLE_CSE_CX)
  },

  async search(query, { limit = 6 } = {}) {
    if (!this.isConfigured()) return []
    const url = new URL('https://www.googleapis.com/customsearch/v1')
    url.searchParams.set('key', GOOGLE_CSE_KEY)
    url.searchParams.set('cx', GOOGLE_CSE_CX)
    url.searchParams.set('q', query)
    url.searchParams.set('searchType', 'image')
    url.searchParams.set('num', String(Math.min(10, Math.max(1, limit))))
    const res = await fetch(url.toString())
    if (!res.ok) return []
    const data = await res.json()
    return (data.items ?? []).map((it) => it.link).filter(Boolean)
  },
}
