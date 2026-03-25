'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { z } from 'zod'
import { ChevronRight, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart.store'
import { CheckoutSchema, type CheckoutInput } from '@/lib/validations/checkout'
import { AddressForm } from './address-form'
import { StripePaymentForm } from './stripe-payment-form'
import { OrderSummaryPanel } from './order-summary-panel'
import { cn } from '@/lib/utils'

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

type Step = 'address' | 'payment'

type Totals = {
  subtotal: number
  shippingTotal: number
  taxTotal: number
  total: number
}

export function CheckoutClient() {
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)

  const [step, setStep] = useState<Step>('address')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [totals, setTotals] = useState<Totals | null>(null)
  const [isCreatingIntent, setIsCreatingIntent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [addressData, setAddressData] = useState<z.input<typeof CheckoutSchema>['address'] | null>(null)

  const form = useForm<z.input<typeof CheckoutSchema>>({
    resolver: zodResolver(CheckoutSchema),
    defaultValues: {
      address: { country: 'US' },
      saveAddress: false,
    },
  })

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items, router])

  const handleAddressSubmit = async (data: z.input<typeof CheckoutSchema>) => {
    setIsCreatingIntent(true)
    setAddressData(data.address)

    try {
      const response = await fetch('/api/checkout/payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            variantId: item.variantId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            vendorId: item.vendorId,
            vendorName: item.vendorName,
            stock: item.stock,
          })),
          email: data.address.email,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        form.setError('root', { message: result.error ?? 'Failed to initialise checkout' })
        setIsCreatingIntent(false)
        return
      }

      // Store full cart data in payment intent via update
      // We update the metadata to include cart + address for webhook
      const updateResponse = await fetch('/api/checkout/update-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: result.paymentIntentId,
          cartItems: items.map((item) => ({
            variantId: item.variantId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            vendorId: item.vendorId,
            vendorName: item.vendorName,
            sku: item.sku,
            variantAttributes: item.variantAttributes,
            imageUrl: item.imageUrl,
          })),
          shippingAddress: data.address,
        }),
      })

      if (!updateResponse.ok) {
        form.setError('root', { message: 'Failed to save order details' })
        setIsCreatingIntent(false)
        return
      }

      setClientSecret(result.clientSecret)
      setPaymentIntentId(result.paymentIntentId)
      setTotals(result.totals)
      setStep('payment')
    } catch {
      form.setError('root', { message: 'Something went wrong. Please try again.' })
    } finally {
      setIsCreatingIntent(false)
    }
  }

  const handlePaymentSuccess = useCallback(
    (intentId: string) => {
      clearCart()
      router.push(`/checkout/success?payment_intent=${intentId}`)
    },
    [clearCart, router]
  )

  const handlePaymentError = useCallback((error: string) => {
    setPaymentError(error)
  }, [])

  if (items.length === 0) {
    return null
  }

  return (
    <div className="bg-[#F5F0EB] min-h-screen">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <Link
            href="/"
            className="text-[#1A1410] font-semibold text-xl tracking-[-0.3px] hover:opacity-70 transition-opacity"
          >
            Mercanio
          </Link>
          <nav className="flex items-center gap-2 text-[13px]">
            <span
              className={cn(
                'font-medium',
                step === 'address' ? 'text-[#C2692A]' : 'text-[#8C7B6E]'
              )}
            >
              Address
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#B4A89C]" />
            <span
              className={cn(
                'font-medium',
                step === 'payment' ? 'text-[#C2692A]' : 'text-[#8C7B6E]'
              )}
            >
              Payment
            </span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Left — Forms */}
          <div className="lg:col-span-3">
            {/* Step 1 — Address */}
            {step === 'address' && (
              <div className="bg-white rounded-2xl border border-[#E8DDD4] p-8">
                <h1 className="text-[20px] font-semibold text-[#1A1410] tracking-[-0.3px] mb-6">
                  Shipping details
                </h1>

                {form.formState.errors.root && (
                  <div className="mb-5 px-4 py-3 bg-[#F5EBEB] border border-[#E8C4C4] rounded-lg">
                    <p className="text-[13px] text-[#8C3A2A]">
                      {form.formState.errors.root.message}
                    </p>
                  </div>
                )}

                <form onSubmit={form.handleSubmit(handleAddressSubmit)}>
                  <AddressForm form={form} />

                  <button
                    type="submit"
                    disabled={isCreatingIntent}
                    className={cn(
                      'w-full h-12 rounded-xl font-medium text-[15px] mt-6',
                      'flex items-center justify-center gap-2.5 transition-all',
                      isCreatingIntent
                        ? 'bg-[#EDE8E2] text-[#B4A89C] cursor-not-allowed'
                        : 'bg-[#C2692A] hover:bg-[#A85A24] text-white'
                    )}
                  >
                    {isCreatingIntent ? (
                      <>
                        <span className="w-4 h-4 border-2 border-[#B4A89C] border-t-transparent rounded-full animate-spin" />
                        Preparing checkout...
                      </>
                    ) : (
                      <>
                        Continue to payment
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Step 2 — Payment */}
            {step === 'payment' && clientSecret && (
              <div className="space-y-4">
                {/* Address summary */}
                {addressData && (
                  <div className="bg-white rounded-2xl border border-[#E8DDD4] p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[12px] font-medium text-[#8C7B6E] uppercase tracking-[0.06em] mb-1">
                          Shipping to
                        </p>
                        <p className="text-[14px] text-[#1A1410]">
                          {addressData.firstName} {addressData.lastName} - {addressData.line1},{' '}
                          {addressData.city}, {addressData.state} {addressData.postalCode}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep('address')}
                        className="text-[13px] text-[#C2692A] hover:text-[#A85A24] font-medium transition-colors flex-shrink-0 ml-4"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                )}

                {/* Payment */}
                <div className="bg-white rounded-2xl border border-[#E8DDD4] p-8">
                  <h2 className="text-[20px] font-semibold text-[#1A1410] tracking-[-0.3px] mb-6">
                    Payment
                  </h2>

                  {paymentError && (
                    <div className="mb-5 px-4 py-3 bg-[#F5EBEB] border border-[#E8C4C4] rounded-lg">
                      <p className="text-[13px] text-[#8C3A2A]">{paymentError}</p>
                    </div>
                  )}

                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: 'stripe',
                        variables: {
                          colorPrimary: '#C2692A',
                          colorBackground: '#FFFFFF',
                          colorText: '#1A1410',
                          colorDanger: '#B54242',
                          fontFamily: 'system-ui, sans-serif',
                          borderRadius: '8px',
                          spacingUnit: '4px',
                        },
                      },
                    }}
                  >
                    <StripePaymentForm
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      isSubmitting={isSubmitting}
                      setIsSubmitting={setIsSubmitting}
                    />
                  </Elements>
                </div>
              </div>
            )}
          </div>

          {/* Right — Order summary */}
          <div className="lg:col-span-2">
            <OrderSummaryPanel items={items} totals={totals} />

            {/* Back to cart */}
            <Link
              href="/cart"
              className="flex items-center gap-1.5 text-[13px] text-[#8C7B6E] hover:text-[#1A1410] transition-colors mt-4"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Back to cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
