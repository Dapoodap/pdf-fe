'use client'

import Link from 'next/link'
import {
  Combine,
  RotateCw,
  ArrowUpDown,
  Lock,
  Image as ImageIcon,
  FileText,
  Table,
  Presentation,
  FileOutput,
  ArrowRight,
  Loader2,
  PenTool
} from 'lucide-react'
import { useServices } from '@/context/services-context'
import { SERVICE_METADATA } from '@/lib/api'

const iconMap: Record<string, any> = {
  Combine,
  RotateCw,
  ArrowUpDown,
  Lock,
  Image: ImageIcon,
  FileText,
  Table,
  Presentation,
  FileOutput,
  PenTool,
}

export default function ServicesPage() {
  const { services, loading, error } = useServices()

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      </div>
    )
  }

  const manipulationServices = services.filter(s => SERVICE_METADATA[s.name]?.category === 'manipulation')
  const conversionServices = services.filter(s => SERVICE_METADATA[s.name]?.category === 'conversion')

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          PDF Services
        </h1>
        <p className="text-muted-foreground">
          Explore all available PDF transformation tools fetched directly from the API
        </p>
      </div>

      {/* Manipulation Services */}
      {manipulationServices.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-1 w-1 rounded-full bg-primary" />
            <h2 className="text-xl font-bold">PDF Manipulation</h2>
            <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
              {manipulationServices.length} tools
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {manipulationServices.map((service) => {
              const meta = SERVICE_METADATA[service.name]
              if (!meta) return null
              const Icon = iconMap[meta.icon] || FileText
              
              return (
                <div
                  key={service.id}
                  className="flex flex-col rounded-2xl border border-border bg-card p-8 hover:border-primary/50 transition-all hover:shadow-lg"
                >
                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className={`inline-block rounded-xl bg-gradient-to-br ${meta.color} p-3`}>
                      <Icon size={28} className="text-white" />
                    </div>
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground capitalize">
                      {meta.category}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="mb-2 text-xl font-bold">{meta.title}</h3>
                  <p className="mb-6 text-muted-foreground">
                    {service.description}
                  </p>

                  {/* Features */}
                  <div className="mb-6 space-y-2">
                    {meta.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="mt-auto">
                    <Link
                      href={meta.href}
                      className={`inline-flex items-center gap-2 rounded-lg bg-gradient-to-r ${meta.color} px-6 py-2 font-semibold text-white hover:shadow-lg transition-all hover:scale-105`}
                    >
                      Get Started
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Conversion Services */}
      {conversionServices.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-1 w-1 rounded-full bg-accent" />
            <h2 className="text-xl font-bold">PDF Conversion</h2>
            <span className="rounded-full bg-accent/10 px-3 py-0.5 text-xs font-semibold text-accent">
              {conversionServices.length} tools
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {conversionServices.map((service) => {
              const meta = SERVICE_METADATA[service.name]
              if (!meta) return null
              const Icon = iconMap[meta.icon] || FileText
              
              return (
                <div
                  key={service.id}
                  className="flex flex-col rounded-2xl border border-border bg-card p-8 hover:border-primary/50 transition-all hover:shadow-lg"
                >
                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className={`inline-block rounded-xl bg-gradient-to-br ${meta.color} p-3`}>
                      <Icon size={28} className="text-white" />
                    </div>
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground capitalize">
                      {meta.category}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="mb-2 text-xl font-bold">{meta.title}</h3>
                  <p className="mb-6 text-muted-foreground">
                    {service.description}
                  </p>

                  {/* Features */}
                  <div className="mb-6 space-y-2">
                    {meta.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="mt-auto">
                    <Link
                      href={meta.href}
                      className={`inline-flex items-center gap-2 rounded-lg bg-gradient-to-r ${meta.color} px-6 py-2 font-semibold text-white hover:shadow-lg transition-all hover:scale-105`}
                    >
                      Get Started
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-8">
        <h2 className="text-2xl font-bold">How It Works</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              step: '1',
              title: 'Upload Files',
              description: 'Select or drag and drop your PDF files',
            },
            {
              step: '2',
              title: 'Process',
              description: 'Our server handles the processing securely',
            },
            {
              step: '3',
              title: 'Download',
              description: 'Get your processed files via download link',
            },
          ].map((item) => (
            <div key={item.step} className="space-y-2">
              <div className="inline-block rounded-full bg-primary/10 px-4 py-2 text-lg font-bold text-primary">
                {item.step}
              </div>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
