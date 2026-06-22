'use client'

import Link from 'next/link'
import {
  FileText,
  Zap,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '@/context/auth-context'

const services = [
  {
    id: 'merge',
    title: 'Merge PDFs',
    description: 'Combine multiple PDF files into one seamless document',
    icon: FileText,
    href: '/dashboard/merge',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'compress',
    title: 'Compress',
    description: 'Reduce file size while maintaining quality',
    icon: Zap,
    href: '/dashboard/compress',
    color: 'from-amber-500 to-amber-600',
  },
  {
    id: 'split',
    title: 'Split PDFs',
    description: 'Extract and separate pages from your documents',
    icon: ShieldCheck,
    href: '/dashboard/split',
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'convert',
    title: 'Convert',
    description: 'Transform PDFs to images and vice versa',
    icon: TrendingUp,
    href: '/dashboard/convert',
    color: 'from-purple-500 to-purple-600',
  },
]

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-muted-foreground">
          Transform your PDFs with our suite of powerful tools
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <p className="text-3xl font-bold capitalize">{user?.plan}</p>
            </div>
            <div className="rounded-lg bg-primary/10 p-3">
              <Zap className="text-primary" size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Account Status</p>
              <p className="text-3xl font-bold text-green-500">Active</p>
            </div>
            <div className="rounded-lg bg-green-500/10 p-3">
              <ShieldCheck className="text-green-500" size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Files Processed</p>
              <p className="text-3xl font-bold">12</p>
            </div>
            <div className="rounded-lg bg-accent/10 p-3">
              <FileText className="text-accent" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Available Services</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const Icon = service.icon
            return (
              <Link
                key={service.id}
                href={service.href}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-all hover:shadow-lg"
              >
                {/* Background gradient effect */}
                <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${service.color} opacity-10 group-hover:opacity-20 transition-opacity`} />

                <div className="relative space-y-4">
                  <div className={`inline-block rounded-lg bg-gradient-to-br ${service.color} p-3`}>
                    <Icon size={24} className="text-white" />
                  </div>

                  <div>
                    <h3 className="font-bold">{service.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {service.description}
                    </p>
                  </div>

                  <div className="flex items-center text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
                    Get Started
                    <ArrowRight size={16} className="ml-2" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 font-bold">Quick Tips</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Free tier supports up to 5 operations per day</li>
          <li>• Upgrade to Premium for unlimited operations</li>
          <li>• Check your history to see all processed files</li>
          <li>• All data is processed securely and privately</li>
        </ul>
      </div>
    </div>
  )
}
