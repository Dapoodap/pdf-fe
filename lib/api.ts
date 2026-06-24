// All API calls go through the Next.js server-side proxy so the API key
// is never exposed in the browser bundle.
const PROXY_BASE = '/api/proxy'

// ─── Token Helpers ───────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('PDFKU_token')
}

export function setToken(token: string): void {
  localStorage.setItem('PDFKU_token', token)
}

export function removeToken(): void {
  localStorage.removeItem('PDFKU_token')
}

// ─── JWT Decode (simple base64 decode) ───────────────────────────────────────

export function decodeToken(token: string): Record<string, any> | null {
  try {
    const payload = token.split('.')[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

// ─── Generic API Request ─────────────────────────────────────────────────────

interface ApiRequestOptions {
  method?: string
  headers?: Record<string, string>
  body?: any
  isFormData?: boolean
  isUrlEncoded?: boolean
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { method = 'GET', headers = {}, body, isFormData = false, isUrlEncoded = false } = options

  const token = getToken()
  const requestHeaders: Record<string, string> = { ...headers }

  // Bearer token is forwarded to the proxy, which injects the API key server-side
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`
  }

  if (!isFormData && !isUrlEncoded && body) {
    requestHeaders['Content-Type'] = 'application/json'
  }

  if (isUrlEncoded) {
    requestHeaders['Content-Type'] = 'application/x-www-form-urlencoded'
  }

  let requestBody: any = body
  if (!isFormData && !isUrlEncoded && body) {
    requestBody = JSON.stringify(body)
  }

  // Route through Next.js server-side proxy — API key injected there, not here
  const proxyEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const response = await fetch(`${PROXY_BASE}${proxyEndpoint}`, {
    method,
    headers: requestHeaders,
    body: requestBody,
  })

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`
    try {
      const errorData = await response.json()
      console.error('API Error Response:', errorData)
      errorMessage = errorData.detail || errorData.message || errorData.error || errorMessage
      if (errorData.details) {
        errorMessage += ` (${errorData.details})`
      }
    } catch {
      // ignore parse error
    }
    throw new Error(errorMessage)
  }

  return response.json()
}

// ─── Auth API ────────────────────────────────────────────────────────────────

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface RegisterResponse {
  message: string
}

export async function loginApi(username: string, password: string): Promise<LoginResponse> {
  const body = new URLSearchParams({ username, password })
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: body.toString(),
    isUrlEncoded: true,
  })
}

export async function registerApi(
  username: string,
  password: string,
  email: string
): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: { username, password, email },
  })
}

export interface UserProfile {
  id: number
  username: string
  email: string
  membership_status?: string
  subscription_start_date?: string
  subscription_end_date?: string
  total_files_processed?: number
}

export async function getMeApi(): Promise<UserProfile> {
  return apiRequest<UserProfile>('/auth/me', {
    method: 'GET',
  })
}

// ─── Pricing & Subscription API ───────────────────────────────────────────────

export interface PricingPlan {
  id: number
  price: number
  description: string
  plan_type: string
  duration_days: number
}

export interface SubscribeResponse {
  message: string
  transaction_id: number
  subscription_id: number
  start_date: string
  end_date: string
}

export async function getPricingPlans(): Promise<PricingPlan[]> {
  return apiRequest<PricingPlan[]>('/pricing/')
}

export async function subscribeApi(
  pricing_id: number,
  midtrans_result: any,
  order_id: string
): Promise<SubscribeResponse> {
  return apiRequest<SubscribeResponse>('/transaction/subscribe', {
    method: 'POST',
    body: {
      pricing_id,
      order_id,
      transaction_id: midtrans_result.transaction_id,
      payment_type: midtrans_result.payment_type,
      transaction_status: midtrans_result.transaction_status,
      gross_amount: parseFloat(midtrans_result.gross_amount) || undefined,
    },
  })
}

// ─── History API ─────────────────────────────────────────────────────────────

export interface HistoryItem {
  id: number
  service_id: number
  file_name: string
  file_type: string
  created_at: string
}

