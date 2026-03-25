import { requireAdmin } from '@/lib/auth.helpers'
import { notFound } from 'next/navigation'
import { getAdminVendorDetail } from '@/lib/queries/admin-vendors'
import { formatPrice } from '@/lib/utils/format'
import { StatusBadge } from '@/components/admin/status-badge'
import { VendorStatusSelect } from '@/components/admin/vendor-status-select'
import { CommissionEditor } from '@/components/admin/commission-editor'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function fmt(d: Date) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function AdminVendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const data = await getAdminVendorDetail(id)
  if (!data) notFound()

  const { vendor, revenue, orderCount, productCount, products, recentOrders } = data

  return (
    <div className="p-8">
      {/* Back link */}
      <Link
        href="/dashboard/admin/vendors"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#8C7B6E] hover:text-[#1A1410]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to vendors
      </Link>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1410]">{vendor.storeName}</h1>
          <p className="mt-1 text-sm text-[#8C7B6E]">{vendor.user.email}</p>
        </div>
        <StatusBadge status={vendor.status} />
      </div>

      {/* Info + controls */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Vendor info */}
        <div className="rounded-xl border border-[#E8DDD4] bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-[#1A1410]">Store Info</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-[#8C7B6E]">Description</dt>
              <dd className="max-w-[60%] text-right text-[#1A1410]">{vendor.description ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#8C7B6E]">Email</dt>
              <dd className="text-[#1A1410]">{vendor.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#8C7B6E]">Stripe Connected</dt>
              <dd className="text-[#1A1410]">{vendor.stripeOnboardingDone ? 'Yes' : 'No'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#8C7B6E]">Charges Enabled</dt>
              <dd className="text-[#1A1410]">{vendor.stripeChargesEnabled ? 'Yes' : 'No'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#8C7B6E]">Joined</dt>
              <dd className="text-[#1A1410]">{fmt(vendor.createdAt)}</dd>
            </div>
          </dl>
        </div>

        {/* Stats + controls */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Revenue', value: formatPrice(revenue) },
              { label: 'Orders', value: orderCount.toString() },
              { label: 'Products', value: productCount.toString() },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-4 text-center" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8DDD4' }}>
                <p className="text-xs text-[#8C7B6E]">{s.label}</p>
                <p className="mt-1 text-lg font-semibold text-[#1A1410]">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Commission rate */}
          <div className="rounded-xl border border-[#E8DDD4] bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-[#1A1410]">Commission Rate</h2>
            <CommissionEditor vendorId={vendor.id} currentRate={Number(vendor.commissionRate)} />
          </div>

          {/* Status controls */}
          <div className="rounded-xl border border-[#E8DDD4] bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-[#1A1410]">Status Control</h2>
            <VendorStatusSelect vendorId={vendor.id} currentStatus={vendor.status} />
          </div>
        </div>
      </div>

      {/* Recent products */}
      <div className="mb-8">
        <h2 className="mb-4 text-base font-semibold text-[#1A1410]">Recent Products</h2>
        <div className="rounded-xl border border-[#E8DDD4] bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E8DDD4]">
                <TableHead className="text-[#8C7B6E]">Name</TableHead>
                <TableHead className="text-[#8C7B6E]">Price</TableHead>
                <TableHead className="text-[#8C7B6E]">Status</TableHead>
                <TableHead className="text-[#8C7B6E]">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 && (
                <TableRow><TableCell colSpan={4} className="py-8 text-center text-[#8C7B6E]">No products</TableCell></TableRow>
              )}
              {products.map((p) => (
                <TableRow key={p.id} className="border-[#E8DDD4]">
                  <TableCell className="text-sm text-[#1A1410]">{p.name}</TableCell>
                  <TableCell className="text-sm text-[#8C7B6E]">
                    {p.variants[0] ? formatPrice(p.variants[0].price) : '—'}
                  </TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell className="text-sm text-[#8C7B6E]">{fmt(p.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Recent orders */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-[#1A1410]">Recent Orders</h2>
        <div className="rounded-xl border border-[#E8DDD4] bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E8DDD4]">
                <TableHead className="text-[#8C7B6E]">Order</TableHead>
                <TableHead className="text-[#8C7B6E]">Customer</TableHead>
                <TableHead className="text-[#8C7B6E]">Product</TableHead>
                <TableHead className="text-[#8C7B6E]">Amount</TableHead>
                <TableHead className="text-[#8C7B6E]">Fulfilment</TableHead>
                <TableHead className="text-[#8C7B6E]">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.length === 0 && (
                <TableRow><TableCell colSpan={6} className="py-8 text-center text-[#8C7B6E]">No orders yet</TableCell></TableRow>
              )}
              {recentOrders.map((item) => {
                const snapshot = item.productSnapshot as { name?: string } | null
                const customer = item.order.user?.name ?? item.order.user?.email ?? 'Guest'
                return (
                  <TableRow key={item.id} className="border-[#E8DDD4]">
                    <TableCell className="font-mono text-sm">#{item.order.orderNumber}</TableCell>
                    <TableCell className="text-sm text-[#1A1410]">{customer}</TableCell>
                    <TableCell className="text-sm text-[#8C7B6E] line-clamp-1">{snapshot?.name ?? '—'}</TableCell>
                    <TableCell className="text-sm text-[#1A1410]">{formatPrice(item.total)}</TableCell>
                    <TableCell><StatusBadge status={item.fulfillmentStatus} /></TableCell>
                    <TableCell className="text-sm text-[#8C7B6E]">{fmt(item.order.createdAt)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
