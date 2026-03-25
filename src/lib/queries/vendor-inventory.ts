import { db } from '@/lib/db'

export async function getVendorInventory(vendorId: string) {
  const products = await db.product.findMany({
    where: { vendorId, deletedAt: null, status: { not: 'ARCHIVED' } },
    select: {
      id: true,
      name: true,
      status: true,
      images: {
        where: { isPrimary: true },
        take: 1,
        select: { url: true, altText: true },
      },
      variants: {
        where: { isActive: true },
        select: {
          id: true,
          sku: true,
          stock: true,
          lowStockThreshold: true,
          price: true,
          attributes: true,
        },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { name: 'asc' },
  })

  return products
}

export async function updateVariantStock(
  variantId: string,
  vendorId: string,
  stock: number
) {
  // Verify the variant belongs to this vendor
  const variant = await db.productVariant.findFirst({
    where: {
      id: variantId,
      product: { vendorId },
    },
  })

  if (!variant) return null

  return db.productVariant.update({
    where: { id: variantId },
    data: { stock },
  })
}
