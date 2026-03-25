'use client'

import { useState } from 'react'
import { ShoppingBag, Check, Loader2 } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart.store'
import { cn } from '@/lib/utils'

type AddToCartButtonProps = {
  variant: {
    id: string
    sku: string
    price: number
    compareAtPrice: number | null
    stock: number
    attributes: Record<string, string>
  } | null
  product: {
    id: string
    name: string
    vendorId: string
    vendorName: string
    imageUrl: string | null
  }
  className?: string
}

export function AddToCartButton({
  variant,
  product,
  className,
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem)
  const openCart = useCartStore((state) => state.openCart)
  const [status, setStatus] = useState<'idle' | 'adding' | 'added'>('idle')

  const isDisabled = !variant || variant.stock === 0 || status === 'adding'

  const handleAddToCart = async () => {
    if (!variant || variant.stock === 0) return

    setStatus('adding')

    // Small delay for perceived responsiveness
    await new Promise((resolve) => setTimeout(resolve, 300))

    addItem({
      variantId: variant.id,
      productId: product.id,
      productName: product.name,
      variantAttributes: variant.attributes,
      sku: variant.sku,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      imageUrl: product.imageUrl,
      vendorId: product.vendorId,
      vendorName: product.vendorName,
      stock: variant.stock,
    })

    setStatus('added')

    // Reset after 2 seconds, open cart drawer
    setTimeout(() => {
      setStatus('idle')
      openCart()
    }, 1500)
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={isDisabled}
      className={cn(
        'w-full h-12 rounded-xl font-medium text-[15px] transition-all duration-200',
        'flex items-center justify-center gap-2.5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2692A] focus-visible:ring-offset-2',
        status === 'added'
          ? 'bg-[#2B6B4A] text-white'
          : isDisabled
          ? 'bg-[#EDE8E2] text-[#B4A89C] cursor-not-allowed'
          : 'bg-[#C2692A] hover:bg-[#A85A24] text-white active:scale-[0.98]',
        className
      )}
    >
      {status === 'adding' ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Adding...
        </>
      ) : status === 'added' ? (
        <>
          <Check className="w-4 h-4" />
          Added to cart
        </>
      ) : !variant || variant.stock === 0 ? (
        'Out of stock'
      ) : (
        <>
          <ShoppingBag className="w-4 h-4" />
          Add to cart
        </>
      )}
    </button>
  )
}
