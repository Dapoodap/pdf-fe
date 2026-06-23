'use client'

import { useState } from 'react'
import { FileUp, X, Download, Lock, Eye, EyeOff, ExternalLink } from 'lucide-react'
import { lockPdf, type ManipulationResponse } from '@/lib/api'
import Link from 'next/link'
import { useAuth } from '@/context/auth-context'

interface LockToolProps {
  isGuest?: boolean;
}

export function LockTool({ isGuest = false }: LockToolProps) {
  const { user } = useAuth()
  const isPremium = user?.membership_status === 'premium'

  const [file, setFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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

  const handleLock = async () => {
    if (!file || !password) return
    setProcessing(true)
    setError(null)
    setResult(null)
    setProgress(20)

    try {
      setProgress(50)
      const response = await lockPdf(file, password)
      setProgress(100)
      setResult(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lock failed')
    } finally {
      setProcessing(false)
      setProgress(0)
    }
  }

  const handleReset = () => {
    setFile(null)
    setResult(null)
    setError(null)
    setPassword('')
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Lock PDF</h1>
        <p className="text-muted-foreground">
          Protect your PDF with password encryption
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
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
            <p className="mb-4 text-sm text-muted-foreground">Select a PDF file to lock</p>
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

          {/* Password Input */}
          {file && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Lock size={18} className="text-primary" />
                <h3 className="font-semibold">Password Protection</h3>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Set Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a strong password"
                    className="w-full rounded-lg border border-input bg-background px-4 py-2 pr-10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Make sure to remember this password — you&apos;ll need it to open the PDF
                </p>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          password.length >= level * 3
                            ? password.length >= 12
                              ? 'bg-green-500'
                              : password.length >= 8
                              ? 'bg-amber-500'
                              : 'bg-red-400'
                            : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {password.length < 6
                      ? 'Weak — use at least 6 characters'
                      : password.length < 10
                      ? 'Moderate — consider adding more characters'
                      : 'Strong password'}
                  </p>
                </div>
              )}
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
                  <p className="font-semibold">Encrypting PDF...</p>
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
                    PDF Locked Successfully!
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
                  Lock Another
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
            onClick={handleLock}
            disabled={!file || !password || processing || limitReached}
            className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {processing ? 'Encrypting...' : 'Lock PDF'}
          </button>

          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <h3 className="font-semibold">Tips</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>• Use a strong, unique password</li>
              <li>• Remember your password to open the file</li>
              <li>• Industry-standard encryption</li>
              <li>• Perfect for sensitive documents</li>
              <li>• Share locked files safely</li>
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
