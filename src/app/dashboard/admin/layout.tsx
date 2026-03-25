import { requireAdmin } from '@/lib/auth.helpers'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F0EB]">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
