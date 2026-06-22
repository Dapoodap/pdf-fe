'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  loginApi,
  registerApi,
  setToken,
  getToken,
  removeToken,
  getMeApi,
  type UserProfile
} from '@/lib/api'

interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string, email: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    const token = getToken()
    if (token) {
      try {
        const profile = await getMeApi()
        setUser(profile)
      } catch (err) {
        removeToken()
      }
    }
    setLoading(false)
  }

  // Load user from API on mount using the token
  useEffect(() => {
    fetchUser()
  }, [])

  const login = async (username: string, password: string) => {
    const response = await loginApi(username, password)
    setToken(response.access_token)
    try {
      const profile = await getMeApi()
      setUser(profile)
    } catch (err) {
      removeToken()
      throw new Error('Failed to fetch user profile after login')
    }
  }

  const register = async (username: string, password: string, email: string) => {
    await registerApi(username, password, email)
    // Auto-login after successful registration
    await login(username, password)
  }

  const logout = () => {
    setUser(null)
    removeToken()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser: fetchUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
