// Shape of a product record in Algolia index
export type AlgoliaProduct = {
  objectID: string // product.id
  name: string
  slug: string
  description: string | null
  shortDescription: string | null
  status: string
  isFeatured: boolean
  tags: string[]

  // Pricing (from lowest-priced active variant)
  price: number // in cents
  compareAtPrice: number | null
  currency: string

  // Relations (denormalised for search)
  vendorId: string
  vendorName: string
  vendorSlug: string
  categoryId: string
  categoryName: string
  categorySlug: string

  // For faceting
  inStock: boolean
  hasDiscount: boolean

  // Primary image
  imageUrl: string | null
  imageAlt: string | null

  // Timestamps (Unix for Algolia filtering)
  createdAtTimestamp: number
  updatedAtTimestamp: number
}
