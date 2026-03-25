import { db } from '@/lib/db'
import { ORDERS_PER_PAGE } from '@/lib/constants'
import { OrderStatus } from '@prisma/client'

function orderListWhere(status?: string) {
  if (!status || status === 'ALL') return {}
  const valid = Object.values(OrderStatus) as string[]
  if (!valid.includes(status)) return {}
  return { status: status as OrderStatus }
}

export async function getAdminOrders(page = 1, status?: string) {
  const skip = (page - 1) * ORDERS_PER_PAGE
  const where = orderListWhere(status)

  const [orders, total] = await db.$transaction([
    db.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: ORDERS_PER_PAGE,
    }),
    db.order.count({ where }),
  ])

  return { orders, total, pages: Math.ceil(total / ORDERS_PER_PAGE) }
}

export async function getAdminOrderDetail(orderId: string) {
  return db.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { name: true, email: true } },
      items: {
        include: {
          vendor: { select: { storeName: true } },
          variant: { select: { sku: true } },
        },
      },
    },
  })
}
