import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const discount = await db.discount.findUnique({ where: { id } })
    if (!discount) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await db.discount.update({ where: { id }, data: { isActive: !discount.isActive } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PATCH /api/admin/discounts/:id]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
