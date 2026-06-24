'use client'

import { useState, useRef, useEffect } from 'react'
import { FileUp, X, Download, PenTool, ExternalLink, ChevronLeft, ChevronRight, GripHorizontal, Loader2 } from 'lucide-react'
import { signPdf, type ManipulationResponse } from '@/lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { ProcessingProgress } from '@/components/ui/processing-progress'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Initialize pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface SignToolProps {
  isGuest?: boolean;
}

export function SignTool({ isGuest = false }: SignToolProps) {
  const router = useRouter()
  const { user } = useAuth()
  const isPremium = user?.membership_status === 'premium'

  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [signatureFile, setSignatureFile] = useState<File | null>(null)
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null)
  
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  
  const [isDragOverPdf, setIsDragOverPdf] = useState(false)
  const [isDragOverSig, setIsDragOverSig] = useState(false)
  
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ManipulationResponse | null>(null)

  // Dragging state
  const [sigPosition, setSigPosition] = useState({ x: 50, y: 50 })
  const [sigSize, setSigSize] = useState({ width: 200, height: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [startSize, setStartSize] = useState({ width: 0, height: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  // Limit check
  const limitReached = pdfFile ? (!isPremium && pdfFile.size > 100 * 1024 * 1024) : false

  // Handle Container Width for responsive PDF render
  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth)
    }
    
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [pdfFile])

  // Handlers for PDF Upload
  const onPdfDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOverPdf(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') {
      setPdfFile(file)
      setError(null)
    }
  }

  const onPdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setPdfFile(file)
      setError(null)
    }
  }

  // Handlers for Signature Upload
  const onSigDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOverSig(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleSignatureFile(file)
    }
  }

  const onSigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleSignatureFile(file)
    }
  }

  const handleSignatureFile = (file: File) => {
    setSignatureFile(file)
    const url = URL.createObjectURL(file)
    setSignaturePreview(url)
    // Reset position to centerish
    if (containerWidth > 0) {
      setSigPosition({ x: containerWidth / 2 - 100, y: 150 })
    }
  }

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setPageNumber(1)
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth)
    }
  }

  // Dragging logic
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isResizing) return
    setIsDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    setDragOffset({
      x: clientX - sigPosition.x,
      y: clientY - sigPosition.y
    })
  }

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    setIsResizing(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    setStartPos({ x: clientX, y: clientY })
    setStartSize({ width: sigSize.width, height: sigSize.height })
  }

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging && !isResizing) return
      if (!containerRef.current) return

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      
      const bounds = containerRef.current.getBoundingClientRect()

      if (isDragging) {
        let newX = clientX - dragOffset.x
        let newY = clientY - dragOffset.y

        // Constrain
        newX = Math.max(0, Math.min(newX, bounds.width - sigSize.width))
        newY = Math.max(0, Math.min(newY, bounds.height - sigSize.height))

        setSigPosition({ x: newX, y: newY })
      } else if (isResizing) {
        const deltaX = clientX - startPos.x
        const deltaY = clientY - startPos.y
        
        let newWidth = Math.max(50, startSize.width + deltaX)
        let newHeight = Math.max(25, startSize.height + deltaY)
        
        // Maintain aspect ratio roughly if we want, or free resize
        // Let's do free resize for now, constrained to container
        if (sigPosition.x + newWidth > bounds.width) newWidth = bounds.width - sigPosition.x
        if (sigPosition.y + newHeight > bounds.height) newHeight = bounds.height - sigPosition.y
        
        setSigSize({ width: newWidth, height: newHeight })
      }
    }

    const handleUp = () => {
      setIsDragging(false)
      setIsResizing(false)
    }

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMove)
      window.addEventListener('mouseup', handleUp)
      window.addEventListener('touchmove', handleMove, { passive: false })
      window.addEventListener('touchend', handleUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleUp)
    }
  }, [isDragging, isResizing, dragOffset, startPos, startSize, sigPosition, sigSize])


  const handleSign = async () => {
    if (!pdfFile || !signatureFile || !containerRef.current) return

    if (isGuest) {
      router.push('/login?callbackUrl=/dashboard/sign')
      return
    }

    setProcessing(true)
    setError(null)
    setResult(null)

    try {
      const bounds = containerRef.current.getBoundingClientRect()
      
      // Calculate relative percentage
      const relX = sigPosition.x / bounds.width
      const relY = sigPosition.y / bounds.height
      const relWidth = sigSize.width / bounds.width
      const relHeight = sigSize.height / bounds.height

      const response = await signPdf(
        pdfFile,
        signatureFile,
        pageNumber - 1,
        relX,
        relY,
        relWidth,
        relHeight
      )
      
      setResult(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signature process failed')
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = () => {
    setPdfFile(null)
    setSignatureFile(null)
    setSignaturePreview(null)
    setResult(null)
    setError(null)
    setPageNumber(1)
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Sign PDF</h1>
        <p className="text-muted-foreground">
          Drag and drop your signature visually onto the document
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Workspace */}
        <div className="lg:col-span-2 space-y-6">
          {!pdfFile && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOverPdf(true) }}
              onDragLeave={() => setIsDragOverPdf(false)}
              onDrop={onPdfDrop}
              className={`rounded-xl border-2 border-dashed p-12 text-center transition-all ${
                isDragOverPdf ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
            >
              <FileUp size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="mb-2 font-semibold">Drop your PDF here</h3>
              <p className="mb-4 text-sm text-muted-foreground">Select a PDF file to sign</p>
              <label className="inline-block">
                <input type="file" accept=".pdf" onChange={onPdfChange} className="hidden" />
                <span className="cursor-pointer rounded-lg bg-primary px-6 py-2 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors inline-block">
                  Select PDF
                </span>
              </label>
            </div>
          )}

          {pdfFile && !result && (
            <div className="space-y-4">
              {/* Pagination Controls */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{pdfFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Page {pageNumber} of {numPages}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                    disabled={pageNumber <= 1}
                    className="p-2 rounded-lg hover:bg-muted disabled:opacity-50"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm font-medium">{pageNumber}</span>
                  <button
                    onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                    disabled={pageNumber >= numPages}
                    className="p-2 rounded-lg hover:bg-muted disabled:opacity-50"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                
                <button
                  onClick={() => setPdfFile(null)}
                  className="ml-4 rounded-lg p-2 hover:bg-destructive/10 text-destructive transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* PDF Canvas area */}
              <div className="rounded-xl border border-border bg-muted/30 overflow-hidden relative" ref={containerRef}>
                <Document
                  file={pdfFile}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={(error) => setError(error.message)}
                  className="flex justify-center"
                  loading={<div className="p-12 text-center text-muted-foreground flex flex-col items-center"><Loader2 className="animate-spin mb-4" /> Loading PDF engine...</div>}
                >
                  <Page 
                    pageNumber={pageNumber} 
                    width={containerWidth}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="shadow-md"
                  />
                </Document>

                {/* Signature Overlay */}
                {signaturePreview && (
                  <div
                    className={`absolute z-10 border-2 ${isDragging ? 'border-primary cursor-grabbing' : 'border-primary/50 cursor-grab hover:border-primary'} rounded-lg shadow-xl bg-white/10 backdrop-blur-[2px]`}
                    style={{
                      left: sigPosition.x,
                      top: sigPosition.y,
                      width: sigSize.width,
                      height: sigSize.height,
                    }}
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={signaturePreview} 
                      alt="Signature" 
                      className="w-full h-full object-contain pointer-events-none"
                    />
                    
                    {/* Resize handle */}
                    <div 
                      className="absolute -bottom-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center cursor-nwse-resize shadow-md"
                      onMouseDown={handleResizeStart}
                      onTouchStart={handleResizeStart}
                    >
                      <GripHorizontal size={12} className="text-white transform rotate-45" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <ProcessingProgress isProcessing={processing} title="Signing PDF..." />

          {result && (
            <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-6 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-500/20 p-2">
                  <Download size={24} className="text-green-500" />
                </div>
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-400">
                    PDF Signed Successfully!
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
                  <Download size={18} /> Download Signed PDF <ExternalLink size={14} />
                </a>
                <button
                  onClick={handleReset}
                  className="flex-1 rounded-lg border border-green-500 px-4 py-2 font-semibold text-green-600 dark:text-green-400 hover:bg-green-500/10 transition-colors"
                >
                  Sign Another
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <PenTool size={18} className="text-primary" />
              Signature Tool
            </h3>
            
            {!signatureFile ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOverSig(true) }}
                onDragLeave={() => setIsDragOverSig(false)}
                onDrop={onSigDrop}
                className={`rounded-lg border-2 border-dashed p-6 text-center transition-all ${
                  isDragOverSig ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
              >
                <p className="mb-2 text-sm font-medium">Upload Signature</p>
                <p className="mb-4 text-xs text-muted-foreground">PNG with transparent background recommended</p>
                <label className="inline-block">
                  <input type="file" accept="image/*" onChange={onSigChange} className="hidden" />
                  <span className="cursor-pointer rounded-lg bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80 transition-colors inline-block">
                    Browse Image
                  </span>
                </label>
              </div>
            ) : (
              <div className="rounded-lg border border-border p-4 space-y-3 bg-muted/30">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{signatureFile.name}</p>
                  <button 
                    onClick={() => { setSignatureFile(null); setSignaturePreview(null) }}
                    className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={signaturePreview!} alt="preview" className="h-20 w-full object-contain bg-white rounded border border-border" />
                <p className="text-xs text-muted-foreground text-center">
                  Drag the signature on the document to position it.
                </p>
              </div>
            )}
          </div>

          {limitReached && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              PDF exceeds the 100MB free limit. {isGuest ? 'Please login and upgrade' : 'Please upgrade'} to Premium.
            </div>
          )}

          <button
            onClick={handleSign}
            disabled={!pdfFile || !signatureFile || processing || limitReached}
            className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-md"
          >
            {processing ? 'Processing...' : 'Apply Signature'}
          </button>

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
