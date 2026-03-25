import { NextRequest, NextResponse } from 'next/server'
import { requireVendor, getCurrentVendor } from '@/lib/auth.helpers'
import { db } from '@/lib/db'
import { ProductFormSchema } from '@/lib/validations/product'
import { syncSingleProductToAlgolia } from '@/lib/algolia.sync'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base
  let attempt = 0
  while (true) {
    const existing = await db.product.findUnique({ where: { slug } })
    if (!existing || existing.id === excludeId) return slug
    attempt++
    slug = `${base}-${attempt}`
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireVendor()
    const vendor = await getCurrentVendor()
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

    const body = await req.json()
    const parsed = ProductFormSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
    }

    const data = parsed.data
    const slug = await uniqueSlug(slugify(data.name))

    const product = await db.product.create({
      data: {
        vendorId: vendor.id,
        categoryId: data.categoryId,
        name: data.name,
        slug,
        description: data.description,
        shortDescription: data.shortDescription,
        status: data.status,
        isFeatured: data.isFeatured,
        tags: data.tags,
        images: {
          create: data.images.map((img, i) => ({
            url: img.url,
            altText: img.altText ?? null,
            isPrimary: i === 0,
            sortOrder: i,
          })),
        },
        variants: {
          create: data.variants.map((v) => ({
            sku: v.sku,
            price: v.price,
            compareAtPrice: v.compareAtPrice ?? null,
            stock: v.stock,
            lowStockThreshold: v.lowStockThreshold,
            attributes: v.attributes as Record<string, string>,
            isActive: v.isActive,
          })),
        },
      },
    })

    // Sync to Algolia (non-blocking)
    if (data.status === 'ACTIVE') {
      syncSingleProductToAlgolia(product.id).catch(console.error)
    }

    return NextResponse.json({ product }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/vendor/products]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
