'use client'

import Link from 'next/link'
import { ArrowRight, Tag } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '@/lib/store/cart.store'
import { formatPrice } from '@/lib/utils/format'
import { cn } from '@/lib/utils'

export function CartSummary() {
  const getTotalPrice = useCartStore((state) => state.getTotalPrice)
  const items = useCartStore((state) => state.items)
  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState('')

  const subtotal = getTotalPrice()
  const shippingThreshold = 7500 // $75.00
  const shippingCost = subtotal >= shippingThreshold ? 0 : 599
  const total = subtotal + shippingCost

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return
    // Coupon validation implemented in checkout phase
    setCouponError('Coupon codes can be applied at checkout')
    setTimeout(() => setCouponError(''), 3000)
  }

  if (items.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-[#E8DDD4] p-6 sticky top-24">
      <h2 className="text-[16px] font-semibold text-[#1A1410] mb-5">
        Order summary
      </h2>

      {/* Line items */}
      <div className="space-y-2.5 mb-5">
        <div className="flex justify-between text-[13px]">
          <span className="text-[#8C7B6E]">
            Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)
          </span>
          <span className="text-[#1A1410] font-mono">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-[13px]">
          <span className="text-[#8C7B6E]">Shipping</span>
          <span className={cn('font-mono', shippingCost === 0 ? 'text-[#2B6B4A]' : 'text-[#1A1410]')}>
            {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
          </span>
        </div>
      </div>

      {/* Free shipping progress */}
      {subtotal < shippingThreshold && (
        <div className="mb-5">
          <div className="flex justify-between text-[12px] text-[#8C7B6E] mb-1.5">
            <span>Add {formatPrice(shippingThreshold - subtotal)} for free shipping</span>
          </div>
          <div className="h-1.5 bg-[#EDE8E2] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#C2692A] rounded-full transition-all duration-300"
              style={{ width: `${Math.min((subtotal / shippingThreshold) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-[#E8DDD4] pt-4 mb-5">
        <div className="flex justify-between">
          <span className="text-[15px] font-semibold text-[#1A1410]">Total</span>
          <span className="text-[15px] font-semibold text-[#1A1410] font-mono">
            {formatPrice(total)}
          </span>
        </div>
        <p className="text-[11px] text-[#8C7B6E] mt-1">
          Taxes calculated at checkout
        </p>
      </div>

      {/* Coupon code */}
      <div className="mb-5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8C7B6E]" />
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Discount code"
              className="w-full h-9 pl-8 pr-3 rounded-lg border border-[#E8DDD4] bg-white text-[13px] text-[#1A1410] placeholder:text-[#B4A89C] outline-none focus:border-[#C2692A] transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={handleApplyCoupon}
            className="h-9 px-4 rounded-lg border border-[#E8DDD4] hover:border-[#C8B9AC] text-[13px] font-medium text-[#3D3028] transition-colors"
          >
            Apply
          </button>
        </div>
        {couponError && (
          <p className="text-[12px] text-[#8C7B6E] mt-1.5">{couponError}</p>
        )}
      </div>

      {/* Checkout button */}
      <Link
        href="/checkout"
        className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-[#C2692A] hover:bg-[#A85A24] text-white text-[15px] font-medium transition-colors"
      >
        Proceed to checkout
        <ArrowRight className="w-4 h-4" />
      </Link>

      {/* Continue shopping */}
      <Link
        href="/products"
        className="flex items-center justify-center w-full h-10 mt-2.5 text-[13px] text-[#8C7B6E] hover:text-[#1A1410] transition-colors"
      >
        Continue shopping
      </Link>
    </div>
  )
}
