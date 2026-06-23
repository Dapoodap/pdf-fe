'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getServices, type ApiService } from '@/lib/api'
import { useAuth } from './auth-context'

interface ServicesContextType {
  services: ApiService[]
  loading: boolean
  error: string | null
  refreshServices: () => Promise<void>
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined)

export function ServicesProvider({ children }: { children: React.ReactNode }) {
  const [services, setServices] = useState<ApiService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()

  const fetchServices = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getServices()
      setServices(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services')
    } finally {
      setLoading(false)
    }
  }

  // Fetch services immediately so guest pages can also access the list
  useEffect(() => {
    fetchServices()
  }, [])

  return (
    <ServicesContext.Provider value={{ services, loading, error, refreshServices: fetchServices }}>
      {children}
    </ServicesContext.Provider>
  )
}

export function useServices() {
  const context = useContext(ServicesContext)
  if (context === undefined) {
    throw new Error('useServices must be used within a ServicesProvider')
  }
  return context
}
