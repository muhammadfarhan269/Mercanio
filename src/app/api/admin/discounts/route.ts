import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { DiscountSchema } from '@/lib/validations/discount'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = DiscountSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

    const { code, description, type, scope, value, minOrderAmount, maxUses, startsAt, expiresAt } = parsed.data

    const discount = await db.discount.create({
      data: {
        code,
        description: description ?? null,
        type,
        scope,
        value,
        minOrderAmount: minOrderAmount ?? null,
        maxUses: maxUses ?? null,
        startsAt: startsAt ? new Date(startsAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })

    return NextResponse.json({ discount }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/admin/discounts]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