export interface DownloadUrlResponse {
  url: string
  expires_in: string
  file_name: string
}

export async function getUserHistory(): Promise<HistoryItem[]> {
  return apiRequest<HistoryItem[]>('/history/me')
}

export async function getDownloadUrl(historyId: number): Promise<DownloadUrlResponse> {
  return apiRequest<DownloadUrlResponse>(`/history/${historyId}/download-url`)
}

// ─── PDF Manipulation API ────────────────────────────────────────────────────

export interface ManipulationResponse {
  message: string
  history_id: number
  file_path: string
  file_name: string
  download_url: string
}

export async function mergePdfs(
  files: File[],
  rotations?: number[]
): Promise<ManipulationResponse> {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  if (rotations) {
    formData.append('rotations', JSON.stringify(rotations))
  }
  return apiRequest<ManipulationResponse>('/manipulate/merge', {
    method: 'POST',
    body: formData,
    isFormData: true,
  })
}

export async function rotatePdf(
  file: File,
  degrees: number,
  pages?: number[]
): Promise<ManipulationResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('degrees', degrees.toString())
  if (pages) {
    formData.append('pages', JSON.stringify(pages))
  }
  return apiRequest<ManipulationResponse>('/manipulate/rotate', {
    method: 'POST',
    body: formData,
    isFormData: true,
  })
}

export async function reorderPdf(
  file: File,
  pages: number[]
): Promise<ManipulationResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('pages', JSON.stringify(pages))
  return apiRequest<ManipulationResponse>('/manipulate/order', {
    method: 'POST',
    body: formData,
    isFormData: true,
  })
}

export async function lockPdf(
  file: File,
  password: string
): Promise<ManipulationResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('password', password)
  return apiRequest<ManipulationResponse>('/manipulate/lock', {
    method: 'POST',
    body: formData,
    isFormData: true,
  })
}

export async function signPdf(
  file: File,
  signature: File,
  page: number,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<ManipulationResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('signature', signature)
  formData.append('signature_details', JSON.stringify({
    page: page,
    x: x,
    y: y,
    width: width,
    height: height
  }))

  return apiRequest<ManipulationResponse>('/manipulate/sign', {
    method: 'POST',
    body: formData,
    isFormData: true,
  })
}

// ─── PDF Conversion API ─────────────────────────────────────────────────────

export async function pdfToImages(file: File): Promise<ManipulationResponse> {
  const formData = new FormData()
  formData.append('file', file)
  return apiRequest<ManipulationResponse>('/convert/pdf-to-images', {
    method: 'POST',
    body: formData,
    isFormData: true,
  })
}

export async function pdfToDocx(file: File): Promise<ManipulationResponse> {
  const formData = new FormData()
  formData.append('file', file)
  return apiRequest<ManipulationResponse>('/convert/pdf-to-docx', {
    method: 'POST',
    body: formData,
    isFormData: true,
  })
}

export async function pdfToXlsx(file: File): Promise<ManipulationResponse> {
  const formData = new FormData()
  formData.append('file', file)
  return apiRequest<ManipulationResponse>('/convert/pdf-to-xlsx', {
    method: 'POST',
    body: formData,
    isFormData: true,
  })
}

export async function pdfToPptx(file: File): Promise<ManipulationResponse> {
  const formData = new FormData()
  formData.append('file', file)
  return apiRequest<ManipulationResponse>('/convert/pdf-to-pptx', {
    method: 'POST',
    body: formData,
    isFormData: true,
  })
}

export async function anyToPdf(file: File): Promise<ManipulationResponse> {
  const formData = new FormData()
  formData.append('file', file)
  return apiRequest<ManipulationResponse>('/convert/to-pdf', {
    method: 'POST',
    body: formData,
    isFormData: true,
  })
}

// ─── Service API ─────────────────────────────────────────────────────────────

export interface ApiService {
  id: number
  name: string
  description: string
}

export async function getServices(): Promise<ApiService[]> {
  return apiRequest<ApiService[]>('/services')
}

// ─── Service Metadata Map ──────────────────────────────────────────────────

