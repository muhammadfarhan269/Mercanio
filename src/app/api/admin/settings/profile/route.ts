import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const ProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
})

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = ProfileSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

    await db.user.update({
      where: { id: session.user.id },
      data: { name: parsed.data.name },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PATCH /api/admin/settings/profile]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
