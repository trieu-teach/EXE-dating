const STORAGE_KEY = 'samemess_admin'

export function getAdmin() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveAdmin(partial) {
  const current = getAdmin() ?? {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...partial }))
}

export function clearAdmin() {
  localStorage.removeItem(STORAGE_KEY)
}

export function getAdminToken() {
  return getAdmin()?.token ?? null
}

export function isAdminLoggedIn() {
  return Boolean(getAdminToken())
}

export function hasAdminRole(...roles) {
  const admin = getAdmin()
  if (!admin) return false
  if (!roles.length) return true
  return roles.includes(admin.role)
}
