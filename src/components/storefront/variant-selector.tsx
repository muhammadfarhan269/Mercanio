'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { formatPrice, discountPercent } from '@/lib/utils/format'

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

type VariantSelectorProps = {
  variants: Variant[]
  attributes: Attribute[]
  onVariantChange: (variant: Variant | null) => void
}

export function VariantSelector({
  variants,
  attributes,
  onVariantChange,
}: VariantSelectorProps) {
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({})

  // Auto-select first value of each attribute
  useEffect(() => {
    const initial: Record<string, string> = {}
    attributes.forEach((attr) => {
      if (attr.values[0]) initial[attr.name] = attr.values[0]
    })
    setSelectedAttributes(initial)
  }, [attributes])

  // Find matching variant based on selected attributes
  useEffect(() => {
    if (Object.keys(selectedAttributes).length !== attributes.length) {
      onVariantChange(null)
      return
    }

    const match = variants.find((variant) => {
      const attrs = variant.attributes as Record<string, string>
      return attributes.every(
        (attr) => attrs[attr.name] === selectedAttributes[attr.name]
      )
    })

    onVariantChange(match ?? null)
  }, [selectedAttributes, variants, attributes, onVariantChange])

  const selectAttribute = (name: string, value: string) => {
    setSelectedAttributes((prev) => ({ ...prev, [name]: value }))
  }

  // Check if a specific attribute value is available (has stock)
  const isValueAvailable = (attrName: string, value: string) => {
    const testAttrs = { ...selectedAttributes, [attrName]: value }
    return variants.some((variant) => {
      const attrs = variant.attributes as Record<string, string>
      return (
        attrs[attrName] === value &&
        Object.entries(testAttrs).every(
          ([k, v]) => k === attrName || attrs[k] === v
        ) &&
        variant.stock > 0
      )
    })
  }

  // Get current matched variant for price display
  const currentVariant = variants.find((variant) => {
    const attrs = variant.attributes as Record<string, string>
    return attributes.every(
      (attr) => attrs[attr.name] === selectedAttributes[attr.name]
    )
  })

  return (
    <div className="space-y-5">
      {/* Price display */}
      {currentVariant && (
        <div className="flex items-baseline gap-3">
          <span className="text-[28px] font-semibold text-[#1A1410] tracking-[-0.5px] font-mono">
            {formatPrice(currentVariant.price)}
          </span>
          {currentVariant.compareAtPrice &&
            currentVariant.compareAtPrice > currentVariant.price && (
              <>
                <span className="text-[18px] text-[#B4A89C] line-through font-mono">
                  {formatPrice(currentVariant.compareAtPrice)}
                </span>
                <span className="text-[13px] font-medium text-white bg-[#C2692A] px-2 py-0.5 rounded">
                  -{discountPercent(currentVariant.price, currentVariant.compareAtPrice)}%
                </span>
              </>
            )}
        </div>
      )}

      {/* Attribute selectors */}
      {attributes.map((attribute) => (
        <div key={attribute.id}>
          <div className="flex items-center gap-2 mb-2.5">
            <p className="text-[13px] font-medium text-[#3D3028]">
              {attribute.name}
            </p>
            {selectedAttributes[attribute.name] && (
              <span className="text-[13px] text-[#8C7B6E]">
                — {selectedAttributes[attribute.name]}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {attribute.values.map((value) => {
              const isSelected = selectedAttributes[attribute.name] === value
              const isAvailable = isValueAvailable(attribute.name, value)

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => selectAttribute(attribute.name, value)}
                  disabled={!isAvailable}
                  className={cn(
                    'h-9 px-4 rounded-lg border text-[13px] font-medium transition-all',
                    isSelected
                      ? 'border-[#C2692A] bg-[#F5E6D8] text-[#9A5220]'
                      : isAvailable
                      ? 'border-[#E8DDD4] text-[#3D3028] hover:border-[#C8B9AC]'
                      : 'border-[#E8DDD4] text-[#B4A89C] line-through cursor-not-allowed opacity-50'
                  )}
                >
                  {value}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Stock indicator */}
      {currentVariant && (
        <div className="flex items-center gap-2">
          {currentVariant.stock > 0 ? (
            <>
              <div className="w-2 h-2 rounded-full bg-[#2B6B4A]" />
              <span className="text-[13px] text-[#2B6B4A]">
                {currentVariant.stock <= 5
                  ? `Only ${currentVariant.stock} left`
                  : 'In stock'}
              </span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-[#B54242]" />
              <span className="text-[13px] text-[#B54242]">Out of stock</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}
