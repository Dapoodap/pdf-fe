'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('PDFKU_theme') as Theme | null
    if (savedTheme) {
      setThemeState(savedTheme)
    }

    // Apply theme
    const applyTheme = () => {
      const htmlElement = document.documentElement
      const themeToApply = savedTheme === 'system' ? (
        window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      ) : savedTheme

      if (themeToApply === 'dark') {
        htmlElement.classList.add('dark')
        htmlElement.classList.remove('light')
        setIsDark(true)
      } else {
        htmlElement.classList.remove('dark')
        htmlElement.classList.add('light')
        setIsDark(false)
      }
    }

    applyTheme()

    // Listen to system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => applyTheme()
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('PDFKU_theme', newTheme)

    const htmlElement = document.documentElement
    const themeToApply = newTheme === 'system' ? (
      window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    ) : newTheme

    if (themeToApply === 'dark') {
      htmlElement.classList.add('dark')
      htmlElement.classList.remove('light')
      setIsDark(true)
    } else {
      htmlElement.classList.remove('dark')
      htmlElement.classList.add('light')
      setIsDark(false)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
