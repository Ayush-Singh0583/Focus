import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('focusly_theme') || 'dark')

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      document.body.style.setProperty('--toast-bg', '#1e1e24')
      document.body.style.setProperty('--toast-color', '#f0f0f5')
      document.body.style.setProperty('--toast-border', 'rgba(255,255,255,0.1)')
    } else {
      root.classList.remove('dark')
      document.body.style.setProperty('--toast-bg', '#ffffff')
      document.body.style.setProperty('--toast-color', '#1a1a2e')
      document.body.style.setProperty('--toast-border', 'rgba(0,0,0,0.1)')
    }
    localStorage.setItem('focusly_theme', theme)
  }, [theme])

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, toggle, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
