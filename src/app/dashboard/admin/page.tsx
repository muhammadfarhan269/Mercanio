import { requireAdmin } from '@/lib/auth.helpers'
import { getAdminOverviewStats, getAdminRecentOrders, getAdminTopVendors } from '@/lib/queries/admin-overview'
import { StatCard } from '@/components/vendor/stat-card'
import { StatusBadge } from '@/components/admin/status-badge'
import { formatPrice } from '@/lib/utils/format'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { DollarSign, ShoppingCart, Store, Users } from 'lucide-react'

function fmt(d: Date) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function AdminOverviewPage() {
  await requireAdmin()

  const [stats, recentOrders, topVendors] = await Promise.all([
    getAdminOverviewStats(),
    getAdminRecentOrders(5),
    getAdminTopVendors(4),
  ])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1A1410]">Overview</h1>
        <p className="mt-1 text-sm text-[#8C7B6E]">Platform-wide metrics</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Gross Merchandise Value" value={formatPrice(stats.gmv)} subtext="Confirmed orders" icon={<DollarSign className="h-5 w-5" />} />
        <StatCard label="Total Orders" value={stats.totalOrders.toString()} subtext="All time" icon={<ShoppingCart className="h-5 w-5" />} />
        <StatCard label="Active Vendors" value={stats.activeVendors.toString()} subtext="Approved & selling" icon={<Store className="h-5 w-5" />} />
        <StatCard label="Customers" value={stats.totalCustomers.toString()} subtext="Registered accounts" icon={<Users className="h-5 w-5" />} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Recent orders */}
        <div>
          <h2 className="mb-4 text-base font-semibold text-[#1A1410]">Recent Orders</h2>
          <div className="rounded-xl border border-[#E8DDD4] bg-white">
            <Table>
              <TableHeader>
                <TableRow className="border-[#E8DDD4]">
                  <TableHead className="text-[#8C7B6E]">Order</TableHead>
                  <TableHead className="text-[#8C7B6E]">Customer</TableHead>
                  <TableHead className="text-[#8C7B6E]">Total</TableHead>
                  <TableHead className="text-[#8C7B6E]">Status</TableHead>
                  <TableHead className="text-[#8C7B6E]">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="py-8 text-center text-[#8C7B6E]">No orders yet</TableCell></TableRow>
                )}
                {recentOrders.map((o) => {
                  const customer = o.user?.name ?? o.user?.email ?? o.guestName ?? o.guestEmail ?? 'Guest'
                  return (
                    <TableRow key={o.id} className="border-[#E8DDD4]">
                      <TableCell className="font-mono text-sm">#{o.orderNumber}</TableCell>
                      <TableCell className="text-sm text-[#1A1410]">{customer}</TableCell>
                      <TableCell className="text-sm text-[#1A1410]">{formatPrice(o.total)}</TableCell>
                      <TableCell><StatusBadge status={o.status} /></TableCell>
                      <TableCell className="text-sm text-[#8C7B6E]">{fmt(o.createdAt)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Top vendors */}
        <div>
          <h2 className="mb-4 text-base font-semibold text-[#1A1410]">Top Vendors by Revenue</h2>
          <div className="rounded-xl border border-[#E8DDD4] bg-white">
            <Table>
              <TableHeader>
                <TableRow className="border-[#E8DDD4]">
                  <TableHead className="text-[#8C7B6E]">Store</TableHead>
                  <TableHead className="text-[#8C7B6E]">Revenue</TableHead>
                  <TableHead className="text-[#8C7B6E]">Orders</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topVendors.length === 0 && (
                  <TableRow><TableCell colSpan={3} className="py-8 text-center text-[#8C7B6E]">No data yet</TableCell></TableRow>
                )}
                {topVendors.map((v) => (
                  <TableRow key={v.id} className="border-[#E8DDD4]">
                    <TableCell className="text-sm font-medium text-[#1A1410]">{v.storeName}</TableCell>
                    <TableCell className="text-sm text-[#1A1410]">{formatPrice(v.revenue)}</TableCell>
                    <TableCell className="text-sm text-[#8C7B6E]">{v.orderCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}
