import { requireVendor, getCurrentVendor } from '@/lib/auth.helpers'
import { redirect } from 'next/navigation'
import {
  getVendorRevenueByMonth,
  getVendorOrderVolumeByMonth,
  getVendorTopProducts,
} from '@/lib/queries/vendor-analytics'
import { getVendorOverviewStats } from '@/lib/queries/vendor-overview'
import { StatCard } from '@/components/vendor/stat-card'
import { formatPrice } from '@/lib/utils/format'
import {
  RevenueChart,
  OrderVolumeChart,
  TopProductsChart,
} from '@/components/vendor/analytics-charts'
import { DollarSign, ShoppingCart, Package, TrendingUp } from 'lucide-react'

export default async function VendorAnalyticsPage() {
  await requireVendor()
  const vendor = await getCurrentVendor()
  if (!vendor) redirect('/')

  const [revenueData, orderData, topProducts, stats] = await Promise.all([
    getVendorRevenueByMonth(vendor.id, 12),
    getVendorOrderVolumeByMonth(vendor.id, 12),
    getVendorTopProducts(vendor.id, 8),
    getVendorOverviewStats(vendor.id),
  ])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1A1410]">Analytics</h1>
        <p className="mt-1 text-sm text-[#8C7B6E]">Last 12 months</p>
      </div>

      {/* Summary stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders.toString()}
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        <StatCard
          label="Active Products"
          value={stats.totalProducts.toString()}
          icon={<Package className="h-5 w-5" />}
        />
        <StatCard
          label="Avg Order Value"
          value={stats.totalOrders > 0 ? formatPrice(stats.avgOrderValue) : '—'}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Charts row */}
      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-[#E8DDD4] bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-[#1A1410]">Monthly Revenue</h2>
          <RevenueChart data={revenueData} />
        </div>
        <div className="rounded-xl border border-[#E8DDD4] bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-[#1A1410]">Order Volume</h2>
          <OrderVolumeChart data={orderData} />
        </div>
      </div>

      {/* Top products */}
      <div className="rounded-xl border border-[#E8DDD4] bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-[#1A1410]">Top Products by Revenue</h2>
        {topProducts.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#8C7B6E]">No sales data yet</p>
        ) : (
          <TopProductsChart data={topProducts} />
        )}
      </div>
    </div>
  )
}
