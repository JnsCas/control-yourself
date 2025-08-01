'use client'

import { useTheme } from 'next-themes'

export function useThemeHook() {
  const { theme, setTheme, systemTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light')
    } else {
      setTheme('dark')
    }
  }

  const currentTheme = theme === 'system' ? systemTheme : theme

  return {
    theme,
    systemTheme,
    currentTheme,
    setTheme,
    toggleTheme,
  }
}
