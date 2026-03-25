import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const CartItemSchema = z.object({
  variantId: z.string(),
  productName: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().int().positive(),
  vendorId: z.string(),
  vendorName: z.string(),
  stock: z.number().int(),
})

const RequestSchema = z.object({
  items: z.array(CartItemSchema).min(1),
  email: z.string().email().optional(),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    const body = await request.json()
    const parsed = RequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { items, email } = parsed.data

    // Validate stock for each item
    const { db } = await import('@/lib/db')
    for (const item of items) {
      const variant = await db.productVariant.findUnique({
        where: { id: item.variantId },
        select: { stock: true, isActive: true, price: true },
      })

      if (!variant || !variant.isActive) {
        return NextResponse.json(
          { error: `Product variant ${item.variantId} is no longer available` },
          { status: 400 }
        )
      }

      if (variant.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.productName}` },
          { status: 400 }
        )
      }

      // Verify price matches — prevent client-side price manipulation
      if (variant.price !== item.price) {
        return NextResponse.json(
          { error: `Price mismatch for ${item.productName}. Please refresh your cart.` },
          { status: 400 }
        )
      }
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
    const shippingTotal = subtotal >= 7500 ? 0 : 599
    const taxTotal = Math.round(subtotal * 0.08)
    const total = subtotal + shippingTotal + taxTotal

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: session?.user?.id ?? 'guest',
        itemCount: items.length.toString(),
        subtotal: subtotal.toString(),
        shippingTotal: shippingTotal.toString(),
        taxTotal: taxTotal.toString(),
      },
      receipt_email: email ?? session?.user?.email ?? undefined,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      totals: {
        subtotal,
        shippingTotal,
        taxTotal,
        total,
      },
    })
  } catch (error) {
    console.error('[PAYMENT_INTENT]', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
