import { requireVendor, getCurrentVendor } from '@/lib/auth.helpers'
import { redirect } from 'next/navigation'
import { getVendorOrders } from '@/lib/queries/vendor-orders'
import { formatPrice } from '@/lib/utils/format'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FulfillmentSelect } from '@/components/vendor/fulfillment-select'

const ORDER_STATUS_BADGE: Record<string, string> = {
  PENDING:            'bg-[#F5F0EB] text-[#8C7B6E]',
  CONFIRMED:          'bg-blue-50 text-blue-700',
  PROCESSING:         'bg-blue-50 text-blue-700',
  PARTIALLY_SHIPPED:  'bg-amber-50 text-amber-700',
  SHIPPED:            'bg-[#F5F0EB] text-[#2B6B4A]',
  DELIVERED:          'bg-green-50 text-[#2B6B4A]',
  CANCELLED:          'bg-red-50 text-[#B54242]',
  REFUNDED:           'bg-red-50 text-[#B54242]',
  PAYMENT_FAILED:     'bg-red-50 text-[#B54242]',
}

function labelStatus(s: string) {
  return s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, ' ')
}

export default async function VendorOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>
}) {
  await requireVendor()
  const vendor = await getCurrentVendor()
  if (!vendor) redirect('/')

  const { page: pageStr, status } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1', 10))

  const { items, total, pages } = await getVendorOrders(vendor.id, page, status)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1A1410]">Orders</h1>
        <p className="mt-1 text-sm text-[#8C7B6E]">{total} order item{total !== 1 ? 's' : ''}</p>
      </div>

      <div className="rounded-xl border border-[#E8DDD4] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-[#E8DDD4]">
              <TableHead className="text-[#8C7B6E]">Order</TableHead>
              <TableHead className="text-[#8C7B6E]">Customer</TableHead>
              <TableHead className="text-[#8C7B6E]">Product</TableHead>
              <TableHead className="text-[#8C7B6E]">Amount</TableHead>
              <TableHead className="text-[#8C7B6E]">Order Status</TableHead>
              <TableHead className="text-[#8C7B6E]">Fulfilment</TableHead>
              <TableHead className="text-[#8C7B6E]">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-[#8C7B6E]">
                  No orders yet
                </TableCell>
              </TableRow>
            )}
            {items.map((item) => {
              const snapshot = item.productSnapshot as { name?: string } | null
              const productName = snapshot?.name ?? '—'
              const customerName =
                item.order.user?.name ?? item.order.user?.email ?? 'Guest'
              const orderBadge =
                ORDER_STATUS_BADGE[item.order.status] ?? ORDER_STATUS_BADGE.PENDING

              return (
                <TableRow key={item.id} className="border-[#E8DDD4]">
                  <TableCell className="font-mono text-sm text-[#1A1410]">
                    #{item.order.orderNumber}
                  </TableCell>
                  <TableCell className="text-sm text-[#1A1410]">{customerName}</TableCell>
                  <TableCell className="max-w-[180px] text-sm text-[#1A1410]">
                    <p className="line-clamp-1">{productName}</p>
                    <p className="text-xs text-[#8C7B6E]">×{item.quantity}</p>
                  </TableCell>
                  <TableCell className="text-sm text-[#1A1410]">
                    {formatPrice(item.total)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${orderBadge}`}
                    >
                      {labelStatus(item.order.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <FulfillmentSelect
                      itemId={item.id}
                      currentStatus={item.fulfillmentStatus}
                    />
                  </TableCell>
                  <TableCell className="text-sm text-[#8C7B6E]">
                    {new Date(item.order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`?page=${p}${status ? `&status=${status}` : ''}`}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-[#C2692A] text-white'
                  : 'bg-white border border-[#E8DDD4] text-[#1A1410] hover:bg-[#F5F0EB]'
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
