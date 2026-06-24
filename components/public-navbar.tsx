'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FileText, Moon, Sun, Menu, X } from 'lucide-react'
import { useTheme } from '@/context/theme-context'
import { useAuth } from '@/context/auth-context'
import { useState } from 'react'

export function PublicNavbar() {
  const { isDark, setTheme } = useTheme()
  const { isAuthenticated } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="PDFKU Logo" width={60} height={60} className="rounded-lg object-contain" />
            {/* <span className="hidden text-lg font-bold sm:inline">PDFKU</span> */}
          </Link>

          {/* Desktop Menu */}
          <div className="hidden flex-1 items-center justify-center gap-8 md:flex">
            <Link
              href="/#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#pricing"
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
        <div className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="border-t border-border pb-4 pt-2">
            <Link
              href="/#features"
              className="block px-4 py-3 text-base font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground active:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/#pricing"
              className="block px-4 py-3 text-base font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground active:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <div className="border-t border-border px-4 py-4 mt-2 space-y-3">
              <button
                onClick={() => {
                  setTheme(isDark ? 'light' : 'dark')
                  setMobileMenuOpen(false)
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-base font-medium hover:bg-muted active:bg-muted/80"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="block w-full rounded-xl bg-primary px-4 py-3 text-center text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors active:scale-[0.98]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    href="/login"
                    className="block w-full rounded-xl border-2 border-border px-4 py-2.5 text-center text-base font-semibold hover:bg-muted transition-colors active:scale-[0.98]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block w-full rounded-xl bg-primary px-4 py-2.5 text-center text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors active:scale-[0.98]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
