'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  name: string
  plan: 'free' | 'premium'
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('pdfkit_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        localStorage.removeItem('pdfkit_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))

    // Dummy validation
    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    // Create dummy user
    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      name: email.split('@')[0],
      plan: 'free',
    }

    setUser(newUser)
    localStorage.setItem('pdfkit_user', JSON.stringify(newUser))
  }

  const register = async (email: string, password: string, name: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))

    // Dummy validation
    if (!email || !password || !name) {
      throw new Error('All fields are required')
    }

    // Create dummy user
    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      name,
      plan: 'free',
    }

    setUser(newUser)
    localStorage.setItem('pdfkit_user', JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('pdfkit_user')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
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
