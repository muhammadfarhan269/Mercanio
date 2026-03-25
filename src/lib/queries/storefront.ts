import { db } from '@/lib/db'
import { OrderStatus, ProductStatus, VendorStatus } from '@prisma/client'
import { unstable_cache } from 'next/cache'
import { redis } from '@/lib/redis'

async function fetchFeaturedProducts(limit: number) {
  return db.product.findMany({
    where: {
      status: ProductStatus.ACTIVE,
      isFeatured: true,
      deletedAt: null,
      variants: { some: { isActive: true, stock: { gt: 0 } } },
    },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      vendor: { select: { storeName: true, slug: true } },
      variants: {
        where: { isActive: true },
        orderBy: { price: 'asc' },
        take: 1,
        select: { price: true, compareAtPrice: true },
      },
      _count: { select: { reviews: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function getFeaturedProducts(limit = 8) {
  const cacheKey = `mercanio:featured-products:${limit}`

  try {
    const cached = await redis.get(cacheKey)
    if (cached) {
      return cached as Awaited<ReturnType<typeof fetchFeaturedProducts>>
    }
  } catch {
    // Cache miss or Redis error — fall through to DB
  }

  const data = await fetchFeaturedProducts(limit)

  try {
    await redis.set(cacheKey, data, { ex: 300 })
  } catch {
    // Cache write failure is non-fatal
  }

  return data
}

// All active categories
export const getCategories = unstable_cache(
  async () => {
    return db.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: {
            products: {
              where: { status: ProductStatus.ACTIVE, deletedAt: null },
            },
          },
        },
      },
    })
  },
  ['categories'],
  { revalidate: 600 }
)

// Active vendors with product count
export const getFeaturedVendors = unstable_cache(
  async (limit = 6) => {
    return db.vendor.findMany({
      where: {
        status: VendorStatus.ACTIVE,
        deletedAt: null,
      },
      select: {
        id: true,
        storeName: true,
        slug: true,
        description: true,
        logo: true,
        _count: {
          select: {
            products: {
              where: { status: ProductStatus.ACTIVE, deletedAt: null },
            },
          },
        },
      },
      take: limit,
      orderBy: { createdAt: 'asc' },
    })
  },
  ['featured-vendors'],
  { revalidate: 600 }
)

// Latest products across all vendors
export const getLatestProducts = unstable_cache(
  async (limit = 8) => {
    return db.product.findMany({
      where: {
        status: ProductStatus.ACTIVE,
        deletedAt: null,
        variants: { some: { isActive: true, stock: { gt: 0 } } },
      },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        vendor: {
          select: { storeName: true, slug: true },
        },
        variants: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
          take: 1,
          select: { price: true, compareAtPrice: true },
        },
        _count: { select: { reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  },
  ['latest-products'],
  { revalidate: 300 }
)

// Active hero banner
export const getHeroBanner = unstable_cache(
  async () => {
    return db.banner.findFirst({
      where: {
        placement: 'hero',
        isActive: true,
        OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }],
        AND: [
          {
            OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }],
          },
        ],
      },
      orderBy: { sortOrder: 'asc' },
    })
  },
  ['hero-banner'],
  { revalidate: 600 }
)

async function fetchPlatformStats() {
  const [productCount, vendorCount, orderCount] = await Promise.all([
    db.product.count({ where: { status: ProductStatus.ACTIVE, deletedAt: null } }),
    db.vendor.count({ where: { status: VendorStatus.ACTIVE, deletedAt: null } }),
    db.order.count({
      where: {
        status: {
          in: [
            OrderStatus.CONFIRMED,
            OrderStatus.PROCESSING,
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED,
          ],
        },
      },
    }),
  ])
  return { productCount, vendorCount, orderCount }
}

export async function getPlatformStats() {
  const cacheKey = 'mercanio:platform-stats'

  try {
    const cached = await redis.get(cacheKey)
    if (cached) {
      return cached as Awaited<ReturnType<typeof fetchPlatformStats>>
    }
  } catch {
    // fall through to DB
  }

  const data = await fetchPlatformStats()

  try {
    await redis.set(cacheKey, data, { ex: 3600 })
  } catch {
    // non-fatal
  }

  return data
}

export async function invalidateStorefrontCache() {
  try {
    await redis.del('mercanio:platform-stats')
    // Featured products cache will expire naturally via TTL
  } catch {
    // Non-fatal
  }
}
