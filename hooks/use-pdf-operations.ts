import { useState } from 'react'

export interface ProcessedFile {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: Date
  operation: string
  status: 'processing' | 'success' | 'error'
}

export function usePdfOperations() {
  const [files, setFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const simulateProcessing = async () => {
    setProcessing(true)
    setError(null)
    setProgress(0)

    try {
      // Simulate processing stages
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 300))
        setProgress(i)
      }

      // Return dummy processed file
      const processedFile: ProcessedFile = {
        id: `file_${Date.now()}`,
        name: files[0]?.name || 'processed.pdf',
        size: Math.floor(Math.random() * 5000000 + 500000),
        type: 'application/pdf',
        uploadedAt: new Date(),
        operation: 'merge',
        status: 'success',
      }

      return processedFile
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Processing failed'
      setError(message)
      throw err
    } finally {
      setProcessing(false)
      setProgress(0)
    }
  }

  const handleFileSelect = (newFiles: File[]) => {
    setFiles([...files, ...newFiles])
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const clearFiles = () => {
    setFiles([])
    setError(null)
    setProgress(0)
  }

  const reorderFiles = (sourceIndex: number, destinationIndex: number) => {
    const newFiles = Array.from(files)
    const [removed] = newFiles.splice(sourceIndex, 1)
    newFiles.splice(destinationIndex, 0, removed)
    setFiles(newFiles)
  }

  return {
    files,
    processing,
    progress,
    error,
    handleFileSelect,
    removeFile,
    clearFiles,
    reorderFiles,
    simulateProcessing,
  }
}
