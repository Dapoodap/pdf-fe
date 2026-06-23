'use client'

import { Suspense } from 'react'
import { ConvertTool } from '@/components/tools/ConvertTool'

export default function ConvertPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <ConvertTool />
    </Suspense>
  )
}
