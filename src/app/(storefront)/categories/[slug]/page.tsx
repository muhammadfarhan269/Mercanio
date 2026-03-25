import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import Image from 'next/image'
import { db } from '@/lib/db'
import { getProducts } from '@/lib/queries/products'
import { getCategories } from '@/lib/queries/storefront'
import { ProductCard } from '@/components/storefront/product-card'
import { ProductFilters } from '@/components/storefront/product-filters'
import { ProductSort } from '@/components/storefront/product-sort'
import { Pagination } from '@/components/storefront/pagination'
import { VendorStatus, ProductStatus } from '@prisma/client'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    vendor?: string
    sort?: string
    page?: string
    inStock?: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await db.category.findUnique({ where: { slug } })
  if (!category) return { title: 'Category not found' }
  return {
    title: `${category.name} | Mercanio`,
    description: `Browse ${category.name} products from independent vendors on Mercanio.`,
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams

  const category = await db.category.findFirst({
    where: { slug, isActive: true },
  })
  if (!category) notFound()

  const page = Math.max(1, parseInt(sp.page ?? '1', 10))

  const [{ products, total, totalPages }, categories, vendors] =
    await Promise.all([
      getProducts({
        categorySlug: slug,
        vendorSlug: sp.vendor,
        sort: (sp.sort as 'newest' | 'price_asc' | 'price_desc' | 'popular') ?? 'newest',
        page,
        inStock: sp.inStock === 'true',
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
                where: {
                  status: ProductStatus.ACTIVE,
                  deletedAt: null,
                  category: { slug },
                },
              },
            },
          },
        },
        orderBy: { storeName: 'asc' },
      }),
    ])

  return (
    <div className="bg-[#F5F0EB] min-h-screen">
      {/* Category hero */}
      <div className="relative h-48 bg-[#1A1410] overflow-hidden">
        {category.image && (
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover opacity-30"
            priority
          />
        )}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex items-end pb-8">
          <div>
            <h1 className="text-white text-[32px] font-semibold tracking-[-0.8px]">
              {category.name}
            </h1>
            <p className="text-white/60 text-[14px] mt-1">
              {total} products
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          <Suspense fallback={null}>
            <ProductFilters
              categories={categories.map((c) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                _count: { products: c._count.products },
              }))}
              vendors={vendors.filter((v) => v._count.products > 0)}
              totalProducts={total}
            />
          </Suspense>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[13px] text-[#8C7B6E]">
                Showing {products.length} of {total}
              </p>
              <Suspense fallback={null}>
                <ProductSort />
              </Suspense>
            </div>

            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {products.map((product, i) => (
                    <ProductCard key={product.id} product={product} priority={i < 6} />
                  ))}
                </div>
                <Suspense fallback={null}>
                  <Pagination currentPage={page} totalPages={totalPages} />
                </Suspense>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-[16px] font-medium text-[#1A1410] mb-2">
                  No products found
                </p>
                <p className="text-[13px] text-[#8C7B6E]">
                  Try adjusting your filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
