import { NextRequest, NextResponse } from 'next/server'
import { requireVendor, getCurrentVendor } from '@/lib/auth.helpers'
import { db } from '@/lib/db'
import { z } from 'zod'

const FulfillmentSchema = z.object({
  fulfillmentStatus: z.enum([
    'UNFULFILLED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'RETURNED',
    'REFUNDED',
  ]),
  trackingNumber: z.string().optional(),
  trackingCarrier: z.string().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    await requireVendor()
    const vendor = await getCurrentVendor()
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

    const { itemId } = await params

    // Confirm item belongs to this vendor
    const item = await db.orderItem.findFirst({
      where: { id: itemId, vendorId: vendor.id },
    })
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json()
    const parsed = FulfillmentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
    }

    const { fulfillmentStatus, trackingNumber, trackingCarrier } = parsed.data

    await db.orderItem.update({
      where: { id: itemId },
      data: {
        fulfillmentStatus,
        trackingNumber: trackingNumber ?? null,
        trackingCarrier: trackingCarrier ?? null,
        shippedAt:
          fulfillmentStatus === 'SHIPPED' && !item.shippedAt ? new Date() : item.shippedAt,
        deliveredAt:
          fulfillmentStatus === 'DELIVERED' && !item.deliveredAt
            ? new Date()
            : item.deliveredAt,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PATCH /api/vendor/orders/:itemId]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
