/**
 * Read / write the user's selected interest ids to localStorage so that
 * half-completed onboarding flows don't lose state on hard refresh.
 *
 * Source of truth still lives on the server (`PUT /api/settings/interests`).
 * This cache is only used between the moment we load `/api/search/filters`
 * and the moment we send the PUT.
 */

const KEY = 'samemess_interests_v1'

export function readCachedInterestIds() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function writeCachedInterestIds(ids) {
  try {
    localStorage.setItem(KEY, JSON.stringify(Array.isArray(ids) ? ids : []))
  } catch {
    /* ignore */
  }
}

export function clearCachedInterestIds() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
