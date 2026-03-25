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
    const banner = await db.banner.findUnique({ where: { id } })
    if (!banner) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await db.banner.update({ where: { id }, data: { isActive: !banner.isActive } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PATCH /api/admin/content/banners/:id]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const banner = await db.banner.findUnique({ where: { id } })
    if (!banner) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await db.banner.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/admin/content/banners/:id]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
