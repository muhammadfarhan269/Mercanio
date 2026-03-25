import { db } from '@/lib/db'
import { getAdminClient, PRODUCTS_INDEX } from '@/lib/algolia'
import { ProductStatus } from '@prisma/client'
import type { AlgoliaProduct } from '@/lib/algolia.types'

export async function syncAllProductsToAlgolia(): Promise<void> {
  const client = getAdminClient()

  const products = await db.product.findMany({
    where: {
      status: ProductStatus.ACTIVE,
      deletedAt: null,
    },
    include: {
      vendor: {
        select: { id: true, storeName: true, slug: true },
      },
      category: {
        select: { id: true, name: true, slug: true },
      },
      variants: {
        where: { isActive: true },
        orderBy: { price: 'asc' },
        take: 1,
        select: { price: true, compareAtPrice: true, stock: true },
      },
      images: {
        where: { isPrimary: true },
        take: 1,
        select: { url: true, altText: true },
      },
    },
  })

  const records: AlgoliaProduct[] = products.map((product) => {
    const variant = product.variants[0]
    const image = product.images[0]
    const price = variant?.price ?? 0
    const compareAtPrice = variant?.compareAtPrice ?? null
    const inStock = (variant?.stock ?? 0) > 0

    return {
      objectID: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      status: product.status,
      isFeatured: product.isFeatured,
      tags: product.tags,
      price,
      compareAtPrice,
      currency: 'USD',
      vendorId: product.vendor.id,
      vendorName: product.vendor.storeName,
      vendorSlug: product.vendor.slug,
      categoryId: product.category.id,
      categoryName: product.category.name,
      categorySlug: product.category.slug,
      inStock,
      hasDiscount: compareAtPrice !== null && compareAtPrice > price,
      imageUrl: image?.url ?? null,
      imageAlt: image?.altText ?? null,
      createdAtTimestamp: product.createdAt.getTime(),
      updatedAtTimestamp: product.updatedAt.getTime(),
    }
  })

  // Save all records to Algolia
  await client.saveObjects({
    indexName: PRODUCTS_INDEX,
    objects: records,
  })

  // Configure index settings — facets, searchable attrs, ranking
  await client.setSettings({
    indexName: PRODUCTS_INDEX,
    indexSettings: {
      searchableAttributes: [
        'name',
        'shortDescription',
        'description',
        'vendorName',
        'categoryName',
        'tags',
      ],
      attributesForFaceting: [
        'filterOnly(vendorId)',
        'filterOnly(categoryId)',
        'filterOnly(inStock)',
        'filterOnly(hasDiscount)',
        'filterOnly(status)',
        'vendorName',
        'categoryName',
      ],
      customRanking: ['desc(isFeatured)', 'desc(createdAtTimestamp)'],
      ranking: [
        'typo',
        'geo',
        'words',
        'filters',
        'proximity',
        'attribute',
        'exact',
        'custom',
      ],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
    },
  })

  console.log(`✓ Synced ${records.length} products to Algolia`)
}

export async function syncSingleProductToAlgolia(productId: string): Promise<void> {
  const client = getAdminClient()

  const product = await db.product.findUnique({
    where: { id: productId },
    include: {
      vendor: { select: { id: true, storeName: true, slug: true } },
      category: { select: { id: true, name: true, slug: true } },
      variants: {
        where: { isActive: true },
        orderBy: { price: 'asc' },
        take: 1,
        select: { price: true, compareAtPrice: true, stock: true },
      },
      images: {
        where: { isPrimary: true },
        take: 1,
        select: { url: true, altText: true },
      },
    },
  })

  if (!product || product.deletedAt) {
    // Remove from index if deleted
    await client.deleteObject({
      indexName: PRODUCTS_INDEX,
      objectID: productId,
    })
    return
  }

  if (product.status !== ProductStatus.ACTIVE) {
    await client.deleteObject({
      indexName: PRODUCTS_INDEX,
      objectID: productId,
    })
    return
  }

  const variant = product.variants[0]
  const image = product.images[0]
  const price = variant?.price ?? 0
  const compareAtPrice = variant?.compareAtPrice ?? null

  const record: AlgoliaProduct = {
    objectID: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    status: product.status,
    isFeatured: product.isFeatured,
    tags: product.tags,
    price,
    compareAtPrice,
    currency: 'USD',
    vendorId: product.vendor.id,
    vendorName: product.vendor.storeName,
    vendorSlug: product.vendor.slug,
    categoryId: product.category.id,
    categoryName: product.category.name,
    categorySlug: product.category.slug,
    inStock: (variant?.stock ?? 0) > 0,
    hasDiscount: compareAtPrice !== null && compareAtPrice > price,
    imageUrl: image?.url ?? null,
    imageAlt: image?.altText ?? null,
    createdAtTimestamp: product.createdAt.getTime(),
    updatedAtTimestamp: product.updatedAt.getTime(),
  }

  await client.saveObject({
    indexName: PRODUCTS_INDEX,
    body: record,
  })
}

export async function deleteProductFromAlgolia(productId: string): Promise<void> {
  const client = getAdminClient()
  await client.deleteObject({
    indexName: PRODUCTS_INDEX,
    objectID: productId,
  })
}
