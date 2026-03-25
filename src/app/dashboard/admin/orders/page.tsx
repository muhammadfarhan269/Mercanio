import { requireAdmin } from '@/lib/auth.helpers'
import Link from 'next/link'
import { getAdminOrders } from '@/lib/queries/admin-orders'
import { formatPrice } from '@/lib/utils/format'
import { StatusBadge } from '@/components/admin/status-badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

const STATUS_FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED', 'PAYMENT_FAILED']

function fmt(d: Date) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>
}) {
  await requireAdmin()
  const { page: pageStr, status } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1', 10))
  const { orders, total, pages } = await getAdminOrders(page, status)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1A1410]">Orders</h1>
        <p className="mt-1 text-sm text-[#8C7B6E]">{total} total</p>
      </div>

      {/* Status filter */}
      <div className="mb-5 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => {
          const href = s === 'ALL'
            ? '/dashboard/admin/orders'
            : `?status=${s}`
          const isActive = (s === 'ALL' && !status) || status === s
          return (
            <a
              key={s}
              href={href}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive ? 'bg-[#1A1410] text-white' : 'border border-[#E8DDD4] bg-white text-[#1A1410] hover:bg-[#F5F0EB]'
              }`}
            >
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' ')}
            </a>
          )
        })}
      </div>

      <div className="rounded-xl border border-[#E8DDD4] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-[#E8DDD4]">
              <TableHead className="text-[#8C7B6E]">Order</TableHead>
              <TableHead className="text-[#8C7B6E]">Customer</TableHead>
              <TableHead className="text-[#8C7B6E]">Total</TableHead>
              <TableHead className="text-[#8C7B6E]">Status</TableHead>
              <TableHead className="text-[#8C7B6E]">Items</TableHead>
              <TableHead className="text-[#8C7B6E]">Date</TableHead>
              <TableHead className="text-[#8C7B6E]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-[#8C7B6E]">No orders found</TableCell>
              </TableRow>
            )}
            {orders.map((o) => {
              const customer = o.user?.name ?? o.user?.email ?? 'Guest'
              return (
                <TableRow key={o.id} className="border-[#E8DDD4]">
                  <TableCell className="font-mono text-sm">#{o.orderNumber}</TableCell>
                  <TableCell className="text-sm text-[#1A1410]">{customer}</TableCell>
                  <TableCell className="text-sm text-[#1A1410]">{formatPrice(o.total)}</TableCell>
                  <TableCell><StatusBadge status={o.status} /></TableCell>
                  <TableCell className="text-sm text-[#8C7B6E]">{o._count.items}</TableCell>
                  <TableCell className="text-sm text-[#8C7B6E]">{fmt(o.createdAt)}</TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/admin/orders/${o.id}`}
                      className="rounded-lg border border-[#E8DDD4] px-3 py-1.5 text-xs font-medium text-[#1A1410] hover:bg-[#F5F0EB] transition-colors"
                    >
                      View
                    </Link>
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
                p === page ? 'bg-[#1A1410] text-white' : 'border border-[#E8DDD4] bg-white text-[#1A1410] hover:bg-[#F5F0EB]'
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
