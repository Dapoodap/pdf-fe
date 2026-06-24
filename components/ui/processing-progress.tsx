'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface ProcessingProgressProps {
  isProcessing: boolean
  title?: string
}

const steps = [
  { threshold: 0, text: 'Preparing document...' },
  { threshold: 15, text: 'Uploading securely...' },
  { threshold: 35, text: 'Analyzing structure...' },
  { threshold: 60, text: 'Processing data...' },
  { threshold: 85, text: 'Optimizing output...' },
  { threshold: 95, text: 'Finalizing...' },
]

export function ProcessingProgress({ isProcessing, title = 'Processing...' }: ProcessingProgressProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isProcessing) {
      setProgress(0)
      return
    }

    // Smoothly animate progress up to 95%
    const duration = 5000 // 5 seconds to reach 95%
    const intervalTime = 50
    const stepsCount = duration / intervalTime
    const increment = 95 / stepsCount

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(timer)
          return 95
        }
        return prev + increment
      })
    }, intervalTime)

    return () => clearInterval(timer)
  }, [isProcessing])

  if (!isProcessing) return null

  // Find current step text
  const currentStep = [...steps].reverse().find(step => progress >= step.threshold) || steps[0]

  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-4 shadow-sm transition-all">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Loader2 size={16} className="animate-spin text-primary" />
            <p className="font-semibold">{title}</p>
          </div>
          <p className="text-sm font-medium text-primary">{Math.round(progress)}%</p>
        </div>
        <div className="h-2.5 w-full rounded-full bg-muted/50 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground animate-pulse">
          {currentStep.text}
        </p>
      </div>
    </div>
  )
}
