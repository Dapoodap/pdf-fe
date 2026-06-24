'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { setToken } from '@/lib/api'
import { useAuth } from '@/context/auth-context'
import { Loader2 } from 'lucide-react'

function AuthSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshUser } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    
    const handleAuth = async () => {
      if (token) {
        // Save the token manually
        setToken(token)
        // Refresh the user profile in AuthContext
        await refreshUser()
        // Go to dashboard
        router.push('/dashboard')
      } else {
        // If no token, go to login
        router.push('/login?error=Authentication_Failed')
      }
    }

    handleAuth()
  }, [searchParams, router, refreshUser])

  return null
}

export default function AuthSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <h1 className="text-xl font-bold">Authenticating...</h1>
        <p className="text-sm text-muted-foreground">Please wait while we log you in.</p>
        <Suspense fallback={null}>
          <AuthSuccessContent />
        </Suspense>
      </div>
    </div>
  )
}
