const STORAGE_KEY = 'samemess_user'

export function getUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveUser(partial) {
  const current = getUser() ?? {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...partial }))
}

export function markOnboarded() {
  saveUser({ onboarded: true })
}

export function isOnboarded() {
  return Boolean(getUser()?.onboarded)
}

export function clearUser() {
  localStorage.removeItem(STORAGE_KEY)
}

export function getAccessToken() {
  return getUser()?.token ?? null
}

export function saveToken(token) {
  saveUser({ token })
}
