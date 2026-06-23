'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { FileUp, X, Download, ExternalLink, Image, FileText, Table, Presentation, FileOutput } from 'lucide-react'
import {
  pdfToImages,
  pdfToDocx,
  pdfToXlsx,
  pdfToPptx,
  anyToPdf,
  type ManipulationResponse,
} from '@/lib/api'
import Link from 'next/link'
import { useAuth } from '@/context/auth-context'

const conversionTypes = [
  {
    id: 'pdf-to-images',
    title: 'PDF to Images',
    description: 'Convert PDF pages to PNG images',
    icon: Image,
    accept: '.pdf',
    color: 'from-amber-500 to-amber-600',
  },
  {
    id: 'pdf-to-docx',
    title: 'PDF to Word',
    description: 'Convert PDF to editable Word format',
    icon: FileText,
    accept: '.pdf',
    color: 'from-sky-500 to-sky-600',
  },
  {
    id: 'pdf-to-xlsx',
    title: 'PDF to Excel',
    description: 'Extract tables from PDF to Excel',
    icon: Table,
    accept: '.pdf',
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'pdf-to-pptx',
    title: 'PDF to PowerPoint',
    description: 'Convert PDF to PowerPoint slides',
    icon: Presentation,
    accept: '.pdf',
    color: 'from-orange-500 to-orange-600',
  },
  {
    id: 'to-pdf',
    title: 'Any to PDF',
    description: 'Convert images or Office docs to PDF',
    icon: FileOutput,
    accept: '.png,.jpg,.jpeg,.docx,.xlsx,.pptx',
    color: 'from-purple-500 to-purple-600',
  },
]

const converterMap: Record<string, (file: File) => Promise<ManipulationResponse>> = {
  'pdf-to-images': pdfToImages,
  'pdf-to-docx': pdfToDocx,
  'pdf-to-xlsx': pdfToXlsx,
  'pdf-to-pptx': pdfToPptx,
  'to-pdf': anyToPdf,
}

interface ConvertToolProps {
  isGuest?: boolean;
  initialType?: string;
}

export function ConvertTool({ isGuest = false, initialType }: ConvertToolProps) {
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type')
  const { user } = useAuth()
  const isPremium = user?.membership_status === 'premium'

  const [selectedType, setSelectedType] = useState(initialType || typeParam || 'pdf-to-images')
  const [file, setFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ManipulationResponse | null>(null)

  const limitReached = file ? (!isPremium && file.size > 100 * 1024 * 1024) : false

  useEffect(() => {
    if (typeParam && conversionTypes.some((t) => t.id === typeParam)) {
      setSelectedType(typeParam)
    }
  }, [typeParam])

  const currentType = conversionTypes.find((t) => t.id === selectedType) || conversionTypes[0]
  const CurrentIcon = currentType.icon

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const dropped = Array.from(e.dataTransfer.files)[0]
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

  const handleConvert = async () => {
    if (!file) return
    setProcessing(true)
    setError(null)
    setResult(null)
    setProgress(20)

    try {
      const converter = converterMap[selectedType]
      if (!converter) throw new Error('Invalid conversion type')

      setProgress(50)
      const response = await converter(file)
      setProgress(100)
      setResult(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed')
    } finally {
      setProcessing(false)
      setProgress(0)
    }
  }

  const handleReset = () => {
    setFile(null)
    setResult(null)
    setError(null)
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Convert Files</h1>
        <p className="text-muted-foreground">
          Convert between PDF and various other formats
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Conversion Type Selector */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold">Select Conversion Type</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {conversionTypes.map((type) => {
                const TypeIcon = type.icon
                return (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type.id)
                      setFile(null)
                      setResult(null)
                      setError(null)
                    }}
                    className={`flex items-center gap-3 rounded-lg p-3 text-left transition-all ${
                      selectedType === type.id
                        ? 'border-2 border-primary bg-primary/5'
                        : 'border border-border hover:border-primary/50'
                    }`}
                  >
                    <div className={`rounded-lg bg-gradient-to-br ${type.color} p-2`}>
                      <TypeIcon size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{type.title}</p>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`rounded-xl border-2 border-dashed p-12 text-center transition-all ${
              isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <CurrentIcon size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="mb-2 font-semibold">Drop your file here</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {currentType.title} — Accepted: {currentType.accept}
            </p>
            <label className="inline-block">
              <input
                type="file"
                accept={currentType.accept}
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
                  <p className="font-semibold">Converting...</p>
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
                    Conversion Complete!
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
                  Convert Another
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
            onClick={handleConvert}
            disabled={!file || processing || limitReached}
            className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {processing ? 'Processing...' : `Convert — ${currentType.title}`}
          </button>

          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <h3 className="font-semibold">About {currentType.title}</h3>
            <p className="text-xs text-muted-foreground">{currentType.description}</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <h3 className="font-semibold">Supported Formats</h3>
            <div className="flex flex-wrap gap-2">
              {currentType.accept.split(',').map((fmt) => (
                <span
                  key={fmt}
                  className="rounded-full bg-muted px-3 py-1 text-xs font-medium"
                >
                  {fmt}
                </span>
              ))}
            </div>
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
