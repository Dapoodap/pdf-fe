'use client'

import Link from 'next/link'
import {
  FileText,
  Zap,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'

const services = [
  {
    id: 'merge',
    title: 'Merge PDFs',
    description: 'Combine multiple PDF files into one seamless document',
    features: [
      'Drag and drop ordering',
      'Batch processing',
      'Maintain original formatting',
      'Preview before merge',
    ],
    icon: FileText,
    href: '/dashboard/merge',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'compress',
    title: 'Compress PDFs',
    description: 'Reduce file size while maintaining quality',
    features: [
      'Multiple compression levels',
      'Batch compression',
      'Quality preview',
      'File size estimation',
    ],
    icon: Zap,
    href: '/dashboard/compress',
    color: 'from-amber-500 to-amber-600',
  },
  {
    id: 'split',
    title: 'Split PDFs',
    description: 'Extract and separate pages from your documents',
    features: [
      'Select specific pages',
      'Range extraction',
      'Batch splitting',
      'Custom naming',
    ],
    icon: ShieldCheck,
    href: '/dashboard/split',
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'convert',
    title: 'Convert PDFs',
    description: 'Transform PDFs to images and vice versa',
    features: [
      'PDF to JPG/PNG',
      'Image to PDF',
      'Batch conversion',
      'DPI settings',
    ],
    icon: TrendingUp,
    href: '/dashboard/convert',
    color: 'from-purple-500 to-purple-600',
  },
]

export default function ServicesPage() {
  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          PDF Services
        </h1>
        <p className="text-muted-foreground">
          Explore all available PDF transformation tools
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {services.map((service) => {
          const Icon = service.icon
          return (
            <div
              key={service.id}
              className="flex flex-col rounded-2xl border border-border bg-card p-8 hover:border-primary/50 transition-all hover:shadow-lg"
            >
              {/* Header */}
              <div className="mb-4 flex items-start justify-between">
                <div className={`inline-block rounded-xl bg-gradient-to-br ${service.color} p-3`}>
                  <Icon size={28} className="text-white" />
                </div>
              </div>

              {/* Content */}
              <h3 className="mb-2 text-xl font-bold">{service.title}</h3>
              <p className="mb-6 text-muted-foreground">
                {service.description}
              </p>

              {/* Features */}
              <div className="mb-6 space-y-2">
                {service.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {feature}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-auto">
                <Link
                  href={service.href}
                  className={`inline-flex items-center gap-2 rounded-lg bg-gradient-to-r ${service.color} px-6 py-2 font-semibold text-white hover:shadow-lg transition-all hover:scale-105`}
                >
                  Get Started
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          )
        })}
      </div>

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
              title: 'Configure',
              description: 'Set your preferences and options',
            },
            {
              step: '3',
              title: 'Download',
              description: 'Get your processed files instantly',
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
