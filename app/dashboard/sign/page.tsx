'use client'

import dynamic from 'next/dynamic'
import { useAuth } from '@/context/auth-context'

const SignTool = dynamic(() => import('@/components/tools/SignTool').then(mod => mod.SignTool), { ssr: false })

export default function SignPage() {
  const { user, loading } = useAuth()
  
  if (loading) return null

  return <SignTool isGuest={!user} />
}
