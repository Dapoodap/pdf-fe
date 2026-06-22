'use client'

import { useState } from 'react'
import { FileUp, X, Zap, Download, Sliders } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import Link from 'next/link'

export default function CompressPage() {
  const { user } = useAuth()
  const [files, setFiles] = useState<File[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [quality, setQuality] = useState(80)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [processed, setProcessed] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    setFiles(Array.from(e.dataTransfer.files))
  }

  const handleCompress = async () => {
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
        <h1 className="text-3xl font-bold tracking-tight">Compress PDFs</h1>
        <p className="text-muted-foreground">
          Reduce file size while maintaining quality
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`rounded-xl border-2 border-dashed p-12 text-center transition-all ${
              isDragOver
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <FileUp size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="mb-2 font-semibold">Drop your PDFs here</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Select files to compress
            </p>
            <label className="inline-block">
              <input
                type="file"
                multiple
                accept=".pdf"
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className="hidden"
              />
              <span className="cursor-pointer rounded-lg bg-primary px-6 py-2 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors inline-block">
                Select Files
              </span>
            </label>
          </div>

          {/* Files List */}
          {files.length > 0 && (
            <div className="space-y-3 rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold">Files ({files.length})</h3>
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => setFiles(files.filter((_, i) => i !== index))}
                    className="rounded-lg p-2 hover:bg-destructive/10 transition-colors"
                  >
                    <X size={18} className="text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Quality Settings */}
          {files.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Sliders size={18} className="text-primary" />
                <h3 className="font-semibold">Compression Level</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Quality: {quality}%</span>
                  <span className="text-xs text-muted-foreground">
                    {quality >= 80 ? 'High' : quality >= 50 ? 'Medium' : 'Low'}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Estimated reduction: ~{100 - quality}%
                </p>
              </div>
            </div>
          )}

          {/* Progress */}
          {processing && (
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Compressing...</p>
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
                    Compression Complete!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    compressed-pdf.pdf (1.2 MB)
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
                <span className="text-muted-foreground">Cost per file:</span>
                <span className="font-semibold">3</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCompress}
            disabled={files.length === 0 || processing}
            className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {processing ? 'Processing...' : 'Compress Now'}
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
