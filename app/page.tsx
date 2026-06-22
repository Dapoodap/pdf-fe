'use client'

import Link from 'next/link'
import {
  FileText,
  Zap,
  ShieldCheck,
  TrendingUp,
  Menu,
  X,
  Moon,
  Sun,
} from 'lucide-react'
import { useTheme } from '@/context/theme-context'
import { useAuth } from '@/context/auth-context'
import { useState, useEffect } from 'react'
import { getPricingPlans, type PricingPlan } from '@/lib/api'

export default function HomePage() {
  const { isDark, setTheme } = useTheme()
  const { isAuthenticated } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [plans, setPlans] = useState<PricingPlan[]>([])

  useEffect(() => {
    getPricingPlans().then(data => {
      const freePlan: PricingPlan = {
        id: 0,
        name: 'Free',
        price: 0,
        plan_type: 'forever',
        description: 'Perfect for getting started',
        duration_days: 0,
      } as any
      setPlans([freePlan, ...data])
    }).catch(console.error)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <FileText size={20} className="text-primary-foreground" />
              </div>
              <span className="hidden text-lg font-bold sm:inline">PDFKit</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden flex-1 items-center justify-center gap-8 md:flex">
              <Link
                href="#features"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </Link>
            </div>

            {/* Desktop Actions */}
            <div className="hidden items-center gap-4 md:flex">
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="rounded-lg p-2 hover:bg-muted"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 hover:bg-muted md:hidden"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="border-t border-border pb-4 md:hidden">
              <Link
                href="#features"
                className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <div className="border-t border-border px-4 py-3">
                <button
                  onClick={() => {
                    setTheme(isDark ? 'light' : 'dark')
                    setMobileMenuOpen(false)
                  }}
                  className="mb-2 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium hover:bg-muted"
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>
                {isAuthenticated ? (
                  <Link
                    href="/dashboard"
                    className="block w-full rounded-lg bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block w-full rounded-lg border border-border px-3 py-2 text-center text-sm font-semibold hover:bg-muted transition-colors mb-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="block w-full rounded-lg bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="overflow-hidden border-b border-border px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Transform Your PDFs with{' '}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Professional Tools
                </span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Merge, compress, split, and convert PDFs in seconds. No complicated software.
                No steep learning curve. Just powerful PDF tools.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={isAuthenticated ? '/dashboard' : '/register'}
                  className="rounded-lg bg-primary px-8 py-3 text-center font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="#pricing"
                  className="rounded-lg border border-primary px-8 py-3 text-center font-semibold text-primary hover:bg-primary/5 transition-colors"
                >
                  View Pricing
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl" />
                <div className="relative rounded-2xl border border-border bg-card p-8 backdrop-blur">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                      <FileText size={24} className="text-primary" />
                      <span className="font-semibold">Merge PDFs</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                      <Zap size={24} className="text-accent" />
                      <span className="font-semibold">Compress Files</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                      <ShieldCheck size={24} className="text-primary" />
                      <span className="font-semibold">Secure & Private</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-b border-border px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Powerful PDF Features
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to work with PDFs efficiently
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: FileText,
                title: 'Merge PDFs',
                description: 'Combine multiple PDF files into one with ease',
              },
              {
                icon: Zap,
                title: 'Compress',
                description: 'Reduce file size without losing quality',
              },
              {
                icon: ShieldCheck,
                title: 'Split PDFs',
                description: 'Extract specific pages from your documents',
              },
              {
                icon: TrendingUp,
                title: 'Convert',
                description: 'Convert between PDF and image formats',
              },
            ].map(({ icon: Icon, title, description }, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-colors"
              >
                <div className="mb-3 inline-block rounded-lg bg-primary/10 p-3">
                  <Icon size={24} className="text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="border-b border-border px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose the perfect plan for your needs
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-3xl mx-auto">
            {plans.map((plan) => {
              const isPremium = plan.price > 0;
              return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-8 transition-all flex flex-col ${
                  isPremium
                    ? 'border-primary bg-card shadow-lg ring-2 ring-primary/20 scale-105 z-10'
                    : 'border-border bg-card hover:border-primary/30'
                }`}
              >
                {isPremium && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold capitalize">{plan.description || plan.plan_type || 'Free'}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{isPremium ? 'For power users' : 'Perfect for getting started'}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price === 0 ? 'Free' : `$${(plan.price / 15000).toFixed(2)}`}</span>
                  {plan.price > 0 && <span className="text-muted-foreground">/ {plan.duration_days} days</span>}
                </div>
                <ul className="mt-8 space-y-3">
                    {isPremium ? (
                      <>
                        <li className="flex items-center gap-2 text-sm"><div className="h-1.5 w-1.5 rounded-full bg-primary" /> Unlimited operations per day</li>
                        <li className="flex items-center gap-2 text-sm"><div className="h-1.5 w-1.5 rounded-full bg-primary" /> All PDF tools included</li>
                        <li className="flex items-center gap-2 text-sm"><div className="h-1.5 w-1.5 rounded-full bg-primary" /> Unlimited file processing size</li>
                        <li className="flex items-center gap-2 text-sm"><div className="h-1.5 w-1.5 rounded-full bg-primary" /> Merge unlimited files</li>
                        <li className="flex items-center gap-2 text-sm"><div className="h-1.5 w-1.5 rounded-full bg-primary" /> Priority email & chat support</li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-center gap-2 text-sm"><div className="h-1.5 w-1.5 rounded-full bg-primary" /> Basic PDF tools</li>
                        <li className="flex items-center gap-2 text-sm"><div className="h-1.5 w-1.5 rounded-full bg-primary" /> Up to 3 files per merge</li>
                        <li className="flex items-center gap-2 text-sm"><div className="h-1.5 w-1.5 rounded-full bg-primary" /> 100MB file size limit</li>
                        <li className="flex items-center gap-2 text-sm"><div className="h-1.5 w-1.5 rounded-full bg-primary" /> Email support</li>
                      </>
                    )}
                </ul>
                <Link
                  href={isAuthenticated ? '/dashboard' : '/register'}
                  className={`mt-10 block rounded-lg py-2 text-center font-semibold transition-colors ${
                    isPremium
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border border-primary text-primary hover:bg-primary/5'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            )})}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 PDFKit. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
