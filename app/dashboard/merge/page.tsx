'use client'

import { useState } from 'react'
import { FileUp, X, Zap, Download, GripVertical } from 'lucide-react'
import { usePdfOperations } from '@/hooks/use-pdf-operations'
import { useAuth } from '@/context/auth-context'
import Link from 'next/link'

export default function MergePage() {
  const { files, processing, progress, error, handleFileSelect, removeFile, reorderFiles } = usePdfOperations()
  const { user } = useAuth()
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [processed, setProcessed] = useState(false)
  const [mergedFile, setMergedFile] = useState<any>(null)

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

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFileSelect(droppedFiles as File[])
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(Array.from(e.target.files))
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOverItem = (index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      reorderFiles(draggedIndex, index)
      setDraggedIndex(index)
    }
  }

  const handleMerge = async () => {
    // Simulate processing
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    setMergedFile({
      name: 'merged-pdf.pdf',
      size: '2.5 MB',
      id: `merged_${Date.now()}`,
    })
    setProcessed(true)
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
          {processed && mergedFile && (
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
                    {mergedFile.name} ({mergedFile.size})
                  </p>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button className="flex-1 rounded-lg bg-green-500 px-4 py-2 font-semibold text-white hover:bg-green-600 transition-colors">
                  Download File
                </button>
                <button
                  onClick={() => {
                    setProcessed(false)
                    setMergedFile(null)
                  }}
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
          {/* Credits Info */}
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
                <span className="text-muted-foreground">Cost per merge:</span>
                <span className="font-semibold">5</span>
              </div>
            </div>
          </div>

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
              <li>• Supports all PDF versions</li>
              <li>• Maximum 10 files per merge</li>
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
