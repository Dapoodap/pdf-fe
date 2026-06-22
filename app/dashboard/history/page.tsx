'use client'

import { useState } from 'react'
import {
  Download,
  Trash2,
  FileText,
  Zap,
  ShieldCheck,
  TrendingUp,
  Search,
} from 'lucide-react'

const dummyHistory = [
  {
    id: '1',
    name: 'merged-document.pdf',
    operation: 'merge',
    size: '2.5 MB',
    date: new Date(Date.now() - 1000 * 60 * 5),
    status: 'completed',
  },
  {
    id: '2',
    name: 'compressed-invoice.pdf',
    operation: 'compress',
    size: '1.2 MB',
    date: new Date(Date.now() - 1000 * 60 * 30),
    status: 'completed',
  },
  {
    id: '3',
    name: 'split-pages-5-10.pdf',
    operation: 'split',
    size: '850 KB',
    date: new Date(Date.now() - 1000 * 60 * 60),
    status: 'completed',
  },
  {
    id: '4',
    name: 'converted-image.jpg',
    operation: 'convert',
    size: '3.2 MB',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: 'completed',
  },
  {
    id: '5',
    name: 'batch-merge-final.pdf',
    operation: 'merge',
    size: '4.8 MB',
    date: new Date(Date.now() - 1000 * 60 * 60 * 3),
    status: 'completed',

  },
  {
    id: '6',
    name: 'report-compressed.pdf',
    operation: 'compress',
    size: '890 KB',
    date: new Date(Date.now() - 1000 * 60 * 60 * 5),
    status: 'completed',

  },
  {
    id: '7',
    name: 'pdf-to-images.zip',
    operation: 'convert',
    size: '15 MB',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    status: 'completed',

  },
  {
    id: '8',
    name: 'extract-pages-1-20.pdf',
    operation: 'split',
    size: '2.1 MB',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    status: 'completed',

  },
  {
    id: '9',
    name: 'combined-contracts.pdf',
    operation: 'merge',
    size: '6.3 MB',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    status: 'completed',

  },
  {
    id: '10',
    name: 'optimized-presentation.pdf',
    operation: 'compress',
    size: '5.4 MB',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
    status: 'completed',

  },
  {
    id: '11',
    name: 'document-split.pdf',
    operation: 'split',
    size: '1.8 MB',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    status: 'completed',

  },
  {
    id: '12',
    name: 'scanned-docs.pdf',
    operation: 'convert',
    size: '8.7 MB',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
    status: 'completed',

  },
  {
    id: '13',
    name: 'final-report.pdf',
    operation: 'merge',
    size: '3.1 MB',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    status: 'completed',

  },
  {
    id: '14',
    name: 'light-document.pdf',
    operation: 'compress',
    size: '450 KB',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
    status: 'completed',

  },
  {
    id: '15',
    name: 'pages-extract.pdf',
    operation: 'split',
    size: '920 KB',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
    status: 'completed',

  },
  {
    id: '16',
    name: 'converted-to-pdf.pdf',
    operation: 'convert',
    size: '2.7 MB',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    status: 'completed',

  },
  {
    id: '17',
    name: 'multi-merge.pdf',
    operation: 'merge',
    size: '5.5 MB',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11),
    status: 'completed',

  },
  {
    id: '18',
    name: 'smaller-file.pdf',
    operation: 'compress',
    size: '2.1 MB',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12),
    status: 'completed',

  },
  {
    id: '19',
    name: 'partial-extract.pdf',
    operation: 'split',
    size: '1.5 MB',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 13),
    status: 'completed',

  },
  {
    id: '20',
    name: 'image-batch.zip',
    operation: 'convert',
    size: '12 MB',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
    status: 'completed',

  },
]

const operationIcons: Record<string, any> = {
  merge: FileText,
  compress: Zap,
  split: ShieldCheck,
  convert: TrendingUp,
}

const formatDate = (date: Date) => {
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
  const [searchTerm, setSearchTerm] = useState('')
  const [filterOperation, setFilterOperation] = useState<string>('all')

  const filteredHistory = dummyHistory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesOperation = filterOperation === 'all' || item.operation === filterOperation
    return matchesSearch && matchesOperation
  })

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Processing History</h1>
        <p className="text-muted-foreground">
          View and manage all your previous PDF operations
        </p>
      </div>

      {/* Search and Filter */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Search */}
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

        {/* Filter */}
        <select
          value={filterOperation}
          onChange={(e) => setFilterOperation(e.target.value)}
          className="rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">All Operations</option>
          <option value="merge">Merge</option>
          <option value="compress">Compress</option>
          <option value="split">Split</option>
          <option value="convert">Convert</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Total Operations', value: dummyHistory.length, color: 'text-blue-500' },
          { label: 'Total Files Processed', value: dummyHistory.length, color: 'text-amber-500' },
          { label: 'Total Downloaded', value: '87.5 MB', color: 'text-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* History Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-card">
                <th className="px-6 py-3 text-left text-sm font-semibold">File Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Operation</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Size</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((item) => {
                const Icon = operationIcons[item.operation]
                return (
                  <tr
                    key={item.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-3">
                        <Icon size={18} className="text-primary flex-shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm capitalize">{item.operation}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{item.size}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(item.date)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button className="rounded-lg p-2 hover:bg-primary/10 transition-colors">
                          <Download size={18} className="text-primary" />
                        </button>
                        <button className="rounded-lg p-2 hover:bg-destructive/10 transition-colors">
                          <Trash2 size={18} className="text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredHistory.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No files found matching your search.</p>
        </div>
      )}
    </div>
  )
}