export interface ServiceMetadata {
  title: string
  category: 'manipulation' | 'conversion'
  href: string
  publicHref: string // SEO root landing page href
  icon: string // lucide icon name
  color: string // tailwind gradient
  features: string[]
}

export const SERVICE_METADATA: Record<string, ServiceMetadata> = {
  'merge': {
    title: 'Merge PDFs',
    category: 'manipulation',
    href: '/dashboard/merge',
    publicHref: '/merge',
    icon: 'Combine',
    color: 'from-blue-500 to-blue-600',
    features: ['Drag and drop ordering', 'Batch processing', 'Optional per-file rotation', 'Maintain formatting'],
  },
  'rotate': {
    title: 'Rotate PDF',
    category: 'manipulation',
    href: '/dashboard/rotate',
    publicHref: '/rotate',
    icon: 'RotateCw',
    color: 'from-emerald-500 to-emerald-600',
    features: ['Rotate 90°, 180°, or 270°', 'Select specific pages', 'Rotate all pages at once', 'Instant preview'],
  },
  'order': {
    title: 'Reorder Pages',
    category: 'manipulation',
    href: '/dashboard/reorder',
    publicHref: '/reorder',
    icon: 'ArrowUpDown',
    color: 'from-violet-500 to-violet-600',
    features: ['Custom page order', 'Extract specific pages', 'Remove unwanted pages', 'Create subsets'],
  },
  'lock': {
    title: 'Lock PDF',
    category: 'manipulation',
    href: '/dashboard/lock',
    publicHref: '/lock',
    icon: 'Lock',
    color: 'from-rose-500 to-rose-600',
    features: ['Password protection', 'AES encryption', 'Secure sharing', 'Industry standard'],
  },
  'sign': {
    title: 'Sign PDF',
    category: 'manipulation',
    href: '/dashboard/sign',
    publicHref: '/sign',
    icon: 'PenTool',
    color: 'from-pink-500 to-pink-600',
    features: ['Drag & Drop signature', 'Precise positioning', 'Secure embedding', 'Visual preview'],
  },
  'pdf-to-images': {
    title: 'PDF to Images',
    category: 'conversion',
    href: '/dashboard/convert?type=pdf-to-images',
    publicHref: '/pdf-to-images',
    icon: 'Image',
    color: 'from-amber-500 to-amber-600',
    features: ['High quality PNG output', 'Multi-page to ZIP', 'Single page to PNG', 'Fast conversion'],
  },
  'pdf-to-docx': {
    title: 'PDF to Word',
    category: 'conversion',
    href: '/dashboard/convert?type=pdf-to-docx',
    publicHref: '/pdf-to-word',
    icon: 'FileText',
    color: 'from-sky-500 to-sky-600',
    features: ['Editable Word output', 'Preserve formatting', 'Table extraction', 'Image retention'],
  },
  'pdf-to-xlsx': {
    title: 'PDF to Excel',
    category: 'conversion',
    href: '/dashboard/convert?type=pdf-to-xlsx',
    publicHref: '/pdf-to-excel',
    icon: 'Table',
    color: 'from-green-500 to-green-600',
    features: ['Table detection', 'Multiple sheets', 'Data accuracy', 'Formula-ready'],
  },
  'pdf-to-pptx': {
    title: 'PDF to PowerPoint',
    category: 'conversion',
    href: '/dashboard/convert?type=pdf-to-pptx',
    publicHref: '/pdf-to-powerpoint',
    icon: 'Presentation',
    color: 'from-orange-500 to-orange-600',
    features: ['Slide conversion', 'Layout preservation', 'Image quality', 'Editable slides'],
  },
  'to-pdf': {
    title: 'Convert to PDF',
    category: 'conversion',
    href: '/dashboard/convert?type=to-pdf',
    publicHref: '/to-pdf',
    icon: 'FileOutput',
    color: 'from-purple-500 to-purple-600',
    features: ['PNG, JPG, JPEG support', 'DOCX, XLSX, PPTX support', 'Quality preservation', 'Fast processing'],
  },
}

