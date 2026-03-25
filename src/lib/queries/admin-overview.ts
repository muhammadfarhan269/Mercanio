import { db } from '@/lib/db'
import { OrderStatus, UserRole, VendorStatus } from '@prisma/client'

const GMV_STATUSES: OrderStatus[] = [
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
]

export async function getAdminOverviewStats() {
  // One transaction = one connection; avoids four parallel connects racing on cold Neon/pooler.
  const [gmvAgg, totalOrders, activeVendors, totalCustomers] = await db.$transaction([
    db.order.aggregate({
      where: { status: { in: GMV_STATUSES } },
      _sum: { total: true },
    }),
    db.order.count(),
    db.vendor.count({
      where: { status: VendorStatus.ACTIVE, deletedAt: null },
    }),
    db.user.count({
      where: { role: UserRole.CUSTOMER, deletedAt: null },
    }),
  ])

  return {
    gmv: gmvAgg._sum.total ?? 0,
    totalOrders,
    activeVendors,
    totalCustomers,
  }
}

export async function getAdminRecentOrders(limit = 5) {
  return db.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      orderNumber: true,
      total: true,
      status: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
      guestName: true,
      guestEmail: true,
    },
  })
}

export async function getAdminTopVendors(limit = 4) {
  const items = await db.orderItem.findMany({
    where: { order: { status: { in: GMV_STATUSES } } },
    select: {
      total: true,
      orderId: true,
      vendorId: true,
      vendor: { select: { storeName: true } },
    },
  })

  const map = new Map<string, { storeName: string; revenue: number; orderIds: Set<string> }>()
  for (const item of items) {
    const existing = map.get(item.vendorId) ?? {
      storeName: item.vendor.storeName,
      revenue: 0,
      orderIds: new Set(),
    }
    existing.revenue += item.total
    existing.orderIds.add(item.orderId)
    map.set(item.vendorId, existing)
  }

  return Array.from(map.entries())
    .map(([id, v]) => ({ id, storeName: v.storeName, revenue: v.revenue, orderCount: v.orderIds.size }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
}
