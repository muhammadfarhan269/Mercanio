import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const RequestSchema = z.object({
  paymentIntentId: z.string(),
  cartItems: z.array(
    z.object({
      variantId: z.string(),
      productName: z.string(),
      quantity: z.number(),
      price: z.number(),
      vendorId: z.string(),
      vendorName: z.string(),
      sku: z.string(),
      variantAttributes: z.record(z.string(), z.string()),
      imageUrl: z.string().nullable(),
    })
  ),
  shippingAddress: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    const body = await request.json()
    const parsed = RequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { paymentIntentId, cartItems, shippingAddress } = parsed.data

    // Stripe metadata values must be strings under 500 chars each
    // We store JSON-stringified data and parse in webhook
    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: {
        userId: session?.user?.id ?? 'guest',
        cartItems: JSON.stringify(cartItems),
        shippingAddress: JSON.stringify(shippingAddress),
        guestEmail: shippingAddress.email,
        guestName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[UPDATE_INTENT]', error)
    return NextResponse.json(
      { error: 'Failed to update payment intent' },
      { status: 500 }
    )
  }
}
