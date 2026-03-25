import { redirect } from 'next/navigation'
import { requireVendor, getCurrentVendor } from '@/lib/auth.helpers'
import { VendorSidebar } from '@/components/vendor/vendor-sidebar'

export default async function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireVendor()

  const vendor = await getCurrentVendor()
  if (!vendor) redirect('/')

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F0EB]">
      <VendorSidebar storeName={vendor.storeName} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
