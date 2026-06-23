'use client'

import Link from 'next/link'
import { ConvertTool } from '@/components/tools/ConvertTool'
import { useAuth } from '@/context/auth-context'
import { FileText, ArrowRight } from 'lucide-react'
import { PublicNavbar } from '@/components/public-navbar'
import { Suspense } from 'react'

export default function PdfToWordLandingPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNavbar />

      {/* SEO Hero Section */}
      <section className="border-b border-border bg-card px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 shadow-lg">
            <FileText size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Convert PDF to Word
          </h1>
          <p className="text-lg text-muted-foreground">
            Easily convert your PDF files into editable DOCX documents.
            Preserve your formatting, text, and images perfectly.
          </p>
        </div>
      </section>

      {/* Tool Section */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {isAuthenticated ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-lg">
              <h2 className="mb-4 text-2xl font-bold">Ready to convert your PDF?</h2>
              <p className="mb-8 text-muted-foreground">
                You are logged in. Head over to your dashboard to process files without limits and save them to your history.
              </p>
              <Link
                href="/dashboard/convert?type=pdf-to-docx"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90 hover:shadow-xl"
              >
                Go to Dashboard to Convert <ArrowRight size={24} />
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-2 shadow-xl sm:p-4">
              <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
                <ConvertTool isGuest={true} initialType="pdf-to-docx" />
              </Suspense>
            </div>
          )}
        </div>
      </section>

      {/* SEO Content / Features */}
      <section className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">How to convert PDF to Word</h2>
            <ol className="list-inside list-decimal space-y-2 text-muted-foreground">
              <li>Upload your PDF file.</li>
              <li>Wait for the secure conversion to finish.</li>
              <li>Download your newly created, fully editable Word Document (DOCX).</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  )
}
