import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { generateOrderNumber } from '@/lib/orders'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { OrderStatus, FulfillmentStatus } from '@prisma/client'
import type Stripe from 'stripe'

// Stripe requires the raw body for webhook signature verification
export const runtime = 'nodejs'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('[WEBHOOK] Signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle payment_intent.succeeded
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent

    // Idempotency check — don't create duplicate orders
    const existing = await db.order.findUnique({
      where: { stripePaymentIntentId: paymentIntent.id },
    })

    if (existing) {
      console.log('[WEBHOOK] Order already exists for:', paymentIntent.id)
      return NextResponse.json({ received: true })
    }

    // Extract metadata stored during checkout
    const metadata = paymentIntent.metadata as {
      userId?: string
      cartItems?: string
      shippingAddress?: string
      guestEmail?: string
      guestName?: string
      subtotal?: string
      shippingTotal?: string
      taxTotal?: string
    }

    let cartItems: Array<{
      variantId: string
      productName: string
      quantity: number
      price: number
      vendorId: string
      vendorName: string
      sku: string
      variantAttributes: Record<string, string>
      imageUrl: string | null
    }> = []

    let shippingAddress: {
      firstName: string
      lastName: string
      email: string
      line1: string
      line2?: string
      city: string
      state: string
      postalCode: string
      country: string
    } | null = null

    try {
      if (metadata.cartItems) {
        cartItems = JSON.parse(metadata.cartItems)
      }
      if (metadata.shippingAddress) {
        shippingAddress = JSON.parse(metadata.shippingAddress)
      }
    } catch {
      console.error('[WEBHOOK] Failed to parse metadata')
      return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 })
    }

    if (!cartItems.length || !shippingAddress) {
      console.error('[WEBHOOK] Missing cart items or address')
      return NextResponse.json({ error: 'Missing order data' }, { status: 400 })
    }

    const subtotal = parseInt(metadata.subtotal ?? '0')
    const shippingTotal = parseInt(metadata.shippingTotal ?? '0')
    const taxTotal = parseInt(metadata.taxTotal ?? '0')
    const total = paymentIntent.amount

    // Get vendor commission rates
    const vendorIds = [...new Set(cartItems.map((i) => i.vendorId))]
    const vendors = await db.vendor.findMany({
      where: { id: { in: vendorIds } },
      select: { id: true, commissionRate: true },
    })
    const vendorRates = Object.fromEntries(
      vendors.map((v) => [v.id, Number(v.commissionRate)])
    )

    const orderNumber = await generateOrderNumber()
    const userId = metadata.userId !== 'guest' ? metadata.userId : null

    // Create order with items in a transaction
    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: userId ?? null,
          guestEmail: userId ? null : (shippingAddress!.email ?? metadata.guestEmail),
          guestName: userId ? null : (
            `${shippingAddress!.firstName} ${shippingAddress!.lastName}`
          ),
          status: OrderStatus.CONFIRMED,
          subtotal,
          shippingTotal,
          taxTotal,
          total,
          stripePaymentIntentId: paymentIntent.id,
          stripeChargeId: typeof paymentIntent.latest_charge === 'string'
            ? paymentIntent.latest_charge
            : null,
          shippingSnapshot: shippingAddress,
          billingSnapshot: shippingAddress,
          items: {
            create: cartItems.map((item) => {
              const rate = vendorRates[item.vendorId] ?? 10
              const itemTotal = item.price * item.quantity
              const commissionAmount = Math.round(itemTotal * (rate / 100))
              const vendorPayout = itemTotal - commissionAmount

              return {
                variantId: item.variantId,
                vendorId: item.vendorId,
                quantity: item.quantity,
                unitPrice: item.price,
                subtotal: itemTotal,
                total: itemTotal,
                vendorPayout,
                commissionAmount,
                commissionRate: rate,
                productSnapshot: {
                  name: item.productName,
                  sku: item.sku,
                  attributes: item.variantAttributes,
                  imageUrl: item.imageUrl,
                },
                fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
                discountAmount: 0,
              }
            }),
          },
        },
      })

      // Status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          status: OrderStatus.CONFIRMED,
          note: 'Payment confirmed via Stripe webhook',
        },
      })

      // Reduce stock for each variant
      for (const item of cartItems) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      // Clear DB cart if authenticated user
      if (userId) {
        const cart = await tx.cart.findUnique({
          where: { userId },
          select: { id: true },
        })
        if (cart) {
          await tx.cartItem.deleteMany({ where: { cartId: cart.id } })
        }
      }

      // Create order notification
      if (userId) {
        await tx.notification.create({
          data: {
            userId,
            type: 'ORDER_PLACED',
            title: 'Order confirmed',
            message: `Your order ${orderNumber} has been confirmed.`,
            data: { orderId: newOrder.id, orderNumber },
          },
        })
      }

      // Notify each vendor
      const vendorOrderCounts: Record<string, number> = {}
      for (const item of cartItems) {
        vendorOrderCounts[item.vendorId] = (vendorOrderCounts[item.vendorId] ?? 0) + 1
      }

      for (const [vendorId] of Object.entries(vendorOrderCounts)) {
        await tx.vendorNotification.create({
          data: {
            vendorId,
            type: 'ORDER_PLACED',
            title: 'New order received',
            message: `Order ${orderNumber} contains items from your store.`,
            data: { orderId: newOrder.id, orderNumber },
          },
        })
      }

      return newOrder
    })

    // Send confirmation email (outside transaction — failure doesn't roll back order)
    const customerEmail = shippingAddress.email ?? metadata.guestEmail
    if (customerEmail) {
      await sendOrderConfirmationEmail({
        to: customerEmail,
        orderNumber: order.orderNumber,
        customerName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        items: cartItems.map((item) => ({
          productName: item.productName,
          variantAttributes: item.variantAttributes,
          quantity: item.quantity,
          unitPrice: item.price,
          vendorName: item.vendorName,
        })),
        subtotal,
        shippingTotal,
        taxTotal,
        total,
        shippingAddress,
      })
    }

    console.log('[WEBHOOK] Order created:', order.orderNumber)
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    console.log('[WEBHOOK] Payment failed:', paymentIntent.id)

    // Update order status if order was somehow pre-created
    await db.order.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { status: OrderStatus.PAYMENT_FAILED },
    })
  }

  return NextResponse.json({ received: true })
}
