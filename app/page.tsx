'use client'

import Link from 'next/link'
import {
  FileText,
  Zap,
  ShieldCheck,
  TrendingUp,
  Image as ImageIcon,
  Lock,
  ArrowUpDown,
  RotateCw,
  Table,
  Presentation,
  CheckCircle2,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { useState, useEffect } from 'react'
import { getPricingPlans, type PricingPlan } from '@/lib/api'
import { PublicNavbar } from '@/components/public-navbar'

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    async function fetchPricing() {
      try {
        const data = await getPricingPlans()
        // Ensure free plan is explicitly in the list if not returned by API
        const hasFree = data.some((p) => p.price === 0)
        if (!hasFree) {
          data.unshift({
            id: 0,
            price: 0,
            description: 'Free Tier',
            plan_type: 'free',
            duration_days: 0,
          })
        }
        setPlans(data)
      } catch (error) {
        console.error('Failed to load pricing plans', error)
      }
    }
    fetchPricing()
  }, [])

  const toggleFaq = (index: number) => {
    if (openFaq === index) setOpenFaq(null)
    else setOpenFaq(index)
  }

  const faqs = [
    {
      question: "Is PDFKU really free to use?",
      answer: "Yes! You can use our basic tools completely for free as a Guest. Free users have a 100MB file size limit and can process a limited number of files per operation. For unlimited access, you can upgrade to our Premium plan."
    },
    {
      question: "Are my files secure?",
      answer: "Absolutely. We use industry-standard encryption to protect your data. Files uploaded by guests are processed in memory and are never saved to our servers permanently."
    },
    {
      question: "Do I need to install any software?",
      answer: "No installation is required. PDFKU is a 100% cloud-based online tool. You can access it from any web browser on Windows, Mac, Linux, or mobile devices."
    },
    {
      question: "Can I cancel my premium subscription anytime?",
      answer: "Yes, our subscriptions are billed periodically (e.g., monthly) and you can cancel at any time from your account settings without any hidden fees."
    }
  ]

  const features = [
    {
      icon: FileText,
      title: 'Merge PDFs',
      description: 'Combine multiple PDF files into one single document with ease. Perfect for organizing reports.',
      href: '/merge',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      icon: FileText,
      title: 'PDF to Word',
      description: 'Convert PDF into fully editable DOCX format while preserving text formatting and images.',
      href: '/pdf-to-word',
      color: 'text-sky-500',
      bg: 'bg-sky-500/10'
    },
    {
      icon: Lock,
      title: 'Protect PDF',
      description: 'Encrypt your documents with strong AES password protection to keep sensitive data safe.',
      href: '/lock',
      color: 'text-rose-500',
      bg: 'bg-rose-500/10'
    },
    {
      icon: ArrowUpDown,
      title: 'Reorder Pages',
      description: 'Rearrange, extract, or remove specific pages from your PDF to create a customized document.',
      href: '/reorder',
      color: 'text-violet-500',
      bg: 'bg-violet-500/10'
    },
    {
      icon: ImageIcon,
      title: 'PDF to Images',
      description: 'Extract pages from your PDF into high-quality PNG images instantly.',
      href: '/pdf-to-images',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
    {
      icon: Table,
      title: 'PDF to Excel',
      description: 'Extract tabular data from PDF files into editable XLSX spreadsheets automatically.',
      href: '/pdf-to-excel',
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      icon: Presentation,
      title: 'PDF to PPTX',
      description: 'Turn your PDF presentations back into editable PowerPoint slides flawlessly.',
      href: '/pdf-to-powerpoint',
      color: 'text-orange-500',
      bg: 'bg-orange-500/10'
    },
    {
      icon: RotateCw,
      title: 'Rotate PDF',
      description: 'Rotate all or specific pages in your document by 90, 180, or 270 degrees.',
      href: '/rotate',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border px-4 pt-24 pb-32 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative mx-auto max-w-7xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
            </span>
            #1 Online PDF Toolkit
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl">
            Simplify Your PDF <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Workflow Today
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-xl text-muted-foreground leading-relaxed">
            Merge, convert, protect, and manipulate your PDF files in seconds. No complicated software to install. Fast, secure, and beautifully designed.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={isAuthenticated ? '/dashboard' : '/register'}
              className="w-full sm:w-auto rounded-xl bg-primary px-8 py-4 text-center text-lg font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:bg-primary/90"
            >
              Start Free Trial
            </Link>
            {!isAuthenticated && (
              <Link
                href="#features"
                className="w-full sm:w-auto rounded-xl border-2 border-primary/20 bg-card px-8 py-4 text-center text-lg font-bold text-foreground transition-all hover:border-primary/50 hover:bg-muted"
              >
                Explore Tools
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Social Proof / Trust Section */}
      <section className="border-b border-border bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Trusted by professionals worldwide
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 opacity-50 grayscale sm:gap-16">
            {/* Dummy Logos */}
            <div className="flex items-center gap-2 text-xl font-black tracking-tighter"><ShieldCheck size={28} /> SECURECORP</div>
            <div className="flex items-center gap-2 text-xl font-black tracking-tighter"><TrendingUp size={28} /> ANALYTICA</div>
            <div className="flex items-center gap-2 text-xl font-black tracking-tighter"><Zap size={28} /> BOLT SYSTEMS</div>
            <div className="flex items-center gap-2 text-xl font-black tracking-tighter"><FileText size={28} /> DOCUWORKS</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
              How PDFKU Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Process your documents in three simple steps.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative rounded-3xl border border-border bg-card p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-black text-primary">1</div>
              <h3 className="mt-6 text-xl font-bold">Upload File</h3>
              <p className="mt-3 text-muted-foreground">Drag and drop your PDF or select it from your device securely.</p>
            </div>
            <div className="relative rounded-3xl border border-border bg-card p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:accent/50">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-2xl font-black text-accent">2</div>
              <h3 className="mt-6 text-xl font-bold">Process Document</h3>
              <p className="mt-3 text-muted-foreground">Choose your desired tool and let our fast servers handle the heavy lifting.</p>
            </div>
            <div className="relative rounded-3xl border border-border bg-card p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-green-500/50">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10 text-2xl font-black text-green-500">3</div>
              <h3 className="mt-6 text-xl font-bold">Download Result</h3>
              <p className="mt-3 text-muted-foreground">Get your newly processed file instantly without any quality loss.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-y border-border bg-muted/20 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Everything you need to manage PDFs
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A complete suite of powerful tools designed to make your document workflow seamless and efficient.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description, href, color, bg }, i) => (
              <Link
                key={i}
                href={href}
                className="group relative flex flex-col justify-between rounded-3xl border border-border bg-card p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
              >
                <div>
                  <div className={`mb-6 inline-flex rounded-2xl ${bg} p-4`}>
                    <Icon size={28} className={color} />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">{title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{description}</p>
                </div>
                <div className="mt-8 font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100 flex items-center gap-1">
                  Try it now <TrendingUp size={16} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose the perfect plan for your needs.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {plans.map((plan) => {
              const isPremium = plan.price > 0;
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-3xl border p-10 transition-all ${isPremium
                    ? 'border-primary bg-primary text-primary-foreground shadow-2xl scale-105 z-10'
                    : 'border-border bg-card hover:border-primary/30'
                    }`}
                >
                  {isPremium && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-sm font-bold text-accent-foreground shadow-sm">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-3xl font-bold capitalize">{plan.description || plan.plan_type || 'Free'}</h3>
                  <p className={`mt-2 text-sm ${isPremium ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {isPremium ? 'For power users and professionals' : 'Perfect for getting started'}
                  </p>

                  <div className="my-8 flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold">{plan.price === 0 ? 'Free' : `Rp ${plan.price.toLocaleString('id-ID')}`}</span>
                    {plan.price > 0 && <span className={`text-lg font-medium ${isPremium ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>/ {plan.duration_days} days</span>}
                  </div>

                  <div className="flex-1 space-y-4">
                    {isPremium ? (
                      <>
                        <li className="flex items-center gap-3"><CheckCircle2 size={20} className="text-accent" /> <span className="font-medium">Unlimited operations</span></li>
                        <li className="flex items-center gap-3"><CheckCircle2 size={20} className="text-accent" /> <span className="font-medium">All PDF tools included</span></li>
                        <li className="flex items-center gap-3"><CheckCircle2 size={20} className="text-accent" /> <span className="font-medium">Unlimited file sizes</span></li>
                        <li className="flex items-center gap-3"><CheckCircle2 size={20} className="text-accent" /> <span className="font-medium">Cloud history storage</span></li>
                        <li className="flex items-center gap-3"><CheckCircle2 size={20} className="text-accent" /> <span className="font-medium">Priority support</span></li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-center gap-3"><CheckCircle2 size={20} className="text-primary" /> <span>Basic PDF tools</span></li>
                        <li className="flex items-center gap-3"><CheckCircle2 size={20} className="text-primary" /> <span>100MB file size limit</span></li>
                        <li className="flex items-center gap-3"><CheckCircle2 size={20} className="text-primary" /> <span>Up to 3 files per merge</span></li>
                        <li className="flex items-center gap-3"><CheckCircle2 size={20} className="text-primary" /> <span>Email support</span></li>
                      </>
                    )}
                  </div>

                  <Link
                    href={isAuthenticated ? '/dashboard' : '/register'}
                    className={`mt-10 block rounded-xl py-4 text-center text-lg font-bold transition-all ${isPremium
                      ? 'bg-background text-foreground hover:bg-muted'
                      : 'border-2 border-primary bg-transparent text-primary hover:bg-primary/5'
                      }`}
                  >
                    Get Started Now
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-border bg-muted/10 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-2xl border border-border bg-card overflow-hidden transition-all"
              >
                <button
                  className="flex w-full items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="text-lg font-semibold">{faq.question}</span>
                  <ChevronDown
                    size={20}
                    className={`text-muted-foreground transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-br from-primary to-accent px-6 py-16 text-center shadow-2xl sm:px-16">
          <h2 className="text-3xl font-extrabold text-white sm:text-5xl">
            Ready to transform your documents?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90">
            Join thousands of professionals who use PDFKU every day to manage their PDF workflow efficiently.
          </p>
          <div className="mt-10 flex justify-center">
            <Link
              href={isAuthenticated ? '/dashboard' : '/register'}
              className="rounded-xl bg-white px-10 py-4 text-xl font-bold text-primary shadow-lg transition-transform hover:scale-105"
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>

      {/* Extended Footer */}
      <footer className="border-t border-border bg-card px-4 pt-16 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <FileText size={20} className="text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">PDFKU</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The ultimate toolkit to manage, convert, and edit your PDF files securely online.
              </p>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-foreground">PDF Tools</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/merge" className="hover:text-primary transition-colors">Merge PDF</Link></li>
                <li><Link href="/rotate" className="hover:text-primary transition-colors">Rotate PDF</Link></li>
                <li><Link href="/reorder" className="hover:text-primary transition-colors">Reorder Pages</Link></li>
                <li><Link href="/lock" className="hover:text-primary transition-colors">Protect PDF</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-foreground">Converters</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/pdf-to-word" className="hover:text-primary transition-colors">PDF to Word</Link></li>
                <li><Link href="/pdf-to-excel" className="hover:text-primary transition-colors">PDF to Excel</Link></li>
                <li><Link href="/pdf-to-powerpoint" className="hover:text-primary transition-colors">PDF to PowerPoint</Link></li>
                <li><Link href="/to-pdf" className="hover:text-primary transition-colors">Convert to PDF</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-foreground">Company</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center justify-between border-t border-border pt-8 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} PDFKU. All rights reserved.
            </p>
            <div className="mt-4 flex space-x-4 sm:mt-0 opacity-50">
              <div className="h-5 w-5 rounded-full bg-foreground"></div>
              <div className="h-5 w-5 rounded-full bg-foreground"></div>
              <div className="h-5 w-5 rounded-full bg-foreground"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
