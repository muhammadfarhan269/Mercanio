import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Store, RotateCcw, Truck } from 'lucide-react'
import { ProductImageGallery } from '@/components/storefront/product-image-gallery'
import { ProductAddToCart } from '@/components/storefront/product-add-to-cart'
import { ReviewStars } from '@/components/storefront/review-stars'
import { ProductCard } from '@/components/storefront/product-card'
import { SectionHeader } from '@/components/storefront/section-header'
import { getProductBySlug, getRelatedProducts } from '@/lib/queries/products'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Product not found' }

  return {
    title: product.metaTitle ?? product.name,
    description: product.metaDescription ?? product.shortDescription ?? undefined,
    openGraph: {
      title: product.name,
      description: product.shortDescription ?? undefined,
      images: product.images[0] ? [{ url: product.images[0].url }] : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const relatedProducts = await getRelatedProducts(
    product.id,
    product.categoryId,
    4
  )

  // Calculate average rating
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
        product.reviews.length
      : 0

  // Primary image for cart
  const primaryImage =
    product.images.find((img) => img.isPrimary)?.url ??
    product.images[0]?.url ??
    null

  return (
    <div className="bg-[#F5F0EB] min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[13px] text-[#8C7B6E] mb-8">
          <Link href="/" className="hover:text-[#C2692A] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/products" className="hover:text-[#C2692A] transition-colors">
            Products
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            href={`/categories/${product.category.slug}`}
            className="hover:text-[#C2692A] transition-colors"
          >
            {product.category.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#3D3028] truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        {/* Product layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Left — Image gallery */}
          <ProductImageGallery images={product.images} />

          {/* Right — Product info */}
          <div className="space-y-6">
            {/* Vendor */}
            <Link
              href={`/vendors/${product.vendor.slug}`}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#8C7B6E] hover:text-[#C2692A] transition-colors uppercase tracking-[0.06em]"
            >
              <Store className="w-3.5 h-3.5" />
              {product.vendor.storeName}
            </Link>

            {/* Product name */}
            <h1 className="text-[28px] font-semibold text-[#1A1410] tracking-[-0.6px] leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {product._count.reviews > 0 && (
              <div className="flex items-center gap-3">
                <ReviewStars
                  rating={Math.round(avgRating)}
                  size="md"
                  showCount
                  count={product._count.reviews}
                />
                <Link href="#reviews" className="text-[13px] text-[#C2692A] hover:underline">
                  Read reviews
                </Link>
              </div>
            )}

            {/* Variant selector + Add to cart */}
            <ProductAddToCart
              product={{
                id: product.id,
                name: product.name,
                vendorId: product.vendorId,
                vendorName: product.vendor.storeName,
                imageUrl: primaryImage,
              }}
              variants={product.variants.map((v) => ({
                ...v,
                attributes: v.attributes as Record<string, string>,
              }))}
              attributes={product.attributes}
            />

            {/* Trust signals */}
            <div className="space-y-2.5 pt-2 border-t border-[#E8DDD4]">
              <div className="flex items-center gap-3 text-[13px] text-[#3D3028]">
                <Truck className="w-4 h-4 text-[#8C7B6E] flex-shrink-0" />
                <span>Free shipping on orders over $75</span>
              </div>
              <div className="flex items-center gap-3 text-[13px] text-[#3D3028]">
                <RotateCcw className="w-4 h-4 text-[#8C7B6E] flex-shrink-0" />
                <span>{product.vendor.returnPolicy ?? '30-day returns'}</span>
              </div>
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#EDE8E2] text-[#6B5548]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Description + Vendor info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {/* Description */}
          <div className="lg:col-span-2">
            <h2 className="text-[18px] font-semibold text-[#1A1410] tracking-[-0.3px] mb-4">
              About this product
            </h2>
            <div className="prose prose-sm max-w-none text-[#3D3028] leading-relaxed text-[14px] space-y-3">
              {product.description?.split('\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          {/* Vendor card */}
          <div className="bg-white rounded-xl border border-[#E8DDD4] p-6 h-fit">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#F5E6D8] flex items-center justify-center flex-shrink-0">
                <span className="text-[#C2692A] font-semibold text-[14px]">
                  {product.vendor.storeName.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#1A1410]">
                  {product.vendor.storeName}
                </p>
                <p className="text-[11px] text-[#8C7B6E]">
                  {product.vendor._count.products} products
                </p>
              </div>
            </div>
            {product.vendor.description && (
              <p className="text-[13px] text-[#3D3028] leading-relaxed line-clamp-4 mb-4">
                {product.vendor.description}
              </p>
            )}
            <Link
              href={`/vendors/${product.vendor.slug}`}
              className="block w-full h-9 rounded-lg border border-[#E8DDD4] hover:border-[#C8B9AC] text-[13px] font-medium text-[#3D3028] transition-colors text-center leading-9"
            >
              View store
            </Link>
          </div>
        </div>

        {/* Reviews */}
        {product.reviews.length > 0 && (
          <div id="reviews" className="mb-20">
            <SectionHeader
              title={`Reviews (${product._count.reviews})`}
              subtitle={`Average rating: ${avgRating.toFixed(1)} / 5`}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-xl border border-[#E8DDD4] p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#EDE8E2] flex items-center justify-center flex-shrink-0">
                        <span className="text-[11px] font-medium text-[#6B5548]">
                          {review.user.name?.charAt(0) ?? '?'}
                        </span>
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-[#1A1410]">
                          {review.user.name ?? 'Anonymous'}
                        </p>
                        <p className="text-[11px] text-[#8C7B6E]">
                          Verified purchase
                        </p>
                      </div>
                    </div>
                    <ReviewStars rating={review.rating} />
                  </div>
                  {review.title && (
                    <p className="text-[13px] font-medium text-[#1A1410] mb-1">
                      {review.title}
                    </p>
                  )}
                  {review.body && (
                    <p className="text-[13px] text-[#3D3028] leading-relaxed">
                      {review.body}
                    </p>
                  )}
                  {review.vendorReply && (
                    <div className="mt-3 pl-3 border-l-2 border-[#E8DDD4]">
                      <p className="text-[11px] font-medium text-[#8C7B6E] mb-1">
                        Vendor reply
                      </p>
                      <p className="text-[13px] text-[#3D3028]">
                        {review.vendorReply}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mb-16">
            <SectionHeader
              title="You might also like"
              href={`/categories/${product.category.slug}`}
              linkLabel="View all in category"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
