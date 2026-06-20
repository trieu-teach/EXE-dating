import { createContext, useContext, useEffect } from 'react'

// App chỉ dùng chế độ SÁNG (light). Dark mode đã bị gỡ.
const ThemeContext = createContext({ theme: 'light', isDark: false, setTheme: () => {}, toggle: () => {} })

export function ThemeProvider({ children }) {
  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = 'light'
    root.style.colorScheme = 'light'
    try { localStorage.setItem('samemess_theme', 'light') } catch { /* ignore */ }
  }, [])

  return (
    <ThemeContext.Provider value={{ theme: 'light', isDark: false, setTheme: () => {}, toggle: () => {} }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
