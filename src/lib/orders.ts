import { db } from '@/lib/db'

export async function generateOrderNumber(): Promise<string> {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `MRC-${year}${month}-${random}`
}

export async function getOrderByPaymentIntent(
  paymentIntentId: string
) {
  return db.order.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  images: { where: { isPrimary: true }, take: 1 },
                },
              },
            },
          },
          vendor: { select: { storeName: true, email: true } },
        },
      },
      user: { select: { name: true, email: true } },
    },
  })
}
