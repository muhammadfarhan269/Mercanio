'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore, type CartItem } from '@/lib/store/cart.store'
import { formatPrice } from '@/lib/utils/format'

export function CartItemRow({ item }: { item: CartItem }) {
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)

  const attributeLabel = Object.entries(item.variantAttributes)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ')

  return (
    <div className="flex gap-4 py-5 border-b border-[#E8DDD4] last:border-0">
      {/* Image */}
      <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-[#EDE8E2]">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.productName}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[#B4A89C] text-xs">No image</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-[#8C7B6E] uppercase tracking-[0.06em] mb-0.5">
              {item.vendorName}
            </p>
            <Link
              href={`/products/${item.productId}`}
              className="text-[14px] font-medium text-[#1A1410] hover:text-[#C2692A] transition-colors line-clamp-2 leading-snug"
            >
              {item.productName}
            </Link>
            {attributeLabel && (
              <p className="text-[12px] text-[#8C7B6E] mt-1">{attributeLabel}</p>
            )}
          </div>

          {/* Line total */}
          <div className="text-right flex-shrink-0">
            <p className="text-[15px] font-semibold text-[#1A1410] font-mono">
              {formatPrice(item.price * item.quantity)}
            </p>
            {item.quantity > 1 && (
              <p className="text-[11px] text-[#8C7B6E] font-mono">
                {formatPrice(item.price)} each
              </p>
            )}
          </div>
        </div>

        {/* Quantity controls */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
              className="w-7 h-7 rounded-lg border border-[#E8DDD4] hover:border-[#C8B9AC] flex items-center justify-center text-[#3D3028] transition-colors disabled:opacity-40"
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-[13px] font-medium text-[#1A1410]">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
              disabled={item.quantity >= item.stock}
              className="w-7 h-7 rounded-lg border border-[#E8DDD4] hover:border-[#C8B9AC] flex items-center justify-center text-[#3D3028] transition-colors disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => removeItem(item.variantId)}
            className="flex items-center gap-1.5 text-[12px] text-[#8C7B6E] hover:text-[#B54242] transition-colors"
            aria-label="Remove item"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
