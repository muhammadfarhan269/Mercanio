'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, ArrowRight, Loader2 } from 'lucide-react'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const paymentIntentId = searchParams.get('payment_intent')
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!paymentIntentId) {
      setIsLoading(false)
      return
    }

    // Poll for order creation (webhook may take a moment)
    let attempts = 0
    const maxAttempts = 10

    const poll = async () => {
      try {
        const response = await fetch(
          `/api/checkout/order-status?payment_intent=${paymentIntentId}`
        )
        const data = await response.json()

        if (data.orderNumber) {
          setOrderNumber(data.orderNumber)
          setIsLoading(false)
          return
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 1500)
        } else {
          setIsLoading(false)
        }
      } catch {
        setIsLoading(false)
      }
    }

    poll()
  }, [paymentIntentId])

  return (
    <div className="bg-[#F5F0EB] min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* Success icon */}
        <div className="w-20 h-20 rounded-full bg-[#E6F0EB] flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-[#2B6B4A]" />
        </div>

        <h1 className="text-[28px] font-semibold text-[#1A1410] tracking-[-0.6px] mb-2">
          Order confirmed
        </h1>
        <p className="text-[14px] text-[#8C7B6E] mb-6">
          Thank you for your purchase. We have sent a confirmation email with your order details.
        </p>

        {/* Order number */}
        {isLoading ? (
          <div className="bg-white rounded-xl border border-[#E8DDD4] px-6 py-4 mb-8 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#8C7B6E]" />
            <span className="text-[13px] text-[#8C7B6E]">Loading order details...</span>
          </div>
        ) : orderNumber ? (
          <div className="bg-white rounded-xl border border-[#E8DDD4] px-6 py-4 mb-8">
            <p className="text-[12px] font-medium text-[#8C7B6E] uppercase tracking-[0.06em] mb-1">
              Order number
            </p>
            <p className="text-[20px] font-semibold text-[#C2692A] font-mono">
              {orderNumber}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E8DDD4] px-6 py-4 mb-8">
            <p className="text-[13px] text-[#8C7B6E]">
              Your order is being processed. Check your email for confirmation.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/account/orders"
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-[#C2692A] hover:bg-[#A85A24] text-white text-[14px] font-medium transition-colors"
          >
            <Package className="w-4 h-4" />
            Track your order
          </Link>
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border border-[#E8DDD4] hover:border-[#C8B9AC] text-[#3D3028] text-[14px] font-medium transition-colors"
          >
            Continue shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}
