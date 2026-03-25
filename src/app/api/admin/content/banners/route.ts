import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const BannerSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  subtitle: z.string().max(300).optional(),
  image: z.string().url('Image must be a valid URL'),
  linkUrl: z.string().url().optional().or(z.literal('')),
  linkText: z.string().max(100).optional(),
  placement: z.enum(['hero', 'promo_strip', 'category_feature']),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = BannerSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

    const { title, subtitle, image, linkUrl, linkText, placement, sortOrder, isActive, startsAt, endsAt } = parsed.data

    const banner = await db.banner.create({
      data: {
        title,
        subtitle: subtitle ?? null,
        image,
        linkUrl: linkUrl || null,
        linkText: linkText ?? null,
        placement,
        sortOrder,
        isActive,
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
      },
    })

    return NextResponse.json({ banner }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/admin/content/banners]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
