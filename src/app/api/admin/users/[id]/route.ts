import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    // Prevent admin from deactivating themselves
    if (id === session.user.id) {
      return NextResponse.json({ error: 'Cannot deactivate your own account' }, { status: 400 })
    }

    const body = await req.json()
    const { isActive } = body as { isActive: boolean }

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive must be a boolean' }, { status: 422 })
    }

    await db.user.update({ where: { id }, data: { isActive } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PATCH /api/admin/users/:id]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
