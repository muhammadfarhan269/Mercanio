import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ProductCard } from '@/components/storefront/product-card'
import { ProductFilters } from '@/components/storefront/product-filters'
import { ProductSort } from '@/components/storefront/product-sort'
import { Pagination } from '@/components/storefront/pagination'
import { getProducts } from '@/lib/queries/products'
import { getCategories } from '@/lib/queries/storefront'
import { db } from '@/lib/db'
import { VendorStatus, ProductStatus } from '@prisma/client'

export const metadata: Metadata = {
  title: 'All Products | Mercanio',
  description: 'Browse all products from independent vendors on Mercanio.',
}

type SearchParams = {
  category?: string
  vendor?: string
  sort?: string
  page?: string
  inStock?: string
  sale?: string
  featured?: string
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10))

  const [{ products, total, totalPages }, categories, vendors] = await Promise.all([
    getProducts({
      categorySlug: params.category,
      vendorSlug: params.vendor,
      sort: (params.sort as 'newest' | 'price_asc' | 'price_desc' | 'popular') ?? 'newest',
      page,
      inStock: params.inStock === 'true',
      featured: params.featured === 'true',
      sale: params.sale === 'true',
    }),
    getCategories(),
    db.vendor.findMany({
      where: { status: VendorStatus.ACTIVE, deletedAt: null },
      select: {
        id: true,
        storeName: true,
        slug: true,
        _count: {
          select: {
            products: {
              where: { status: ProductStatus.ACTIVE, deletedAt: null },
            },
          },
        },
      },
      orderBy: { storeName: 'asc' },
    }),
  ])

  return (
    <div className="bg-[#F5F0EB] min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-[32px] font-semibold text-[#1A1410] tracking-[-0.8px] mb-2">
            All products
          </h1>
          <p className="text-[14px] text-[#8C7B6E]">
            Handcrafted goods from independent makers
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Filters sidebar */}
          <Suspense fallback={null}>
            <ProductFilters
              categories={categories.map((c) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                _count: { products: c._count.products },
              }))}
              vendors={vendors}
              totalProducts={total}
            />
          </Suspense>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-[13px] text-[#8C7B6E]">
                {total === 0
                  ? 'No products found'
                  : `Showing ${products.length} of ${total}`}
              </p>
              <Suspense fallback={null}>
                <ProductSort />
              </Suspense>
            </div>

            {/* Grid */}
            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {products.map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      priority={i < 6}
                    />
                  ))}
                </div>
                <Suspense fallback={null}>
                  <Pagination currentPage={page} totalPages={totalPages} />
                </Suspense>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-[#EDE8E2] flex items-center justify-center mb-4">
                  <span className="text-[28px]">🔍</span>
                </div>
                <h3 className="text-[16px] font-medium text-[#1A1410] mb-2">
                  No products found
                </h3>
                <p className="text-[13px] text-[#8C7B6E] max-w-[280px]">
                  Try adjusting your filters or browse all categories
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
