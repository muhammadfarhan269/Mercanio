import { db } from '@/lib/db'
import { OrderStatus } from '@prisma/client'

const REVENUE_STATUSES: OrderStatus[] = [
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
]

export async function getVendorOverviewStats(vendorId: string) {
  const [revenueAgg, orderIds, productCount] = await Promise.all([
    // Sum revenue from qualifying order items
    db.orderItem.aggregate({
      where: {
        vendorId,
        order: { status: { in: REVENUE_STATUSES } },
      },
      _sum: { total: true },
    }),

    // Distinct order IDs for this vendor (qualifying statuses)
    db.orderItem.findMany({
      where: {
        vendorId,
        order: { status: { in: REVENUE_STATUSES } },
      },
      select: { orderId: true },
      distinct: ['orderId'],
    }),

    // Active product count
    db.product.count({
      where: {
        vendorId,
        status: 'ACTIVE',
        deletedAt: null,
      },
    }),
  ])

  const totalRevenue = revenueAgg._sum.total ?? 0
  const totalOrders = orderIds.length
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

  return {
    totalRevenue,
    totalOrders,
    totalProducts: productCount,
    avgOrderValue,
  }
}

export async function getVendorRecentOrders(vendorId: string, limit = 5) {
  const items = await db.orderItem.findMany({
    where: { vendorId },
    select: {
      orderId: true,
      total: true,
      fulfillmentStatus: true,
      createdAt: true,
      productSnapshot: true,
      order: {
        select: {
          orderNumber: true,
          status: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit * 3, // over-fetch since we dedupe by order
  })

  // Dedupe to one row per order, keep first (most recent item)
  const seen = new Set<string>()
  const orders: typeof items = []
  for (const item of items) {
    if (!seen.has(item.orderId)) {
      seen.add(item.orderId)
      orders.push(item)
    }
    if (orders.length === limit) break
  }

  return orders
}
