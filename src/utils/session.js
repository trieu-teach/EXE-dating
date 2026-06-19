/**
 * Lightweight localStorage persistence for non-secret user metadata.
 *
 * The access token itself lives in the in-memory `tokenStore` (see
 * `api/tokenStore.js`). Refresh tokens are HttpOnly cookies set by the
 * server, so we never touch them here. We only persist the public user
 * profile (id, displayName, email, avatar) so the UI can greet the user
 * immediately on hard refresh.
 */

const STORAGE_KEY = 'samemess_user'

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function write(value) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    /* ignore quota / private mode */
  }
}

export function getUser() {
  return read()
}

export function saveUser(partial) {
  const current = read() ?? {}
  write({ ...current, ...partial })
}

export function clearUser() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
