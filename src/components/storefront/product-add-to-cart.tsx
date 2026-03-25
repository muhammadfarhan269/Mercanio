'use client'

import { useState, useCallback } from 'react'
import { VariantSelector } from './variant-selector'
import { AddToCartButton } from './add-to-cart-button'
import { Heart } from 'lucide-react'

type Variant = {
  id: string
  sku: string
  price: number
  compareAtPrice: number | null
  stock: number
  attributes: Record<string, string>
  images: string[]
}

type Attribute = {
  id: string
  name: string
  values: string[]
}

type ProductAddToCartProps = {
  product: {
    id: string
    name: string
    vendorId: string
    vendorName: string
    imageUrl: string | null
  }
  variants: Variant[]
  attributes: Attribute[]
}

export function ProductAddToCart({
  product,
  variants,
  attributes,
}: ProductAddToCartProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)

  const handleVariantChange = useCallback((variant: Variant | null) => {
    setSelectedVariant(variant)
  }, [])

  return (
    <div className="space-y-5">
      <VariantSelector
        variants={variants}
        attributes={attributes}
        onVariantChange={handleVariantChange}
      />

      <div className="flex gap-3">
        <AddToCartButton
          variant={selectedVariant}
          product={product}
        />
        <button
          type="button"
          className="w-12 h-12 flex-shrink-0 rounded-xl border border-[#E8DDD4] hover:border-[#C8B9AC] flex items-center justify-center text-[#8C7B6E] hover:text-[#C2692A] transition-colors"
          aria-label="Add to wishlist"
        >
          <Heart className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  )
}
