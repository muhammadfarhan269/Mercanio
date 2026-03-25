import { db } from '@/lib/db'
import { ORDERS_PER_PAGE } from '@/lib/constants'

export async function getVendorOrders(
  vendorId: string,
  page = 1,
  status?: string
) {
  const skip = (page - 1) * ORDERS_PER_PAGE

  // Get all order IDs for this vendor with optional status filter
  const whereClause = {
    vendorId,
    ...(status ? { fulfillmentStatus: status as never } : {}),
  }

  const [items, total] = await Promise.all([
    db.orderItem.findMany({
      where: whereClause,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            createdAt: true,
            user: { select: { name: true, email: true } },
          },
        },
        variant: {
          select: {
            sku: true,
            attributes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: ORDERS_PER_PAGE,
    }),
    db.orderItem.count({ where: whereClause }),
  ])

  return { items, total, pages: Math.ceil(total / ORDERS_PER_PAGE) }
}

export async function getVendorOrderItem(itemId: string, vendorId: string) {
  return db.orderItem.findFirst({
    where: { id: itemId, vendorId },
    include: {
      order: {
        select: {
          orderNumber: true,
          status: true,
          shippingSnapshot: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
        },
      },
      variant: {
        select: { sku: true, attributes: true },
      },
    },
  })
}
