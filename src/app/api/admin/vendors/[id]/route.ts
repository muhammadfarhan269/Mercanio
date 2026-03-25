import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const UpdateSchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED', 'BANNED']).optional(),
  commissionRate: z.number().min(0).max(100).optional(),
})

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
    const vendor = await db.vendor.findUnique({ where: { id } })
    if (!vendor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json()
    const parsed = UpdateSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

    const { status, commissionRate } = parsed.data

    await db.vendor.update({
      where: { id },
      data: {
        ...(status !== undefined ? { status } : {}),
        ...(commissionRate !== undefined ? { commissionRate } : {}),
      },
    })

    // Send vendor notification on status change
    if (status === 'ACTIVE') {
      await db.vendorNotification.create({
        data: {
          vendorId: id,
          type: 'VENDOR_APPROVED',
          title: 'Your store has been approved',
          message: 'Congratulations! Your Mercanio store is now live and accepting orders.',
        },
      })
    } else if (status === 'SUSPENDED') {
      await db.vendorNotification.create({
        data: {
          vendorId: id,
          type: 'VENDOR_SUSPENDED',
          title: 'Your store has been suspended',
          message: 'Your Mercanio store has been temporarily suspended. Please contact support.',
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PATCH /api/admin/vendors/:id]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
