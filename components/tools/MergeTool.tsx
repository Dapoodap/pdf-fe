'use client'

import { useState } from 'react'
import { FileUp, X, Download, GripVertical, ExternalLink } from 'lucide-react'
import { mergePdfs, type ManipulationResponse } from '@/lib/api'
import Link from 'next/link'
import { useAuth } from '@/context/auth-context'

interface MergeToolProps {
  isGuest?: boolean;
}

export function MergeTool({ isGuest = false }: MergeToolProps) {
  const { user } = useAuth()
  const isPremium = user?.membership_status === 'premium'

  const [files, setFiles] = useState<File[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ManipulationResponse | null>(null)

  const isGuest = !user
  const sizeLimitReached = !isPremium && files.some(f => f.size > 100 * 1024 * 1024)
  const countLimitReached = !isPremium && files.length > 3
  const limitReached = sizeLimitReached || countLimitReached

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === 'application/pdf'
    )
    
    const allFiles = [...files, ...droppedFiles]
    setFiles(allFiles)
    setError(null)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const allFiles = [...files, ...selectedFiles]
    setFiles(allFiles)
    setError(null)
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleDragStartItem = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML)
  }

  const handleDragOverItem = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDropItem = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null) return
    const newFiles = [...files]
    const draggedFile = newFiles[draggedIndex]
    newFiles.splice(draggedIndex, 1)
    newFiles.splice(index, 0, draggedFile)
    setFiles(newFiles)
    setDraggedIndex(null)
  }

  const handleMerge = async () => {
    if (files.length < 2) return
    setProcessing(true)
    setError(null)
    setResult(null)
    setProgress(20)

    try {
      setProgress(50)
      const rotations = files.map(() => 0)
      const response = await mergePdfs(files, rotations)
      setProgress(100)
      setResult(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Merge failed')
    } finally {
      setProcessing(false)
      setProgress(0)
    }
  }

  const handleReset = () => {
    setFiles([])
    setResult(null)
    setError(null)
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Merge PDF Files</h1>
        <p className="text-muted-foreground">
          Combine multiple PDFs into a single document. Drag and drop to reorder.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`rounded-xl border-2 border-dashed p-12 text-center transition-all ${
              isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <FileUp size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="mb-2 font-semibold">Drop PDF files here</h3>
            <p className="mb-4 text-sm text-muted-foreground">or</p>
            <label className="inline-block">
              <input
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <span className="cursor-pointer rounded-lg bg-primary px-6 py-2 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors inline-block">
                Select Files
              </span>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  draggable
                  onDragStart={(e) => handleDragStartItem(e, index)}
                  onDragOver={(e) => handleDragOverItem(e, index)}
                  onDrop={(e) => handleDropItem(e, index)}
                  className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50"
                >
                  <GripVertical className="cursor-grab text-muted-foreground active:cursor-grabbing" size={20} />
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="rounded-lg p-2 hover:bg-destructive/10 transition-colors"
                  >
                    <X size={18} className="text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Progress */}
          {processing && (
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Merging Files...</p>
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

          {/* Success Result */}
          {result && (
            <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-500/20 p-2">
                  <Download size={24} className="text-green-500" />
                </div>
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-400">
                    Merge Complete!
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
                  Merge Another
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info / CTA */}
        <div className="space-y-4">
          {limitReached && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              {sizeLimitReached 
                ? `One or more files exceed the 100MB free limit. ${isGuest ? 'Please login and upgrade' : 'Please upgrade'} to Premium.`
                : `Free users can only merge up to 3 files. ${isGuest ? 'Please login and upgrade' : 'Please upgrade'} to Premium for unlimited!`}
            </div>
          )}
          <button
            onClick={handleMerge}
            disabled={files.length < 2 || processing || limitReached}
            className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {processing ? 'Processing...' : `Merge ${files.length} Files`}
          </button>

          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <h3 className="font-semibold">How it works</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>1. Upload 2 or more PDF files.</li>
              <li>2. Drag items to reorder them.</li>
              <li>3. Click Merge.</li>
              <li>4. Download your new single PDF.</li>
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
