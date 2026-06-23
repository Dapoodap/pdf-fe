'use client'

import { useState } from 'react'
import { FileUp, X, Download, ArrowUpDown, ExternalLink } from 'lucide-react'
import { reorderPdf, type ManipulationResponse } from '@/lib/api'
import Link from 'next/link'
import { useAuth } from '@/context/auth-context'

interface ReorderToolProps {
  isGuest?: boolean;
}

export function ReorderTool({ isGuest = false }: ReorderToolProps) {
  const { user } = useAuth()
  const isPremium = user?.membership_status === 'premium'

  const [file, setFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [pagesInput, setPagesInput] = useState('')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ManipulationResponse | null>(null)

  const limitReached = file ? (!isPremium && file.size > 100 * 1024 * 1024) : false

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const dropped = Array.from(e.dataTransfer.files).find(
      (f) => f.type === 'application/pdf'
    )
    if (dropped) {
      setFile(dropped)
      setError(null)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    if (selected) {
      setFile(selected)
      setError(null)
    }
  }

  const handleReorder = async () => {
    if (!file || !pagesInput.trim()) return
    setProcessing(true)
    setError(null)
    setResult(null)
    setProgress(20)

    try {
      const pages = pagesInput
        .split(',')
        .map((p) => parseInt(p.trim()))
        .filter((n) => !isNaN(n))

      if (pages.length === 0) {
        throw new Error('Please enter valid page numbers')
      }

      setProgress(50)
      const response = await reorderPdf(file, pages)
      setProgress(100)
      setResult(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reorder failed')
    } finally {
      setProcessing(false)
      setProgress(0)
    }
  }

  const handleReset = () => {
    setFile(null)
    setResult(null)
    setError(null)
    setPagesInput('')
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Reorder / Extract Pages</h1>
        <p className="text-muted-foreground">
          Rearrange pages or extract specific pages from your PDF
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`rounded-xl border-2 border-dashed p-12 text-center transition-all ${
              isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <FileUp size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="mb-2 font-semibold">Drop your PDF here</h3>
            <p className="mb-4 text-sm text-muted-foreground">Select a PDF file to reorder</p>
            <label className="inline-block">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <span className="cursor-pointer rounded-lg bg-primary px-6 py-2 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors inline-block">
                Select File
              </span>
            </label>
          </div>

          {/* File Info */}
          {file && (
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="rounded-lg p-2 hover:bg-destructive/10 transition-colors"
                >
                  <X size={18} className="text-destructive" />
                </button>
              </div>
            </div>
          )}

          {/* Page Order Input */}
          {file && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <ArrowUpDown size={18} className="text-primary" />
                <h3 className="font-semibold">Page Order</h3>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Enter page indices (0-indexed, comma separated)
                </label>
                <input
                  type="text"
                  value={pagesInput}
                  onChange={(e) => setPagesInput(e.target.value)}
                  placeholder="e.g. 2, 0, 1, 3"
                  className="w-full rounded-lg border border-input bg-background px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground">
                  Example: &quot;2, 0, 1&quot; will put page 3 first, then page 1, then page 2.
                  Pages are 0-indexed.
                </p>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <p className="text-sm font-semibold">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setPagesInput('0')}
                    className="rounded-md border border-border px-3 py-1 text-xs font-medium hover:bg-muted transition-colors"
                  >
                    Extract Page 1
                  </button>
                  <button
                    onClick={() => setPagesInput('0, 1, 2')}
                    className="rounded-md border border-border px-3 py-1 text-xs font-medium hover:bg-muted transition-colors"
                  >
                    First 3 Pages
                  </button>
                  <button
                    onClick={() => setPagesInput('2, 1, 0')}
                    className="rounded-md border border-border px-3 py-1 text-xs font-medium hover:bg-muted transition-colors"
                  >
                    Reverse (3 pages)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Progress */}
          {processing && (
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Reordering pages...</p>
                  <p className="text-sm text-muted-foreground">{Math.round(progress)}%</p>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Success */}
          {result && (
            <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-500/20 p-2">
                  <Download size={24} className="text-green-500" />
                </div>
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-400">
                    Reorder Complete!
                  </p>
                  <p className="text-sm text-muted-foreground">{result.file_name}</p>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <a
                  href={result.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 font-semibold text-white hover:bg-green-600 transition-colors"
                >
                  <Download size={18} /> Download <ExternalLink size={14} />
                </a>
                <button
                  onClick={handleReset}
                  className="flex-1 rounded-lg border border-green-500 px-4 py-2 font-semibold text-green-600 dark:text-green-400 hover:bg-green-500/10 transition-colors"
                >
                  Process Another
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {limitReached && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              File exceeds the 100MB free limit. {isGuest ? 'Please login and upgrade' : 'Please upgrade'} to Premium.
            </div>
          )}
          <button
            onClick={handleReorder}
            disabled={!file || !pagesInput.trim() || processing || limitReached}
            className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {processing ? 'Processing...' : 'Reorder Pages'}
          </button>

          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <h3 className="font-semibold">Tips</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>• Pages use 0-based indexing</li>
              <li>• First page = 0, second = 1, etc.</li>
              <li>• Omit pages to extract a subset</li>
              <li>• Repeat pages to duplicate them</li>
              <li>• Use to reverse page order</li>
            </ul>
          </div>

          {!isGuest && (
            <Link
              href="/dashboard/history"
              className="block rounded-lg border border-border px-4 py-2 text-center text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
            >
              View History
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
