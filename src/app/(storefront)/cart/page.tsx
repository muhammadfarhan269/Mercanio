import type { Metadata } from 'next'
import { CartPageClient } from '@/components/storefront/cart-page-client'

export const metadata: Metadata = {
  title: 'Your Cart | Mercanio',
}

export default function CartPage() {
  return <CartPageClient />
}
