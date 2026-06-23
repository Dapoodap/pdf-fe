'use client'

import Link from 'next/link'
import { ReorderTool } from '@/components/tools/ReorderTool'
import { useAuth } from '@/context/auth-context'
import { ArrowUpDown, ArrowRight } from 'lucide-react'
import { PublicNavbar } from '@/components/public-navbar'

export default function ReorderLandingPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNavbar />

      {/* SEO Hero Section */}
      <section className="border-b border-border bg-card px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg">
            <ArrowUpDown size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Reorder PDF Pages
          </h1>
          <p className="text-lg text-muted-foreground">
            Sort the pages of your PDF document however you like. Extract only the pages you need
            and create a new PDF file with your desired page order.
          </p>
        </div>
      </section>

      {/* Tool Section */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {isAuthenticated ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-lg">
              <h2 className="mb-4 text-2xl font-bold">Ready to reorder your pages?</h2>
              <p className="mb-8 text-muted-foreground">
                You are logged in. Head over to your dashboard to process files without limits and save them to your history.
              </p>
              <Link
                href="/dashboard/reorder"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90 hover:shadow-xl"
              >
                Go to Dashboard to Reorder <ArrowRight size={24} />
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-2 shadow-xl sm:p-4">
              <ReorderTool isGuest={true} />
            </div>
          )}
        </div>
      </section>

      {/* SEO Content / Features */}
      <section className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">How to reorder PDF pages</h2>
            <ol className="list-inside list-decimal space-y-2 text-muted-foreground">
              <li>Upload your PDF file using the dropzone above.</li>
              <li>Specify the exact page numbers and order you want (e.g., "3, 1, 4-6").</li>
              <li>Pages that are not specified will be excluded from the final document.</li>
              <li>Click <strong>Reorder Pages</strong> and download your customized PDF.</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  )
}
