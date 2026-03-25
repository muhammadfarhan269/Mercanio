'use client'

import Link from 'next/link'
import { ShoppingBag, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart.store'
import { CartItemRow } from './cart-item-row'
import { CartSummary } from './cart-summary'

export function CartPageClient() {
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)

  if (items.length === 0) {
    return (
      <div className="bg-[#F5F0EB] min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-[#EDE8E2] flex items-center justify-center mb-6">
              <ShoppingBag className="w-8 h-8 text-[#B4A89C]" />
            </div>
            <h1 className="text-[24px] font-semibold text-[#1A1410] tracking-[-0.4px] mb-2">
              Your cart is empty
            </h1>
            <p className="text-[14px] text-[#8C7B6E] mb-8 max-w-[280px]">
              Looks like you haven't added anything yet. Start browsing our collection.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-[#C2692A] hover:bg-[#A85A24] text-white text-[14px] font-medium transition-colors"
            >
              Browse products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#F5F0EB] min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[28px] font-semibold text-[#1A1410] tracking-[-0.6px]">
            Your cart
            <span className="ml-2 text-[18px] font-normal text-[#8C7B6E]">
              ({items.reduce((s, i) => s + i.quantity, 0)} items)
            </span>
          </h1>
          <button
            type="button"
            onClick={clearCart}
            className="text-[13px] text-[#8C7B6E] hover:text-[#B54242] transition-colors"
          >
            Clear cart
          </button>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-[#E8DDD4] px-6">
              {items.map((item) => (
                <CartItemRow key={item.variantId} item={item} />
              ))}
            </div>

            {/* Vendor notice */}
            <div className="mt-4 px-4 py-3 bg-[#F5E6D8] rounded-xl border border-[#EDD5C0]">
              <p className="text-[12px] text-[#9A5220] leading-relaxed">
                <span className="font-medium">Multi-vendor order:</span> Items from different vendors will be fulfilled separately. Each vendor manages their own shipping.
              </p>
            </div>
          </div>

          {/* Summary */}
          <div>
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  )
}
