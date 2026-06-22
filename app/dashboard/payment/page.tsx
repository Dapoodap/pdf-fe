'use client'

import { useState } from 'react'
import { Check, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import Link from 'next/link'

const subscriptionPlans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'Forever',
    description: 'Perfect for occasional users',
    features: [
      'Up to 5 operations per day',
      'Basic PDF tools',
      'Up to 5 files per operation',
      'Email support',
    ],
    popular: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$9.99',
    period: 'Per Month',
    description: 'For power users and professionals',
    features: [
      'Unlimited operations per day',
      'All PDF tools included',
      'Unlimited file processing',
      'Priority email & chat support',
      'Advanced features',
    ],
    popular: true,
  },
]

export default function PaymentPage() {
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const handleSubscribe = async (planId: string) => {
    setSelectedPlan(planId)
    setProcessing(true)

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    setProcessing(false)
    setPaymentSuccess(true)

    // Reset after 3 seconds
    setTimeout(() => {
      setPaymentSuccess(false)
      setSelectedPlan(null)
    }, 3000)
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
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
            <p className="text-3xl font-bold capitalize">{user?.plan}</p>
          </div>
          <div className={`rounded-lg px-4 py-2 font-semibold ${
            user?.plan === 'premium' 
              ? 'bg-primary/10 text-primary' 
              : 'bg-muted text-muted-foreground'
          }`}>
            {user?.plan === 'premium' ? 'Premium Member' : 'Free Member'}
          </div>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Choose Your Plan</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-8 transition-all ${
                plan.popular
                  ? 'border-primary bg-card ring-2 ring-primary/20 shadow-lg'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                  Most Popular
                </div>
              )}

              <div className="space-y-6">
                {/* Name & Description */}
                <div>
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                </div>

                {/* Pricing */}
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.price !== '$0' && (
                      <span className="text-sm text-muted-foreground">/{plan.period.toLowerCase()}</span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check size={16} className="text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={processing && selectedPlan === plan.id || user?.plan === plan.id}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
                      : 'border border-primary text-primary hover:bg-primary/5 disabled:opacity-50'
                  }`}
                >
                  {user?.plan === plan.id
                    ? 'Current Plan'
                    : processing && selectedPlan === plan.id
                      ? 'Processing...'
                      : paymentSuccess && selectedPlan === plan.id
                        ? 'Subscription Activated!'
                        : 'Subscribe Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-8">
        <h2 className="text-2xl font-bold">Payment Methods</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { name: 'Credit Card', description: 'Visa, Mastercard, American Express' },
            { name: 'PayPal', description: 'Secure payment with PayPal' },
          ].map((method, i) => (
            <button
              key={i}
              className="rounded-lg border border-border p-4 text-left hover:border-primary transition-colors"
            >
              <h3 className="font-semibold">{method.name}</h3>
              <p className="text-sm text-muted-foreground">{method.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-8">
        <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: 'Can I cancel my subscription anytime?',
              a: 'Yes, you can cancel your Premium subscription at any time. You&apos;ll revert to the Free plan immediately.',
            },
            {
              q: 'Is there a free trial for Premium?',
              a: 'The Free plan gives you unlimited access to all features with a limit of 5 operations per day.',
            },
            {
              q: 'What payment methods do you accept?',
              a: 'We accept all major credit cards, PayPal, and other popular payment methods.',
            },
            {
              q: 'Do you offer refunds?',
              a: '30-day money-back guarantee on all Premium subscriptions. No questions asked.',
            },
          ].map((item, i) => (
            <div key={i} className="border-t border-border pt-4 first:border-t-0 first:pt-0">
              <p className="font-semibold mb-2">{item.q}</p>
              <p className="text-sm text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
