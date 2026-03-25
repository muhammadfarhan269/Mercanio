import { db } from '@/lib/db'
import { OrderStatus } from '@prisma/client'

const GMV_STATUSES: OrderStatus[] = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']

export async function getAdminVendors(status?: string) {
  return db.vendor.findMany({
    where: status && status !== 'ALL' ? { status: status as never } : undefined,
    include: {
      user: { select: { email: true } },
      _count: { select: { products: { where: { deletedAt: null } } } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getAdminVendorDetail(vendorId: string) {
  const [vendor, revenueAgg, orderIds, products, recentOrders] = await Promise.all([
    db.vendor.findUnique({
      where: { id: vendorId },
      include: { user: { select: { email: true, name: true } } },
    }),

    db.orderItem.aggregate({
      where: { vendorId, order: { status: { in: GMV_STATUSES } } },
      _sum: { total: true },
    }),

    db.orderItem.findMany({
      where: { vendorId, order: { status: { in: GMV_STATUSES } } },
      select: { orderId: true },
      distinct: ['orderId'],
    }),

    db.product.findMany({
      where: { vendorId, deletedAt: null },
      select: {
        id: true, name: true, status: true, createdAt: true,
        variants: { where: { isActive: true }, select: { price: true }, take: 1, orderBy: { price: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),

    db.orderItem.findMany({
      where: { vendorId },
      select: {
        id: true, total: true, fulfillmentStatus: true, createdAt: true,
        order: { select: { orderNumber: true, status: true, createdAt: true, user: { select: { name: true, email: true } } } },
        productSnapshot: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ])

  if (!vendor) return null

  return {
    vendor,
    revenue: revenueAgg._sum.total ?? 0,
    orderCount: orderIds.length,
    productCount: products.length,
    products,
    recentOrders,
  }
}
