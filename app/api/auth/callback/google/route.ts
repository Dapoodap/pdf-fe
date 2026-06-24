import { NextResponse } from 'next/server'
import { GOOGLE_CONFIG } from '@/lib/google-config'
import { PROXY_BASE } from '@/lib/api' // using the same API base to hit FastAPI

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${url.origin}/login?error=${encodeURIComponent(error)}`)
  }

  if (!code) {
    return NextResponse.redirect(`${url.origin}/login?error=no_code_provided`)
  }

  try {
    const redirectUri = `${url.origin}${GOOGLE_CONFIG.redirectUriPath}`

    // 1. Exchange code for Google ID token
    const tokenResponse = await fetch(GOOGLE_CONFIG.tokenUri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CONFIG.clientId,
        client_secret: GOOGLE_CONFIG.clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const err = await tokenResponse.text()
      console.error("Google Token Error:", err)
      throw new Error("Failed to exchange Google token")
    }

    const tokenData = await tokenResponse.json()
    const idToken = tokenData.id_token

    if (!idToken) {
      throw new Error("No id_token received from Google")
    }

    // 2. Send ID token to our FastAPI backend
    // Warning: On server side (Next.js route handler), we must reach the actual backend URL.
    // If we are in Docker, we might need a different URL. 
    // We will use the standard endpoint and let fetch route it, but if PROXY_BASE is relative, it will fail.
    // In server components/routes, we need the absolute URL. Let's try to construct it or use localhost:8000.
    
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    
    const beResponse = await fetch(`${backendUrl}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: idToken }),
    })

    if (!beResponse.ok) {
      const errText = await beResponse.text()
      console.error("Backend Auth Error:", errText)
      throw new Error("Backend authentication failed")
    }

    const beData = await beResponse.json()
    const internalAccessToken = beData.access_token

    // 3. Redirect to a client-side success page to store the token in localStorage
    return NextResponse.redirect(`${url.origin}/auth/success?token=${encodeURIComponent(internalAccessToken)}`)
    
  } catch (err: any) {
    console.error("Google Auth Callback Error:", err)
    return NextResponse.redirect(`${url.origin}/login?error=${encodeURIComponent(err.message)}`)
  }
}
