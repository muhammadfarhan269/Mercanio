import { db } from '@/lib/db'
import { OrderStatus } from '@prisma/client'

const REVENUE_STATUSES: OrderStatus[] = [
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
]

export async function getVendorRevenueByMonth(vendorId: string, months = 12) {
  const since = new Date()
  since.setMonth(since.getMonth() - months + 1)
  since.setDate(1)
  since.setHours(0, 0, 0, 0)

  const items = await db.orderItem.findMany({
    where: {
      vendorId,
      order: { status: { in: REVENUE_STATUSES } },
      createdAt: { gte: since },
    },
    select: { total: true, createdAt: true },
  })

  // Build month buckets
  const buckets: Record<string, { revenue: number; orders: number }> = {}
  for (let i = 0; i < months; i++) {
    const d = new Date(since)
    d.setMonth(d.getMonth() + i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    buckets[key] = { revenue: 0, orders: 0 }
  }

  // Fill in actual data
  const seenOrders = new Map<string, Set<string>>() // month → orderIds
  for (const item of items) {
    const d = item.createdAt
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (buckets[key]) {
      buckets[key].revenue += item.total
    }
  }

  return Object.entries(buckets).map(([month, data]) => ({
    month,
    revenue: data.revenue,
    label: new Date(month + '-01').toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    }),
  }))
}

export async function getVendorOrderVolumeByMonth(vendorId: string, months = 12) {
  const since = new Date()
  since.setMonth(since.getMonth() - months + 1)
  since.setDate(1)
  since.setHours(0, 0, 0, 0)

  const items = await db.orderItem.findMany({
    where: {
      vendorId,
      order: { status: { in: REVENUE_STATUSES } },
      createdAt: { gte: since },
    },
    select: { orderId: true, createdAt: true },
  })

  // Dedupe by order per month
  const buckets: Record<string, Set<string>> = {}
  for (let i = 0; i < months; i++) {
    const d = new Date(since)
    d.setMonth(d.getMonth() + i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    buckets[key] = new Set()
  }

  for (const item of items) {
    const d = item.createdAt
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (buckets[key]) buckets[key].add(item.orderId)
  }

  return Object.entries(buckets).map(([month, orderIds]) => ({
    month,
    orders: orderIds.size,
    label: new Date(month + '-01').toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    }),
  }))
}

export async function getVendorTopProducts(vendorId: string, limit = 10) {
  const items = await db.orderItem.findMany({
    where: {
      vendorId,
      order: { status: { in: REVENUE_STATUSES } },
    },
    select: {
      total: true,
      quantity: true,
      productSnapshot: true,
      variantId: true,
    },
  })

  // Aggregate by product name from snapshot
  const map = new Map<string, { revenue: number; units: number }>()
  for (const item of items) {
    const snapshot = item.productSnapshot as { name?: string } | null
    const name = snapshot?.name ?? 'Unknown'
    const existing = map.get(name) ?? { revenue: 0, units: 0 }
    existing.revenue += item.total
    existing.units += item.quantity
    map.set(name, existing)
  }

  return Array.from(map.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
}
