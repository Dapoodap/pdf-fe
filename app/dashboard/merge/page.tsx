'use client'

import { useState } from 'react'
import { FileUp, X, Download, GripVertical, ExternalLink } from 'lucide-react'
import { mergePdfs, type ManipulationResponse } from '@/lib/api'
import Link from 'next/link'

import { useAuth } from '@/context/auth-context'

export default function MergePage() {
  const { user } = useAuth()
  const isPremium = user?.membership_status === 'premium'

  const [files, setFiles] = useState<File[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ManipulationResponse | null>(null)

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
    if (!isPremium) {
      if (allFiles.length > 3) {
        setError("Free users can only merge up to 3 files. Upgrade to Premium for unlimited!")
        return
      }
      for (const f of droppedFiles) {
        if (f.size > 100 * 1024 * 1024) {
          setError(`File ${f.name} exceeds the 100MB free limit. Please upgrade.`)
          return
        }
      }
    }
    setFiles(allFiles)
    setError(null)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      const allFiles = [...files, ...newFiles]
      if (!isPremium) {
        if (allFiles.length > 3) {
          setError("Free users can only merge up to 3 files. Upgrade to Premium for unlimited!")
          e.target.value = ''
          return
        }
        for (const f of newFiles) {
          if (f.size > 100 * 1024 * 1024) {
            setError(`File ${f.name} exceeds the 100MB free limit. Please upgrade.`)
            e.target.value = ''
            return
          }
        }
      }
      setFiles(allFiles)
      setError(null)
    }
    e.target.value = ''
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOverItem = (index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      const newFiles = Array.from(files)
      const [removed] = newFiles.splice(draggedIndex, 1)
      newFiles.splice(index, 0, removed)
      setFiles(newFiles)
      setDraggedIndex(index)
    }
  }

  const handleMerge = async () => {
    if (files.length < 2) return
    setProcessing(true)
    setError(null)
    setResult(null)
    setProgress(10)

    try {
      setProgress(30)
      const response = await mergePdfs(files)
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
        <h1 className="text-3xl font-bold tracking-tight">Merge PDFs</h1>
        <p className="text-muted-foreground">
          Combine multiple PDF files into one document. Drag to reorder.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Drag Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
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
              or click to select files from your computer
            </p>
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

          {/* Files List with Drag Reorder */}
          {files.length > 0 && (
            <div className="space-y-3 rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold">Files to Merge ({files.length})</h3>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={() => handleDragOverItem(index)}
                    onDragEnd={() => setDraggedIndex(null)}
                    className={`flex items-center gap-3 rounded-lg border p-3 transition-all cursor-move hover:bg-muted/50 ${
                      draggedIndex === index
                        ? 'border-primary bg-primary/5 opacity-50'
                        : 'border-border'
                    }`}
                  >
                    <GripVertical size={20} className="text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-sm">{file.name}</p>
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
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Processing Progress */}
          {processing && (
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Merging PDFs...</p>
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
                  <p className="text-sm text-muted-foreground">
                    {result.file_name}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <a
                  href={result.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 font-semibold text-white hover:bg-green-600 transition-colors"
                >
                  <Download size={18} />
                  Download File
                  <ExternalLink size={14} />
                </a>
                <button
                  onClick={handleReset}
                  className="flex-1 rounded-lg border border-green-500 px-4 py-2 font-semibold text-green-600 dark:text-green-400 hover:bg-green-500/10 transition-colors"
                >
                  Merge More
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Action Button */}
          <button
            onClick={handleMerge}
            disabled={files.length < 2 || processing}
            className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Processing...' : `Merge ${files.length} Files`}
          </button>

          {/* Info Card */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <h3 className="font-semibold">Tips</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>• Drag files to reorder them</li>
              <li>• Click X to remove a file</li>
              <li>• Minimum 2 files required</li>
              <li>• Supports all PDF versions</li>
              <li>• Merged file retains formatting</li>
            </ul>
          </div>

          {/* History Link */}
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
