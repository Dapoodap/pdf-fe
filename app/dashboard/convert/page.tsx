'use client'

import { useState } from 'react'
import { FileUp, X, Zap, Download, ArrowRightLeft } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import Link from 'next/link'

export default function ConvertPage() {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [fromFormat, setFromFormat] = useState<'pdf' | 'image'>('pdf')
  const [toFormat, setToFormat] = useState<'image' | 'pdf'>('image')
  const [dpi, setDpi] = useState(300)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [processed, setProcessed] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    setFile(Array.from(e.dataTransfer.files)[0] as File)
  }

  const handleSwapFormats = () => {
    setFromFormat(fromFormat === 'pdf' ? 'image' : 'pdf')
    setToFormat(toFormat === 'pdf' ? 'image' : 'pdf')
  }

  const handleConvert = async () => {
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
        <h1 className="text-3xl font-bold tracking-tight">Convert Files</h1>
        <p className="text-muted-foreground">
          Convert between PDF and image formats
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
            <h3 className="mb-2 font-semibold">Drop your file here</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              PDF or image file to convert
            </p>
            <label className="inline-block">
              <input
                type="file"
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

          {/* Conversion Settings */}
          {file && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-6">
              <h3 className="font-semibold">Conversion Settings</h3>

              {/* Format Selection */}
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3 items-end">
                  {/* From Format */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">From</label>
                    <select
                      value={fromFormat}
                      onChange={(e) => setFromFormat(e.target.value as 'pdf' | 'image')}
                      className="w-full rounded-lg border border-input bg-background px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="pdf">PDF</option>
                      <option value="image">Image (JPG, PNG)</option>
                    </select>
                  </div>

                  {/* Swap Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={handleSwapFormats}
                      className="rounded-lg p-2 hover:bg-muted transition-colors"
                    >
                      <ArrowRightLeft size={20} className="text-primary" />
                    </button>
                  </div>

                  {/* To Format */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">To</label>
                    <select
                      value={toFormat}
                      onChange={(e) => setToFormat(e.target.value as 'pdf' | 'image')}
                      className="w-full rounded-lg border border-input bg-background px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="pdf">PDF</option>
                      <option value="image">Image (JPG, PNG)</option>
                    </select>
                  </div>
                </div>

                {/* DPI Settings for PDF to Image */}
                {fromFormat === 'pdf' && toFormat === 'image' && (
                  <div className="space-y-2 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold">Image Quality (DPI)</label>
                      <span className="text-sm font-semibold text-primary">{dpi} DPI</span>
                    </div>
                    <input
                      type="range"
                      min="72"
                      max="600"
                      step="24"
                      value={dpi}
                      onChange={(e) => setDpi(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher DPI = Better quality but larger file size
                    </p>
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
                  <p className="font-semibold">Converting...</p>
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
                    Conversion Complete!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    converted-file.{toFormat === 'image' ? 'jpg' : 'pdf'} (2.1 MB)
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
                <span className="text-muted-foreground">Cost per conversion:</span>
                <span className="font-semibold">6</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleConvert}
            disabled={!file || processing}
            className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {processing ? 'Processing...' : 'Convert Now'}
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
