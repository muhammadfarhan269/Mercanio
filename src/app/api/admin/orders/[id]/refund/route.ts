import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'

const REFUNDABLE_STATUSES = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    const order = await db.order.findUnique({ where: { id } })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    if (!REFUNDABLE_STATUSES.includes(order.status)) {
      return NextResponse.json({ error: 'Order is not in a refundable state' }, { status: 400 })
    }

    if (!order.stripePaymentIntentId) {
      return NextResponse.json({ error: 'No payment intent on this order' }, { status: 400 })
    }

    // Attempt Stripe refund first — only update DB if it succeeds
    let stripeRefund
    try {
      stripeRefund = await stripe.refunds.create({
        payment_intent: order.stripePaymentIntentId,
        reason: 'requested_by_customer',
      })
    } catch (stripeErr) {
      console.error('[Stripe refund error]', stripeErr)
      return NextResponse.json({ error: 'Stripe refund failed — order status not changed' }, { status: 502 })
    }

    // Stripe succeeded — update DB
    await db.$transaction([
      db.order.update({
        where: { id },
        data: { status: 'REFUNDED' },
      }),
      db.refund.create({
        data: {
          orderId: id,
          stripeRefundId: stripeRefund.id,
          amount: order.total,
          reason: 'Admin-initiated full refund',
          issuedBy: session.user.id!,
        },
      }),
    ])

    return NextResponse.json({ success: true, refundId: stripeRefund.id })
  } catch (err) {
    console.error('[POST /api/admin/orders/:id/refund]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
