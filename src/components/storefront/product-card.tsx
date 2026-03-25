import Link from 'next/link'
import Image from 'next/image'
import { formatPrice, discountPercent } from '@/lib/utils/format'
import { cn } from '@/lib/utils'

export type ProductCardProduct = {
  id: string
  name: string
  slug: string
  shortDescription: string | null
  vendor: { storeName: string; slug: string }
  images: { url: string; altText: string | null }[]
  variants: { price: number; compareAtPrice: number | null }[]
  _count: { reviews: number }
}

type ProductCardProps = {
  product: ProductCardProduct
  className?: string
  priority?: boolean
}

export function ProductCard({ product, className, priority = false }: ProductCardProps) {
  const primaryImage = product.images[0]
  const primaryVariant = product.variants[0]
  const price = primaryVariant?.price ?? 0
  const compareAtPrice = primaryVariant?.compareAtPrice ?? null
  const hasDiscount = compareAtPrice && compareAtPrice > price
  const discount = hasDiscount ? discountPercent(price, compareAtPrice) : null

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        'group block bg-white rounded-xl border border-[#E8DDD4]',
        'hover:border-[#C8B9AC] hover:shadow-[0_4px_12px_rgba(26,20,16,0.08)]',
        'transition-all duration-200',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-[#F5F0EB]">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.altText ?? product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[#B4A89C] text-sm">No image</span>
          </div>
        )}

        {/* Discount badge */}
        {discount && (
          <div className="absolute top-3 left-3">
            <span className="bg-[#C2692A] text-white text-[11px] font-medium px-2 py-0.5 rounded">
              -{discount}%
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Vendor */}
        <p className="text-[11px] font-medium text-[#8C7B6E] uppercase tracking-[0.06em] mb-1.5">
          {product.vendor.storeName}
        </p>

        {/* Name */}
        <h3 className="text-[14px] font-medium text-[#1A1410] leading-snug mb-1 line-clamp-2 group-hover:text-[#C2692A] transition-colors">
          {product.name}
        </h3>

        {/* Price row */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[15px] font-semibold text-[#1A1410] font-mono">
            {formatPrice(price)}
          </span>
          {hasDiscount && (
            <span className="text-[13px] text-[#B4A89C] line-through font-mono">
              {formatPrice(compareAtPrice)}
            </span>
          )}
        </div>

        {/* Review count */}
        {product._count.reviews > 0 && (
          <p className="text-[11px] text-[#8C7B6E] mt-1.5">
            {product._count.reviews} review{product._count.reviews !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </Link>
  )
}
