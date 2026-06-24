'use client'

import Link from 'next/link'
import { useState } from 'react'
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
  ShieldCheck,
  Activity,
  Settings2,
  Check,
  X,
  Loader2,
  PenTool
} from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { useServices } from '@/context/services-context'
import { SERVICE_METADATA } from '@/lib/api'
import { useQuickAccess } from '@/hooks/use-quick-access'

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

export default function DashboardPage() {
  const { user } = useAuth()
  const { services, loading, error } = useServices()
  const [isEditingQuickAccess, setIsEditingQuickAccess] = useState(false)
  
  // Default to the first 4 services if none saved
  const defaultServices = services.slice(0, 4).map(s => s.name)
  const { quickAccess, updateQuickAccess, isMounted } = useQuickAccess(defaultServices)

  const [tempSelection, setTempSelection] = useState<string[]>([])

  const openEditor = () => {
    setTempSelection(quickAccess.length > 0 ? quickAccess : defaultServices)
    setIsEditingQuickAccess(true)
  }

  const toggleSelection = (serviceName: string) => {
    if (tempSelection.includes(serviceName)) {
      setTempSelection(tempSelection.filter(name => name !== serviceName))
    } else {
      if (tempSelection.length < 4) {
        setTempSelection([...tempSelection, serviceName])
      }
    }
  }

  const saveQuickAccess = () => {
    updateQuickAccess(tempSelection)
    setIsEditingQuickAccess(false)
  }

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

  // Find actual service objects for quick access
  const activeQuickAccessIds = quickAccess.length > 0 ? quickAccess : defaultServices
  const quickServices = activeQuickAccessIds
    .map(name => services.find(s => s.name === name))
    .filter(Boolean) as typeof services

  const manipulationServices = services.filter(s => SERVICE_METADATA[s.name]?.category === 'manipulation')
  const conversionServices = services.filter(s => SERVICE_METADATA[s.name]?.category === 'conversion')

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 relative">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight break-words">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Transform your PDFs with our suite of powerful tools
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Available Services</p>
              <p className="text-3xl font-bold">{services.length}</p>
            </div>
            <div className="rounded-lg bg-primary/10 p-3">
              <Activity className="text-primary" size={24} />
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
              <p className="text-sm text-muted-foreground">Categories</p>
              <p className="text-3xl font-bold">2</p>
              <p className="text-xs text-muted-foreground mt-1">Manipulation & Conversion</p>
            </div>
            <div className="rounded-lg bg-accent/10 p-3">
              <FileText className="text-accent" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Services Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Quick Access</h2>
            <button
              onClick={openEditor}
              className="flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-xs font-semibold hover:bg-muted/80 transition-colors"
            >
              <Settings2 size={14} /> Customize
            </button>
          </div>
          <Link
            href="/dashboard/services"
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            View All Services
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {quickServices.map((service) => {
            const meta = SERVICE_METADATA[service.name]
            if (!meta) return null
            const Icon = iconMap[meta.icon] || FileText
            
            return (
              <Link
                key={service.id}
                href={meta.href}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-all hover:shadow-lg"
              >
                <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${meta.color} opacity-10 group-hover:opacity-20 transition-opacity`} />

                <div className="relative space-y-4">
                  <div className={`inline-block rounded-lg bg-gradient-to-br ${meta.color} p-3`}>
                    <Icon size={24} className="text-white" />
                  </div>

                  <div>
                    <h3 className="font-bold capitalize">{meta.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
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
          {quickServices.length === 0 && isMounted && (
            <div className="col-span-full rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
              No quick access services selected. Click Customize to add some!
            </div>
          )}
        </div>
      </div>

      {/* All Services Overview */}
      <div className="space-y-4 pt-4">
        <h2 className="text-2xl font-bold">All Services Overview</h2>

        {/* Manipulation */}
        {manipulationServices.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-muted-foreground">PDF Manipulation</h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {manipulationServices.map(service => {
                const meta = SERVICE_METADATA[service.name]
                if (!meta) return null
                const Icon = iconMap[meta.icon] || FileText
                return (
                  <Link
                    key={service.id}
                    href={meta.href}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-all hover:shadow-sm"
                  >
                    <div className={`rounded-lg bg-gradient-to-br ${meta.color} p-2`}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{meta.title}</p>
                      <p className="text-xs text-muted-foreground">{meta.category}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Conversion */}
        {conversionServices.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-muted-foreground">PDF Conversion</h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
              {conversionServices.map(service => {
                const meta = SERVICE_METADATA[service.name]
                if (!meta) return null
                const Icon = iconMap[meta.icon] || FileText
                return (
                  <Link
                    key={service.id}
                    href={meta.href}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-all hover:shadow-sm"
                  >
                    <div className={`rounded-lg bg-gradient-to-br ${meta.color} p-2`}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{meta.title}</p>
                      <p className="text-xs text-muted-foreground">{meta.category}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Quick Access Customization Modal */}
      {isEditingQuickAccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Customize Quick Access</h2>
                <p className="text-sm text-muted-foreground">
                  Select up to 4 services to pin to your dashboard ({tempSelection.length}/4)
                </p>
              </div>
              <button 
                onClick={() => setIsEditingQuickAccess(false)}
                className="rounded-lg p-2 hover:bg-muted"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-2 grid gap-3 sm:grid-cols-2">
              {services.map(service => {
                const meta = SERVICE_METADATA[service.name]
                if (!meta) return null
                const Icon = iconMap[meta.icon] || FileText
                const isSelected = tempSelection.includes(service.name)
                const isDisabled = !isSelected && tempSelection.length >= 4

                return (
                  <button
                    key={service.id}
                    onClick={() => toggleSelection(service.name)}
                    disabled={isDisabled}
                    className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                        : isDisabled 
                          ? 'border-border opacity-50 cursor-not-allowed bg-muted/50'
                          : 'border-border hover:border-primary/50 bg-card'
                    }`}
                  >
                    <div className={`rounded-lg p-2 ${isSelected ? `bg-gradient-to-br ${meta.color} text-white` : 'bg-muted text-muted-foreground'}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{meta.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{service.description}</p>
                    </div>
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${isSelected ? 'border-primary bg-primary text-white' : 'border-input'}`}>
                      {isSelected && <Check size={12} />}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
              <button
                onClick={() => setIsEditingQuickAccess(false)}
                className="rounded-lg px-4 py-2 text-sm font-semibold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={saveQuickAccess}
                className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
