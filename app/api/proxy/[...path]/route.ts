import { NextRequest, NextResponse } from 'next/server'

// BACKEND_URL: server-only env var — never sent to browser.
// Points to the backend address reachable from inside the Docker container.
// e.g.  http://host.docker.internal:8000  (Docker Desktop on Windows/Mac)
//       http://172.17.0.1:8000            (Linux Docker)
//       http://localhost:8000             (running outside Docker)
const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Read API key from server-side env (no NEXT_PUBLIC_ prefix = never sent to browser)
const API_KEY = process.env.API_KEY || ''

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await params)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await params)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await params)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, await params)
}

async function proxyRequest(req: NextRequest, params: { path: string[] }) {
  const path = params.path.join('/')
  const url = new URL(`/${path}`, BACKEND_URL)

  // Forward query parameters
  req.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value)
  })

  const headers = new Headers()

  // Inject API key server-side — never exposed to the browser
  if (API_KEY) {
    headers.set('x-api-key', API_KEY)
  }

  // Forward Authorization (Bearer token from client)
  const authHeader = req.headers.get('authorization')
  if (authHeader) {
    headers.set('authorization', authHeader)
  }

  // Forward Content-Type for non-FormData requests
  const contentType = req.headers.get('content-type')
  if (contentType && !contentType.includes('multipart/form-data')) {
    headers.set('content-type', contentType)
  }

  let body: BodyInit | null = null
  const method = req.method

  if (method !== 'GET' && method !== 'HEAD') {
    if (contentType?.includes('multipart/form-data')) {
      // For FormData, pass raw body without content-type so browser boundary is respected
      body = await req.blob()
    } else {
      body = await req.text()
    }
  }

  try {
    const backendResponse = await fetch(url.toString(), {
      method,
      headers,
      body,
      // @ts-expect-error - duplex needed for streaming body in Node 18+
      duplex: 'half',
    })

    const responseHeaders = new Headers()
    backendResponse.headers.forEach((value, key) => {
      // Don't forward hop-by-hop headers
      if (!['connection', 'keep-alive', 'transfer-encoding'].includes(key.toLowerCase())) {
        responseHeaders.set(key, value)
      }
    })

    const responseBody = await backendResponse.arrayBuffer()
    return new NextResponse(responseBody, {
      status: backendResponse.status,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error(`[Proxy] Failed to reach backend at ${url}:`, error)
    return NextResponse.json(
      { error: 'Unable to reach the API server. Please try again later.' },
      { status: 503 }
    )
  }
}
