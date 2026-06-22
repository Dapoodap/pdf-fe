'use client'

import { useState, useEffect } from 'react'
import { Check, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { getPricingPlans, subscribeApi, type PricingPlan } from '@/lib/api'
import Link from 'next/link'
import Script from 'next/script'

declare global {
  interface Window {
    snap: any;
  }
}

export default function PaymentPage() {
  const { user, refreshUser } = useAuth()
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)
  const [processing, setProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  useEffect(() => {
    getPricingPlans().then(data => {
      // Create a default free plan
      const freePlan: PricingPlan = {
        id: 0,
        name: 'Free',
        price: 0,
        plan_type: 'forever',
        description: 'Perfect for occasional users',
        duration_days: 0,
      } as any
      setPlans([freePlan, ...data])
    }).catch(console.error)
  }, [])

  const handleSubscribe = async (plan: PricingPlan) => {
    if (plan.id === 0) return // Free plan

    setSelectedPlan(plan.id)
    setProcessing(true)

    try {
      // 1. Get Snap Token
      const response = await fetch('/api/midtrans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: plan.price,
          pricing_id: plan.id,
          username: user?.username,
          email: user?.email
        }),
      })
      const data = await response.json()

      if (data.token) {
        // 2. Trigger Snap Popup
        window.snap.pay(data.token, {
          onSuccess: async (result: any) => {
            // 3. Call backend subscribe API
            await subscribeApi(plan.id, result, data.order_id)
            setPaymentSuccess(true)
            await refreshUser()
            setTimeout(() => {
              setPaymentSuccess(false)
              setSelectedPlan(null)
            }, 3000)
            setProcessing(false)
          },
          onPending: (result: any) => {
            console.log('Payment pending', result)
            setProcessing(false)
          },
          onError: (result: any) => {
            console.error('Payment error', result)
            setProcessing(false)
          },
          onClose: () => {
            setProcessing(false)
          }
        })
      } else {
        throw new Error(data.error || 'Failed to get payment token')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to initiate payment. See console for details.')
      setProcessing(false)
    }
  }

  const currentPlanName = user?.membership_status === 'premium' ? 'Premium' : 'Free'
  const snapScriptUrl = process.env.NODE_ENV === 'production' 
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js'

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Midtrans Script */}
      <Script 
        src={snapScriptUrl} 
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''} 
      />

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="rounded-lg p-2 hover:bg-muted transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Upgrade Plan</h1>
          <p className="text-muted-foreground">
            Choose a subscription plan that works for you
          </p>
        </div>
      </div>

      {/* Current Plan */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current Plan</p>
            <p className="text-3xl font-bold capitalize">{currentPlanName}</p>
          </div>
          <div className={`rounded-lg px-4 py-2 font-semibold ${
            user?.membership_status === 'premium' 
              ? 'bg-primary/10 text-primary' 
              : 'bg-muted text-muted-foreground'
          }`}>
            {user?.membership_status === 'premium' ? 'Premium Member' : 'Free Member'}
          </div>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Choose Your Plan</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan, index) => {
            const isPremium = plan.price > 0;
            const isCurrent = (isPremium && user?.membership_status === 'premium') || (!isPremium && user?.membership_status !== 'premium');
            
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-8 transition-all ${
                  isPremium
                    ? 'border-primary bg-card ring-2 ring-primary/20 shadow-lg'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                {isPremium && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                    Most Popular
                  </div>
                )}

                <div className="space-y-6">
                  {/* Name & Description */}
                  <div>
                    <h3 className="text-2xl font-bold capitalize">{plan.description || plan.plan_type || 'Free'}</h3>
                  </div>

                  {/* Pricing */}
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">
                        {plan.price === 0 ? 'Free' : `Rp ${plan.price.toLocaleString('id-ID')}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-sm text-muted-foreground">/ {plan.duration_days} days</span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3">
                    {isPremium ? (
                      <>
                        <li className="flex items-center gap-2 text-sm"><Check size={16} className="text-primary flex-shrink-0" /> Unlimited operations per day</li>
                        <li className="flex items-center gap-2 text-sm"><Check size={16} className="text-primary flex-shrink-0" /> All PDF tools included</li>
                        <li className="flex items-center gap-2 text-sm"><Check size={16} className="text-primary flex-shrink-0" /> Unlimited file processing size</li>
                        <li className="flex items-center gap-2 text-sm"><Check size={16} className="text-primary flex-shrink-0" /> Merge unlimited files</li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-center gap-2 text-sm"><Check size={16} className="text-primary flex-shrink-0" /> Basic PDF tools</li>
                        <li className="flex items-center gap-2 text-sm"><Check size={16} className="text-primary flex-shrink-0" /> Up to 3 files per merge</li>
                        <li className="flex items-center gap-2 text-sm"><Check size={16} className="text-primary flex-shrink-0" /> 100MB file size limit</li>
                      </>
                    )}
                  </ul>

                  {/* Button */}
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={isCurrent || (processing && selectedPlan === plan.id)}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      isPremium
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
                        : 'border border-primary text-primary hover:bg-primary/5 disabled:opacity-50'
                    }`}
                  >
                    {isCurrent
                      ? 'Current Plan'
                      : processing && selectedPlan === plan.id
                        ? 'Processing...'
                        : paymentSuccess && selectedPlan === plan.id
                          ? 'Subscription Activated!'
                          : isPremium ? 'Subscribe Now' : 'Free Tier'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
