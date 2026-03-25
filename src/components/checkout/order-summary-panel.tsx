'use client'

import Image from 'next/image'
import { formatPrice } from '@/lib/utils/format'
import type { CartItem } from '@/lib/store/cart.store'

type Totals = {
  subtotal: number
  shippingTotal: number
  taxTotal: number
  total: number
}

type OrderSummaryPanelProps = {
  items: CartItem[]
  totals: Totals | null
}

export function OrderSummaryPanel({ items, totals }: OrderSummaryPanelProps) {
  const localSubtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const localShipping = localSubtotal >= 7500 ? 0 : 599
  const localTax = Math.round(localSubtotal * 0.08)
  const localTotal = localSubtotal + localShipping + localTax

  const display = totals ?? {
    subtotal: localSubtotal,
    shippingTotal: localShipping,
    taxTotal: localTax,
    total: localTotal,
  }

  return (
    <div className="bg-[#F5F0EB] rounded-2xl p-6">
      <h2 className="text-[14px] font-semibold text-[#1A1410] mb-5 uppercase tracking-[0.06em]">
        Order summary
      </h2>

      {/* Items */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.variantId} className="flex gap-3">
            {/* Image with quantity badge */}
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#EDE8E2]">
                {item.imageUrl && (
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#8C7B6E] text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                {item.quantity}
              </span>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#1A1410] leading-snug truncate">
                {item.productName}
              </p>
              <p className="text-[11px] text-[#8C7B6E] mt-0.5">
                {Object.entries(item.variantAttributes)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(' · ')}
              </p>
            </div>

            {/* Price */}
            <p className="text-[13px] font-medium text-[#1A1410] font-mono flex-shrink-0">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-[#E8DDD4] pt-4 space-y-2.5 mb-4">
        <div className="flex justify-between text-[13px]">
          <span className="text-[#8C7B6E]">Subtotal</span>
          <span className="text-[#1A1410] font-mono">{formatPrice(display.subtotal)}</span>
        </div>
        <div className="flex justify-between text-[13px]">
          <span className="text-[#8C7B6E]">Shipping</span>
          <span className={display.shippingTotal === 0 ? 'text-[#2B6B4A] text-[13px]' : 'text-[#1A1410] font-mono text-[13px]'}>
            {display.shippingTotal === 0 ? 'Free' : formatPrice(display.shippingTotal)}
          </span>
        </div>
        <div className="flex justify-between text-[13px]">
          <span className="text-[#8C7B6E]">Tax (8%)</span>
          <span className="text-[#1A1410] font-mono">{formatPrice(display.taxTotal)}</span>
        </div>
      </div>

      <div className="border-t border-[#E8DDD4] pt-4">
        <div className="flex justify-between">
          <span className="text-[15px] font-semibold text-[#1A1410]">Total</span>
          <span className="text-[15px] font-semibold text-[#1A1410] font-mono">
            {formatPrice(display.total)}
          </span>
        </div>
      </div>
    </div>
  )
}
