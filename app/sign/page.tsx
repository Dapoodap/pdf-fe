'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useAuth } from '@/context/auth-context'

const SignTool = dynamic(() => import('@/components/tools/SignTool').then(mod => mod.SignTool), { ssr: false })
import { PenTool, ArrowRight } from 'lucide-react'
import { PublicNavbar } from '@/components/public-navbar'

export default function SignLandingPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNavbar />

      {/* SEO Hero Section */}
      <section className="border-b border-border bg-card px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 shadow-lg">
            <PenTool size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Sign PDF Documents Online
          </h1>
          <p className="text-lg text-muted-foreground">
            Easily drag and drop your signature visually onto any PDF document. 
            Perfect for contracts, forms, and approvals.
          </p>
        </div>
      </section>

      {/* Tool Section */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {isAuthenticated ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-lg">
              <h2 className="mb-4 text-2xl font-bold">Ready to sign your files?</h2>
              <p className="mb-8 text-muted-foreground">
                You are logged in. Head over to your dashboard to process files without limits and save them to your history.
              </p>
              <Link
                href="/dashboard/sign"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90 hover:shadow-xl"
              >
                Go to Dashboard to Sign PDF <ArrowRight size={24} />
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-2 shadow-xl sm:p-4">
              <SignTool isGuest={true} />
            </div>
          )}
        </div>
      </section>

      {/* SEO Content / Features */}
      <section className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">How to sign a PDF online</h2>
            <ol className="list-inside list-decimal space-y-2 text-muted-foreground">
              <li>Upload the PDF document you want to sign.</li>
              <li>Upload an image of your signature (PNG or JPG).</li>
              <li>Drag and drop the signature exactly where you want it.</li>
              <li>Click <strong>Apply Signature</strong>. You will be asked to log in to process it securely.</li>
              <li>Download your newly signed PDF file.</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  )
}
