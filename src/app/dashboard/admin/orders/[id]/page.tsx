import { requireAdmin } from '@/lib/auth.helpers'
import { notFound } from 'next/navigation'
import { getAdminOrderDetail } from '@/lib/queries/admin-orders'
import { formatPrice } from '@/lib/utils/format'
import { StatusBadge } from '@/components/admin/status-badge'
import { RefundButton } from '@/components/admin/refund-button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const REFUNDABLE = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']

function fmt(d: Date) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const order = await getAdminOrderDetail(id)
  if (!order) notFound()

  const customer = order.user?.name ?? order.guestName ?? 'Guest'
  const customerEmail = order.user?.email ?? order.guestEmail ?? '—'
  const shipping = order.shippingSnapshot as Record<string, string> | null

  return (
    <div className="p-8">
      <Link href="/dashboard/admin/orders" className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#8C7B6E] hover:text-[#1A1410]">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1410]">Order #{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-[#8C7B6E]">{fmt(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Customer */}
        <div className="rounded-xl border border-[#E8DDD4] bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-[#1A1410]">Customer</h2>
          <p className="text-sm text-[#1A1410]">{customer}</p>
          <p className="text-sm text-[#8C7B6E]">{customerEmail}</p>
        </div>

        {/* Shipping address */}
        <div className="rounded-xl border border-[#E8DDD4] bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-[#1A1410]">Shipping Address</h2>
          {shipping ? (
            <address className="not-italic text-sm text-[#8C7B6E] space-y-0.5">
              <p>{shipping.firstName} {shipping.lastName}</p>
              <p>{shipping.line1}{shipping.line2 ? `, ${shipping.line2}` : ''}</p>
              <p>{shipping.city}, {shipping.state} {shipping.postalCode}</p>
              <p>{shipping.country}</p>
            </address>
          ) : (
            <p className="text-sm text-[#8C7B6E]">No shipping address</p>
          )}
        </div>

        {/* Order totals */}
        <div className="rounded-xl border border-[#E8DDD4] bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-[#1A1410]">Order Summary</h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-[#8C7B6E]">Subtotal</dt>
              <dd className="text-[#1A1410]">{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#8C7B6E]">Shipping</dt>
              <dd className="text-[#1A1410]">{formatPrice(order.shippingTotal)}</dd>
            </div>
            {order.discountTotal > 0 && (
              <div className="flex justify-between">
                <dt className="text-[#8C7B6E]">Discount</dt>
                <dd className="text-[#B54242]">-{formatPrice(order.discountTotal)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-[#8C7B6E]">Tax</dt>
              <dd className="text-[#1A1410]">{formatPrice(order.taxTotal)}</dd>
            </div>
            <div className="flex justify-between border-t border-[#E8DDD4] pt-1.5 font-semibold">
              <dt className="text-[#1A1410]">Total</dt>
              <dd className="text-[#1A1410]">{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Order items */}
      <div className="mb-8">
        <h2 className="mb-4 text-base font-semibold text-[#1A1410]">Items</h2>
        <div className="rounded-xl border border-[#E8DDD4] bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E8DDD4]">
                <TableHead className="text-[#8C7B6E]">Product</TableHead>
                <TableHead className="text-[#8C7B6E]">Vendor</TableHead>
                <TableHead className="text-[#8C7B6E]">Qty</TableHead>
                <TableHead className="text-[#8C7B6E]">Unit Price</TableHead>
                <TableHead className="text-[#8C7B6E]">Total</TableHead>
                <TableHead className="text-[#8C7B6E]">Vendor Payout</TableHead>
                <TableHead className="text-[#8C7B6E]">Commission</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => {
                const snapshot = item.productSnapshot as { name?: string } | null
                return (
                  <TableRow key={item.id} className="border-[#E8DDD4]">
                    <TableCell className="text-sm text-[#1A1410]">{snapshot?.name ?? '—'}</TableCell>
                    <TableCell className="text-sm text-[#8C7B6E]">{item.vendor.storeName}</TableCell>
                    <TableCell className="text-sm text-[#8C7B6E]">{item.quantity}</TableCell>
                    <TableCell className="text-sm text-[#1A1410]">{formatPrice(item.unitPrice)}</TableCell>
                    <TableCell className="text-sm font-medium text-[#1A1410]">{formatPrice(item.total)}</TableCell>
                    <TableCell className="text-sm text-[#2B6B4A]">{formatPrice(item.vendorPayout)}</TableCell>
                    <TableCell className="text-sm text-[#8C7B6E]">{formatPrice(item.commissionAmount)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Refund */}
      {REFUNDABLE.includes(order.status) && (
        <div className="rounded-xl border border-[#E8DDD4] bg-white p-6">
          <h2 className="mb-1 text-base font-semibold text-[#1A1410]">Refund</h2>
          <p className="mb-4 text-sm text-[#8C7B6E]">
            Issue a full refund of {formatPrice(order.total)} via Stripe. This will also update the order status to Refunded.
          </p>
          <RefundButton orderId={order.id} />
        </div>
      )}
    </div>
  )
}
