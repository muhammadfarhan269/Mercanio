import { db } from '@/lib/db'

export async function getVendorProducts(vendorId: string) {
  return db.product.findMany({
    where: { vendorId, deletedAt: null },
    include: {
      category: { select: { name: true } },
      images: { where: { isPrimary: true }, take: 1, select: { url: true, altText: true } },
      variants: {
        where: { isActive: true },
        select: { price: true, stock: true },
        orderBy: { price: 'asc' },
        take: 1,
      },
      _count: { select: { variants: { where: { isActive: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getVendorProductForEdit(productId: string, vendorId: string) {
  return db.product.findFirst({
    where: { id: productId, vendorId, deletedAt: null },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      variants: { where: { isActive: true }, orderBy: { createdAt: 'asc' } },
      category: { select: { id: true, name: true } },
    },
  })
}

export async function getCategories() {
  return db.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true },
  })
}
