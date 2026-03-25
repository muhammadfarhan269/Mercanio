import { NextRequest, NextResponse } from 'next/server'
import { requireVendor, getCurrentVendor } from '@/lib/auth.helpers'
import { db } from '@/lib/db'
import { ProductFormSchema } from '@/lib/validations/product'
import { syncSingleProductToAlgolia, deleteProductFromAlgolia } from '@/lib/algolia.sync'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireVendor()
    const vendor = await getCurrentVendor()
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

    const { id } = await params

    // Confirm product belongs to this vendor
    const existing = await db.product.findFirst({
      where: { id, vendorId: vendor.id, deletedAt: null },
    })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json()
    const parsed = ProductFormSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
    }

    const data = parsed.data

    // Update product (replace images and variants)
    await db.$transaction(async (tx) => {
      // Update base product
      await tx.product.update({
        where: { id },
        data: {
          categoryId: data.categoryId,
          name: data.name,
          description: data.description,
          shortDescription: data.shortDescription,
          status: data.status,
          isFeatured: data.isFeatured,
          tags: data.tags,
        },
      })

      // Replace images
      await tx.productImage.deleteMany({ where: { productId: id } })
      if (data.images.length > 0) {
        await tx.productImage.createMany({
          data: data.images.map((img, i) => ({
            productId: id,
            url: img.url,
            altText: img.altText ?? null,
            isPrimary: i === 0,
            sortOrder: i,
          })),
        })
      }

      // Upsert variants
      for (const v of data.variants) {
        if (v.id) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: {
              sku: v.sku,
              price: v.price,
              compareAtPrice: v.compareAtPrice ?? null,
              stock: v.stock,
              lowStockThreshold: v.lowStockThreshold,
              attributes: v.attributes as Record<string, string>,
              isActive: v.isActive,
            },
          })
        } else {
          await tx.productVariant.create({
            data: {
              productId: id,
              sku: v.sku,
              price: v.price,
              compareAtPrice: v.compareAtPrice ?? null,
              stock: v.stock,
              lowStockThreshold: v.lowStockThreshold,
              attributes: v.attributes as Record<string, string>,
              isActive: v.isActive,
            },
          })
        }
      }
    })

    // Sync to Algolia
    if (data.status === 'ACTIVE') {
      syncSingleProductToAlgolia(id).catch(console.error)
    } else {
      deleteProductFromAlgolia(id).catch(console.error)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PATCH /api/vendor/products/:id]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireVendor()
    const vendor = await getCurrentVendor()
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

    const { id } = await params

    const existing = await db.product.findFirst({
      where: { id, vendorId: vendor.id, deletedAt: null },
    })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Soft-delete (archive)
    await db.product.update({
      where: { id },
      data: { status: 'ARCHIVED', deletedAt: new Date() },
    })

    deleteProductFromAlgolia(id).catch(console.error)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/vendor/products/:id]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
