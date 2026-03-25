import { NextRequest, NextResponse } from 'next/server'
import { requireVendor, getCurrentVendor } from '@/lib/auth.helpers'
import { db } from '@/lib/db'
import { VendorSettingsSchema } from '@/lib/validations/vendor-settings'

export async function PATCH(req: NextRequest) {
  try {
    await requireVendor()
    const vendor = await getCurrentVendor()
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

    const body = await req.json()
    const parsed = VendorSettingsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
    }

    const {
      storeName,
      description,
      email,
      phone,
      website,
      logo,
      banner,
      returnPolicy,
      shippingPolicy,
    } = parsed.data

    await db.vendor.update({
      where: { id: vendor.id },
      data: {
        storeName,
        description: description ?? null,
        email,
        phone: phone ?? null,
        website: website || null,
        logo: logo || null,
        banner: banner || null,
        returnPolicy: returnPolicy ?? null,
        shippingPolicy: shippingPolicy ?? null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PATCH /api/vendor/settings]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
