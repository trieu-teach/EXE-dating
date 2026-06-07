const STORAGE_KEY = 'samemess_theme'

export const THEMES = ['light', 'dark']

export function getTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (THEMES.includes(saved)) return saved
  } catch {
    /* ignore */
  }
  return 'light'
}

export function applyTheme(theme) {
  const resolved = THEMES.includes(theme) ? theme : 'light'
  document.documentElement.setAttribute('data-theme', resolved)
  document.documentElement.style.colorScheme = resolved

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute('content', resolved === 'dark' ? '#141014' : '#fdf2f6')
  }

  return resolved
}

export function setTheme(theme) {
  const resolved = applyTheme(theme)
  try {
    localStorage.setItem(STORAGE_KEY, resolved)
  } catch {
    /* ignore */
  }
  return resolved
}

/** Gọi trước React render để tránh nháy sáng */
export function initTheme() {
  return applyTheme(getTheme())
}
