import { requireVendor, getCurrentVendor } from '@/lib/auth.helpers'
import { redirect } from 'next/navigation'
import { StatCard } from '@/components/vendor/stat-card'
import { getVendorOverviewStats, getVendorRecentOrders } from '@/lib/queries/vendor-overview'
import { formatPrice } from '@/lib/utils/format'
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const STATUS_BADGE: Record<string, string> = {
  UNFULFILLED: 'bg-[#F5F0EB] text-[#8C7B6E]',
  PROCESSING:  'bg-blue-50 text-blue-700',
  SHIPPED:     'bg-[#F5F0EB] text-[#2B6B4A]',
  DELIVERED:   'bg-green-50 text-[#2B6B4A]',
  CANCELLED:   'bg-red-50 text-[#B54242]',
  RETURNED:    'bg-red-50 text-[#B54242]',
  REFUNDED:    'bg-red-50 text-[#B54242]',
}

export default async function VendorOverviewPage() {
  await requireVendor()
  const vendor = await getCurrentVendor()
  if (!vendor) redirect('/')

  const [stats, recentOrders] = await Promise.all([
    getVendorOverviewStats(vendor.id),
    getVendorRecentOrders(vendor.id, 5),
  ])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1A1410]">Overview</h1>
        <p className="mt-1 text-sm text-[#8C7B6E]">
          Welcome back, {vendor.storeName}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
          subtext="From confirmed orders"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders.toString()}
          subtext="Confirmed & fulfilled"
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        <StatCard
          label="Active Products"
          value={stats.totalProducts.toString()}
          subtext="Published in store"
          icon={<Package className="h-5 w-5" />}
        />
        <StatCard
          label="Avg Order Value"
          value={stats.totalOrders > 0 ? formatPrice(stats.avgOrderValue) : '—'}
          subtext="Revenue ÷ orders"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Recent orders */}
      <div className="mt-8">
        <h2 className="mb-4 text-base font-semibold text-[#1A1410]">Recent Orders</h2>
        <div className="rounded-xl border border-[#E8DDD4] bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E8DDD4]">
                <TableHead className="text-[#8C7B6E]">Order</TableHead>
                <TableHead className="text-[#8C7B6E]">Customer</TableHead>
                <TableHead className="text-[#8C7B6E]">Amount</TableHead>
                <TableHead className="text-[#8C7B6E]">Fulfilment</TableHead>
                <TableHead className="text-[#8C7B6E]">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-[#8C7B6E]">
                    No orders yet
                  </TableCell>
                </TableRow>
              )}
              {recentOrders.map((item) => {
                const customerName =
                  item.order.user?.name ?? item.order.user?.email ?? 'Guest'
                const badgeClass =
                  STATUS_BADGE[item.fulfillmentStatus] ?? 'bg-[#F5F0EB] text-[#8C7B6E]'
                return (
                  <TableRow key={item.orderId} className="border-[#E8DDD4]">
                    <TableCell className="font-mono text-sm text-[#1A1410]">
                      #{item.order.orderNumber}
                    </TableCell>
                    <TableCell className="text-sm text-[#1A1410]">
                      {customerName}
                    </TableCell>
                    <TableCell className="text-sm text-[#1A1410]">
                      {formatPrice(item.total)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}
                      >
                        {item.fulfillmentStatus.charAt(0) +
                          item.fulfillmentStatus.slice(1).toLowerCase().replace('_', ' ')}
                      </span>
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
      </div>
    </div>
  )
}
