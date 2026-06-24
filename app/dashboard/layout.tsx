import { ProtectedRoute } from '@/components/protected-route'
import { Sidebar } from '@/components/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar />
        <main className="flex-1 overflow-auto pt-16 md:pt-0">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}
