'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart.store'

export function CartCount() {
  const items = useCartStore((state) => state.items)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Keep server and initial client render identical to avoid hydration mismatch.
  const totalItems = mounted
    ? items.reduce((sum, item) => sum + item.quantity, 0)
    : 0

  return (
    <Link
      href="/cart"
      className="w-9 h-9 flex items-center justify-center rounded-lg text-[#8C7B6E] hover:text-[#1A1410] hover:bg-[#F5F0EB] transition-colors relative"
      aria-label={`Shopping cart${totalItems > 0 ? `, ${totalItems} items` : ''}`}
    >
      <ShoppingBag className="w-4 h-4" />
      {totalItems > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#C2692A] text-white text-[10px] font-medium rounded-full flex items-center justify-center">
          {totalItems > 9 ? '9+' : totalItems}
        </span>
      )}
    </Link>
  )
}
