import { db } from '@/lib/db'
import { VendorStatus, ProductStatus } from '@prisma/client'
import { unstable_cache } from 'next/cache'

export const getAllVendors = unstable_cache(
  async () => {
    return db.vendor.findMany({
      where: { status: VendorStatus.ACTIVE, deletedAt: null },
      select: {
        id: true,
        storeName: true,
        slug: true,
        description: true,
        logo: true,
        banner: true,
        createdAt: true,
        _count: {
          select: {
            products: {
              where: { status: ProductStatus.ACTIVE, deletedAt: null },
            },
          },
        },
      },
      orderBy: { storeName: 'asc' },
    })
  },
  ['all-vendors'],
  { revalidate: 600 }
)

export const getVendorBySlug = async (slug: string) => {
  return db.vendor.findFirst({
    where: { slug, status: VendorStatus.ACTIVE, deletedAt: null },
    select: {
      id: true,
      storeName: true,
      slug: true,
      description: true,
      logo: true,
      banner: true,
      returnPolicy: true,
      shippingPolicy: true,
      createdAt: true,
      _count: {
        select: {
          products: {
            where: { status: ProductStatus.ACTIVE, deletedAt: null },
          },
        },
      },
    },
  })
}
