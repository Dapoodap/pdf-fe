'use client'

import { useState } from 'react'
import { FileUp, X, Zap, Download } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import Link from 'next/link'

export default function SplitPage() {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [splitMode, setSplitMode] = useState<'range' | 'pages'>('range')
  const [startPage, setStartPage] = useState(1)
  const [endPage, setEndPage] = useState(5)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [processed, setProcessed] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    setFile(files[0] as File)
  }

  const handleSplit = async () => {
    setProcessing(true)
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setProgress(i)
    }
    setProcessed(true)
    setProcessing(false)
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Split PDFs</h1>
        <p className="text-muted-foreground">
          Extract specific pages from your PDF files
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragOver(true)
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`rounded-xl border-2 border-dashed p-12 text-center transition-all ${
              isDragOver
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <FileUp size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="mb-2 font-semibold">Drop your PDF here</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Select a PDF file to split
            </p>
            <label className="inline-block">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <span className="cursor-pointer rounded-lg bg-primary px-6 py-2 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors inline-block">
                Select File
              </span>
            </label>
          </div>

          {/* File Info */}
          {file && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
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

          {/* Split Options */}
          {file && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-semibold">Split Options</h3>

              <div className="space-y-3">
                {/* Mode Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Mode</label>
                  <div className="flex gap-2">
                    {(['range', 'pages'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setSplitMode(mode)}
                        className={`flex-1 rounded-lg px-4 py-2 font-semibold transition-colors ${
                          splitMode === mode
                            ? 'bg-primary text-primary-foreground'
                            : 'border border-border text-foreground hover:border-primary/50'
                        }`}
                      >
                        {mode === 'range' ? 'Page Range' : 'Specific Pages'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Page Range */}
                {splitMode === 'range' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Start Page</label>
                      <input
                        type="number"
                        min="1"
                        value={startPage}
                        onChange={(e) => setStartPage(parseInt(e.target.value))}
                        className="w-full rounded-lg border border-input bg-background px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">End Page</label>
                      <input
                        type="number"
                        min="1"
                        value={endPage}
                        onChange={(e) => setEndPage(parseInt(e.target.value))}
                        className="w-full rounded-lg border border-input bg-background px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}

                {/* Specific Pages */}
                {splitMode === 'pages' && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Pages (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. 1, 3, 5-7, 10"
                      className="w-full rounded-lg border border-input bg-background px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progress */}
          {processing && (
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Splitting PDF...</p>
                  <p className="text-sm text-muted-foreground">{Math.round(progress)}%</p>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Success */}
          {processed && (
            <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-500/20 p-2">
                  <Download size={24} className="text-green-500" />
                </div>
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-400">
                    Split Complete!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Pages 1-5 extracted (split-pdf.pdf)
                  </p>
                </div>
              </div>
              <button className="w-full rounded-lg bg-green-500 px-4 py-2 font-semibold text-white hover:bg-green-600 transition-colors">
                Download File
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={18} className="text-primary" />
              <h3 className="font-semibold">Credits</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Available:</span>
                <span className="font-semibold">{user?.credits}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Cost per split:</span>
                <span className="font-semibold">4</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSplit}
            disabled={!file || processing}
            className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {processing ? 'Processing...' : 'Split PDF'}
          </button>

          <Link
            href="/dashboard/history"
            className="block rounded-lg border border-border px-4 py-2 text-center text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
          >
            View History
          </Link>
        </div>
      </div>
    </div>
  )
}
