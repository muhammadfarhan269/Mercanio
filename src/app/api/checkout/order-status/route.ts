import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const paymentIntentId = searchParams.get('payment_intent')

  if (!paymentIntentId) {
    return NextResponse.json({ error: 'Missing payment_intent' }, { status: 400 })
  }

  const order = await db.order.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
    select: { orderNumber: true, status: true },
  })

  if (!order) {
    return NextResponse.json({ orderNumber: null })
  }

  return NextResponse.json({
    orderNumber: order.orderNumber,
    status: order.status,
  })
}
