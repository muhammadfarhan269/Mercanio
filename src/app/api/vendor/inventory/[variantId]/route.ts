import { NextRequest, NextResponse } from 'next/server'
import { requireVendor, getCurrentVendor } from '@/lib/auth.helpers'
import { updateVariantStock } from '@/lib/queries/vendor-inventory'
import { z } from 'zod'

const StockSchema = z.object({
  stock: z.number().int().min(0),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ variantId: string }> }
) {
  try {
    await requireVendor()
    const vendor = await getCurrentVendor()
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

    const { variantId } = await params
    const body = await req.json()
    const parsed = StockSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
    }

    const result = await updateVariantStock(variantId, vendor.id, parsed.data.stock)
    if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PATCH /api/vendor/inventory/:variantId]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
