import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const UpdateSchema = z.object({
  value: z.string().min(1, 'Value is required'),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { key } = await params
    const body = await req.json()
    const parsed = UpdateSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

    const setting = await db.platformSetting.upsert({
      where: { key },
      update: { value: parsed.data.value, updatedBy: session.user.id },
      create: { key, value: parsed.data.value, updatedBy: session.user.id },
    })

    return NextResponse.json({ setting })
  } catch (err) {
    console.error('[PATCH /api/admin/content/settings/:key]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
