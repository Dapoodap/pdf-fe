import { NextResponse } from 'next/server'
import { GOOGLE_CONFIG } from '@/lib/google-config'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const origin = url.origin
  
  const redirectUri = `${origin}${GOOGLE_CONFIG.redirectUriPath}`
  
  const authParams = new URLSearchParams({
    client_id: GOOGLE_CONFIG.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent'
  })

  return NextResponse.redirect(`${GOOGLE_CONFIG.authUri}?${authParams.toString()}`)
}
