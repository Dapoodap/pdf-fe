'use client'

import { useState, useEffect } from 'react'
import {
  Download,
  FileText,
  Search,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { getUserHistory, getDownloadUrl, type HistoryItem } from '@/lib/api'

const serviceNames: Record<number, string> = {
  1: 'Merge',
  2: 'Rotate',
  3: 'Reorder',
  4: 'Lock',
  5: 'PDF to Images',
  6: 'PDF to Word',
  7: 'PDF to Excel',
  8: 'PDF to PowerPoint',
  9: 'To PDF',
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 1000 / 60)
  const hours = Math.floor(diff / 1000 / 60 / 60)
  const days = Math.floor(diff / 1000 / 60 / 60 / 24)

  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

export default function HistoryPage() {
  const { user } = useAuth()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterService, setFilterService] = useState<string>('all')
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetchHistory()
    }
  }, [user?.id])

  const fetchHistory = async () => {
    if (!user?.id) return
    setLoading(true)
    setError(null)
    try {
      const data = await getUserHistory(user.id)
      setHistory(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (historyId: number) => {
    setDownloadingId(historyId)
    try {
      const data = await getDownloadUrl(historyId)
      window.open(data.url, '_blank')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Download failed')
    } finally {
      setDownloadingId(null)
    }
  }

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.file_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesService =
      filterService === 'all' || serviceNames[item.service_id] === filterService
    return matchesSearch && matchesService
  })

  // Get unique service names from history
  const uniqueServices = Array.from(
    new Set(history.map((item) => serviceNames[item.service_id]).filter(Boolean))
  )

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Processing History</h1>
        <p className="text-muted-foreground">
          View and download all your previous PDF operations
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchHistory}
            className="rounded-lg bg-destructive/20 px-3 py-1 text-xs font-semibold hover:bg-destructive/30 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search and Filter */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <select
          value={filterService}
          onChange={(e) => setFilterService(e.target.value)}
          className="rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">All Operations</option>
          {uniqueServices.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Operations</p>
          <p className="text-2xl font-bold text-blue-500">{history.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">PDF Files</p>
          <p className="text-2xl font-bold text-amber-500">
            {history.filter((h) => h.file_type === 'pdf').length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Other Formats</p>
          <p className="text-2xl font-bold text-purple-500">
            {history.filter((h) => h.file_type !== 'pdf').length}
          </p>
        </div>
      </div>

      {/* History Table */}
      {filteredHistory.length > 0 ? (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-card">
                  <th className="px-6 py-3 text-left text-sm font-semibold">File Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Service</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-3">
                        <FileText size={18} className="text-primary flex-shrink-0" />
                        <span className="truncate max-w-[200px]">{item.file_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {serviceNames[item.service_id] || `Service ${item.service_id}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground uppercase">
                      {item.file_type}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleDownload(item.id)}
                        disabled={downloadingId === item.id}
                        className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                      >
                        {downloadingId === item.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Download size={14} />
                        )}
                        Download
                        <ExternalLink size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <FileText size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="font-semibold">No files found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {history.length === 0
              ? 'Your processing history will appear here'
              : 'No files match your search criteria'}
          </p>
        </div>
      )}
    </div>
  )
}
