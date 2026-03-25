import { db } from '@/lib/db'
import { ProductStatus, ReviewStatus, type Prisma } from '@prisma/client'
import { PRODUCTS_PER_PAGE } from '@/lib/constants'

/** Catalog listing row — matches ProductCard + getProducts include */
const productCatalogInclude = {
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
    select: { price: true, compareAtPrice: true, stock: true },
  },
  _count: { select: { reviews: true } },
} satisfies Prisma.ProductInclude

export type ProductCatalogItem = Prisma.ProductGetPayload<{
  include: typeof productCatalogInclude
}>

type ProductFilters = {
  categorySlug?: string
  vendorSlug?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  featured?: boolean
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular'
  page?: number
  search?: string
  sale?: boolean
}

export async function getProducts(filters: ProductFilters = {}) {
  const {
    categorySlug,
    vendorSlug,
    minPrice,
    maxPrice,
    inStock,
    featured,
    sort = 'newest',
    page = 1,
    sale,
  } = filters

  const skip = (page - 1) * PRODUCTS_PER_PAGE

  const variantConditions: Prisma.ProductVariantWhereInput[] = []
  if (inStock) {
    variantConditions.push({ stock: { gt: 0 } })
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    variantConditions.push({
      price: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      },
    })
  }
  if (sale) {
    variantConditions.push({ compareAtPrice: { not: null } })
  }

  const variantFilter: Prisma.ProductVariantWhereInput | undefined =
    variantConditions.length > 0
      ? {
          isActive: true,
          AND: variantConditions,
        }
      : undefined

  const where: Prisma.ProductWhereInput = {
    status: ProductStatus.ACTIVE,
    deletedAt: null,
    ...(categorySlug && {
      category: { slug: categorySlug },
    }),
    ...(vendorSlug && {
      vendor: { slug: vendorSlug },
    }),
    ...(featured && { isFeatured: true }),
    ...(variantFilter && {
      variants: { some: variantFilter },
    }),
  }

  const orderBy = (() => {
    switch (sort) {
      case 'popular':
        return {
          reviews: { _count: 'desc' as const },
        } satisfies Prisma.ProductOrderByWithRelationInput
      default:
        return { createdAt: 'desc' as const } satisfies Prisma.ProductOrderByWithRelationInput
    }
  })()

  // Prisma does not support ordering Products by related variant _min.price directly.
  // For price sorting, fetch the matched set and sort in memory by the selected primary variant price.
  if (sort === 'price_asc' || sort === 'price_desc') {
    const allProducts = await db.product.findMany({
      where,
      include: productCatalogInclude,
      orderBy: { createdAt: 'desc' },
    })

    const sorted = allProducts.sort((a, b) => {
      const aPrice = a.variants[0]?.price ?? Number.MAX_SAFE_INTEGER
      const bPrice = b.variants[0]?.price ?? Number.MAX_SAFE_INTEGER
      return sort === 'price_asc' ? aPrice - bPrice : bPrice - aPrice
    })

    const total = sorted.length
    const products = sorted.slice(skip, skip + PRODUCTS_PER_PAGE)

    return {
      products: products as ProductCatalogItem[],
      total,
      page,
      pageSize: PRODUCTS_PER_PAGE,
      totalPages: Math.ceil(total / PRODUCTS_PER_PAGE),
    }
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: productCatalogInclude,
      orderBy,
      skip,
      take: PRODUCTS_PER_PAGE,
    }),
    db.product.count({ where }),
  ])

  return {
    products: products as ProductCatalogItem[],
    total,
    page,
    pageSize: PRODUCTS_PER_PAGE,
    totalPages: Math.ceil(total / PRODUCTS_PER_PAGE),
  }
}

export const getProductBySlug = async (slug: string) => {
  return db.product.findFirst({
    where: { slug, status: ProductStatus.ACTIVE, deletedAt: null },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      vendor: {
        select: {
          id: true,
          storeName: true,
          slug: true,
          description: true,
          logo: true,
          returnPolicy: true,
          shippingPolicy: true,
          _count: {
            select: {
              products: {
                where: { status: ProductStatus.ACTIVE, deletedAt: null },
              },
            },
          },
        },
      },
      category: {
        select: { id: true, name: true, slug: true },
      },
      variants: {
        where: { isActive: true },
        orderBy: { price: 'asc' },
      },
      attributes: true,
      reviews: {
        where: { status: ReviewStatus.APPROVED },
        include: {
          user: { select: { name: true, image: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: { select: { reviews: true } },
    },
  })
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  limit = 4
) {
  return db.product.findMany({
    where: {
      status: ProductStatus.ACTIVE,
      deletedAt: null,
      categoryId,
      id: { not: productId },
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
    take: limit,
    orderBy: { createdAt: 'desc' },
  })
}
