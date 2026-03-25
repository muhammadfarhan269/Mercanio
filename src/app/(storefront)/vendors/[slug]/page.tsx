import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { ChevronRight, Package, Calendar } from 'lucide-react'
import { getVendorBySlug } from '@/lib/queries/vendors'
import { getProducts } from '@/lib/queries/products'
import { getCategories } from '@/lib/queries/storefront'
import { ProductCard } from '@/components/storefront/product-card'
import { ProductSort } from '@/components/storefront/product-sort'
import { Pagination } from '@/components/storefront/pagination'
import { ProductFilters } from '@/components/storefront/product-filters'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    category?: string
    sort?: string
    page?: string
    inStock?: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const vendor = await getVendorBySlug(slug)
  if (!vendor) return { title: 'Vendor not found' }
  return {
    title: `${vendor.storeName} | Mercanio`,
    description: vendor.description ?? `Shop products from ${vendor.storeName} on Mercanio.`,
  }
}

export default async function VendorPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams

  const vendor = await getVendorBySlug(slug)
  if (!vendor) notFound()

  const page = Math.max(1, parseInt(sp.page ?? '1', 10))

  const [{ products, total, totalPages }, categories] = await Promise.all([
    getProducts({
      vendorSlug: slug,
      categorySlug: sp.category,
      sort: (sp.sort as 'newest' | 'price_asc' | 'price_desc' | 'popular') ?? 'newest',
      page,
      inStock: sp.inStock === 'true',
    }),
    getCategories(),
  ])

  const joinedYear = new Date(vendor.createdAt).getFullYear()

  return (
    <div className="bg-[#F5F0EB] min-h-screen">
      {/* Vendor hero */}
      <div className="bg-white border-b border-[#E8DDD4]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[13px] text-[#8C7B6E] mb-6">
            <Link href="/" className="hover:text-[#C2692A] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/vendors" className="hover:text-[#C2692A] transition-colors">
              Vendors
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#3D3028]">{vendor.storeName}</span>
          </nav>

          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-[#F5E6D8] flex items-center justify-center flex-shrink-0">
              <span className="text-[#C2692A] font-semibold text-[28px]">
                {vendor.storeName.charAt(0)}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-[28px] font-semibold text-[#1A1410] tracking-[-0.6px] mb-2">
                {vendor.storeName}
              </h1>
              {vendor.description && (
                <p className="text-[14px] text-[#3D3028] leading-relaxed max-w-2xl mb-4">
                  {vendor.description}
                </p>
              )}

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-5">
                <div className="flex items-center gap-1.5 text-[13px] text-[#8C7B6E]">
                  <Package className="w-3.5 h-3.5" />
                  {vendor._count.products} products
                </div>
                <div className="flex items-center gap-1.5 text-[13px] text-[#8C7B6E]">
                  <Calendar className="w-3.5 h-3.5" />
                  Selling since {joinedYear}
                </div>
              </div>
            </div>
          </div>

          {/* Policies */}
          {(vendor.returnPolicy || vendor.shippingPolicy) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-[#E8DDD4]">
              {vendor.shippingPolicy && (
                <div>
                  <p className="text-[12px] font-medium text-[#3D3028] uppercase tracking-[0.06em] mb-1">
                    Shipping
                  </p>
                  <p className="text-[13px] text-[#8C7B6E]">{vendor.shippingPolicy}</p>
                </div>
              )}
              {vendor.returnPolicy && (
                <div>
                  <p className="text-[12px] font-medium text-[#3D3028] uppercase tracking-[0.06em] mb-1">
                    Returns
                  </p>
                  <p className="text-[13px] text-[#8C7B6E]">{vendor.returnPolicy}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Products */}
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
              vendors={[]}
              totalProducts={total}
            />
          </Suspense>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[13px] text-[#8C7B6E]">
                {total === 0
                  ? 'No products yet'
                  : `Showing ${products.length} of ${total}`}
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
                  No products yet
                </p>
                <p className="text-[13px] text-[#8C7B6E]">
                  This vendor hasn&apos;t listed any products yet
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
