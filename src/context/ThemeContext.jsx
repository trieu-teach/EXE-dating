import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { getTheme, setTheme as persistTheme } from '../utils/theme.js'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getTheme)

  const setTheme = useCallback((next) => {
    setThemeState(persistTheme(next))
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((current) => persistTheme(current === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return ctx
}
