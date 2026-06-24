'use client'

import { useEffect, useState } from 'react'
import { Bell, Lock, User, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import Link from 'next/link'

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile')
  const [saved, setSaved] = useState(false)
  const [timeLeft, setTimeLeft] = useState<string>('')

  useEffect(() => {
    if (user?.membership_status === 'premium' && user.subscription_end_date) {
      const updateCountdown = () => {
        const end = new Date(user.subscription_end_date!).getTime()
        const now = new Date().getTime()
        const diff = end - now

        if (diff <= 0) {
          setTimeLeft('Expired')
          return
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        setTimeLeft(`${days} days, ${hours}h ${minutes}m ${seconds}s`)
      }

      updateCountdown()
      const interval = setInterval(updateCountdown, 1000)
      return () => clearInterval(interval)
    }
  }, [user])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <nav className="space-y-2 rounded-xl border border-border bg-card p-4">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'security', label: 'Security', icon: Lock },
              { id: 'notifications', label: 'Notifications', icon: Bell },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`w-full flex items-center gap-3 rounded-lg px-4 py-2 text-left font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6 rounded-xl border border-border bg-card p-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Profile Settings</h2>
                <p className="text-muted-foreground">
                  Manage your account information
                </p>
              </div>

              <div className="space-y-6 border-t border-border pt-6">
                {/* Username */}
                <div className="space-y-2">
                  <label className="font-semibold">Username</label>
                  <input
                    type="text"
                    defaultValue={user?.username}
                    disabled
                    className="w-full rounded-lg border border-input bg-muted/50 px-4 py-2 text-foreground"
                  />
                  <p className="text-xs text-muted-foreground">Username cannot be changed</p>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="font-semibold">Email Address</label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    disabled
                    className="w-full rounded-lg border border-input bg-muted/50 px-4 py-2 text-foreground"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                {/* Membership Status & Countdown */}
                <div className="space-y-2">
                  <label className="font-semibold">Membership Status</label>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-border bg-card p-4 gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${user?.membership_status === 'premium' ? 'bg-amber-500/20 text-amber-500' : 'bg-primary/20 text-primary'}`}>
                        {user?.membership_status === 'premium' ? <Lock size={20} /> : <User size={20} />}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{user?.membership_status || 'Free'} Plan</p>
                        {user?.membership_status === 'premium' ? (
                          <p className="text-sm text-amber-500 font-medium">
                            Expires in: {timeLeft || 'Loading...'}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">Limited features</p>
                        )}
                      </div>
                    </div>
                    {user?.membership_status !== 'premium' && (
                      <Link
                        href="/pricing"
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors text-center"
                      >
                        Upgrade to Premium
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6 rounded-xl border border-border bg-card p-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Security Settings</h2>
                <p className="text-muted-foreground">
                  Manage your account security
                </p>
              </div>

              <div className="space-y-6 border-t border-border pt-6">
                {/* Change Password */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Change Password</h3>
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="Current Password"
                      className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input
                      type="password"
                      placeholder="New Password"
                      className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <button className="rounded-lg bg-primary px-6 py-2 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                    Update Password
                  </button>
                </div>

                {/* Two Factor Auth */}
                <div className="border-t border-border pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Two-Factor Authentication</h3>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security
                      </p>
                    </div>
                    <button className="rounded-lg border border-primary px-6 py-2 font-semibold text-primary hover:bg-primary/5 transition-colors">
                      Enable
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 rounded-xl border border-border bg-card p-8">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Notification Settings</h2>
                <p className="text-muted-foreground">
                  Control how you receive notifications
                </p>
              </div>

              <div className="space-y-6 border-t border-border pt-6">
                {[
                  {
                    title: 'Email Notifications',
                    description: 'Receive updates about your account',
                  },
                  {
                    title: 'Processing Updates',
                    description: 'Get notified when files are processed',
                  },
                  {
                    title: 'New Features',
                    description: 'Stay updated with new features and updates',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b border-border pb-4 last:border-b-0 last:pb-0"
                  >
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-5 w-5 rounded border-border"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handleSave}
                className="rounded-lg bg-primary px-6 py-2 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Save Preferences
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-8">
        <h3 className="font-bold text-destructive mb-4">Danger Zone</h3>
        <p className="text-sm text-muted-foreground mb-4">
          These actions cannot be undone. Please proceed with caution.
        </p>
        <button
          onClick={logout}
          className="rounded-lg border border-destructive px-6 py-2 font-semibold text-destructive hover:bg-destructive/10 transition-colors"
        >
          Logout from All Devices
        </button>
      </div>
    </div>
  )
}
