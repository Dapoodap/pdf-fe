'use client'

import { useState } from 'react'
import { FileUp, X, Download, RotateCw, ExternalLink } from 'lucide-react'
import { rotatePdf, type ManipulationResponse } from '@/lib/api'
import Link from 'next/link'
import { useAuth } from '@/context/auth-context'

interface RotateToolProps {
  isGuest?: boolean;
}

export function RotateTool({ isGuest = false }: RotateToolProps) {
  const { user } = useAuth()
  const isPremium = user?.membership_status === 'premium'

  const [file, setFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [degrees, setDegrees] = useState<number>(90)
  const [pageMode, setPageMode] = useState<'all' | 'specific'>('all')
  const [pagesInput, setPagesInput] = useState('')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ManipulationResponse | null>(null)

  const isGuest = !user
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

  const handleRotate = async () => {
    if (!file) return
    setProcessing(true)
    setError(null)
    setResult(null)
    setProgress(20)

    try {
      let pages: number[] | undefined
      if (pageMode === 'specific' && pagesInput.trim()) {
        pages = pagesInput.split(',').map((p) => parseInt(p.trim())).filter((n) => !isNaN(n))
      }
      setProgress(50)
      const response = await rotatePdf(file, degrees, pages)
      setProgress(100)
      setResult(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rotation failed')
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
        <h1 className="text-3xl font-bold tracking-tight">Rotate PDF</h1>
        <p className="text-muted-foreground">
          Rotate specific pages or entire PDF documents
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Area */}
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
            <p className="mb-4 text-sm text-muted-foreground">Select a PDF file to rotate</p>
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

          {/* Rotation Settings */}
          {file && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-6">
              <h3 className="font-semibold">Rotation Settings</h3>

              {/* Degree Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold">Rotation Angle</label>
                <div className="grid grid-cols-3 gap-3">
                  {[90, 180, 270].map((deg) => (
                    <button
                      key={deg}
                      onClick={() => setDegrees(deg)}
                      className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold transition-colors ${
                        degrees === deg
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border text-foreground hover:border-primary/50'
                      }`}
                    >
                      <RotateCw size={18} style={{ transform: `rotate(${deg}deg)` }} />
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>

              {/* Page Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold">Pages to Rotate</label>
                <div className="flex gap-2">
                  {(['all', 'specific'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setPageMode(mode)}
                      className={`flex-1 rounded-lg px-4 py-2 font-semibold transition-colors ${
                        pageMode === mode
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border text-foreground hover:border-primary/50'
                      }`}
                    >
                      {mode === 'all' ? 'All Pages' : 'Specific Pages'}
                    </button>
                  ))}
                </div>
                {pageMode === 'specific' && (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={pagesInput}
                      onChange={(e) => setPagesInput(e.target.value)}
                      placeholder="e.g. 0, 2, 4 (0-indexed)"
                      className="w-full rounded-lg border border-input bg-background px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground">
                      Page numbers are 0-indexed (first page = 0)
                    </p>
                  </div>
                )}
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
                  <p className="font-semibold">Rotating PDF...</p>
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
                    Rotation Complete!
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
                  Rotate Another
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
            onClick={handleRotate}
            disabled={!file || processing || limitReached}
            className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {processing ? 'Processing...' : `Rotate ${degrees}°`}
          </button>

          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <h3 className="font-semibold">Tips</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>• Choose 90°, 180°, or 270° rotation</li>
              <li>• Select specific pages or rotate all</li>
              <li>• Page indices start from 0</li>
              <li>• Original file is not modified</li>
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
