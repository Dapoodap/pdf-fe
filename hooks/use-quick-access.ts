'use client'

import { useState, useEffect } from 'react'

const QUICK_ACCESS_KEY = 'PDFKU_quick_access'

export function useQuickAccess(defaultServices: string[] = []) {
  const [quickAccess, setQuickAccess] = useState<string[]>([])
  const [isMounted, setIsMounted] = useState(false)

  // Load from local storage on mount
  useEffect(() => {
    setIsMounted(true)
    try {
      const stored = localStorage.getItem(QUICK_ACCESS_KEY)
      if (stored) {
        setQuickAccess(JSON.parse(stored))
      } else {
        setQuickAccess(defaultServices)
      }
    } catch (e) {
      setQuickAccess(defaultServices)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Save to local storage whenever it changes
  const updateQuickAccess = (services: string[]) => {
    setQuickAccess(services)
    try {
      localStorage.setItem(QUICK_ACCESS_KEY, JSON.stringify(services))
    } catch (e) {
      console.error('Failed to save quick access preferences')
    }
  }

  return { quickAccess, updateQuickAccess, isMounted }
}
