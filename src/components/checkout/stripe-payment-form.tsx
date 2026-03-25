'use client'

import { useState } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Loader2, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

type StripePaymentFormProps = {
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
  isSubmitting: boolean
  setIsSubmitting: (val: boolean) => void
}

export function StripePaymentForm({
  onSuccess,
  onError,
  isSubmitting,
  setIsSubmitting,
}: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isReady, setIsReady] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements || isSubmitting) return

    setIsSubmitting(true)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
      })

      if (error) {
        onError(error.message ?? 'Payment failed. Please try again.')
        setIsSubmitting(false)
        return
      }

      if (paymentIntent?.status === 'succeeded') {
        onSuccess(paymentIntent.id)
      }
    } catch {
      onError('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div
        className={cn(
          'transition-opacity duration-300',
          isReady ? 'opacity-100' : 'opacity-0'
        )}
      >
        <PaymentElement
          onReady={() => setIsReady(true)}
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
          }}
        />
      </div>

      {!isReady && (
        <div className="h-40 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-[#8C7B6E]" />
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || isSubmitting || !isReady}
        className={cn(
          'w-full h-12 rounded-xl font-medium text-[15px] transition-all',
          'flex items-center justify-center gap-2.5',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2692A] focus-visible:ring-offset-2',
          isSubmitting || !isReady
            ? 'bg-[#EDE8E2] text-[#B4A89C] cursor-not-allowed'
            : 'bg-[#C2692A] hover:bg-[#A85A24] text-white active:scale-[0.98]'
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing payment...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            Pay now
          </>
        )}
      </button>

      <p className="text-[11px] text-[#8C7B6E] text-center flex items-center justify-center gap-1.5">
        <Lock className="w-3 h-3" />
        Secured by Stripe. Your payment info is never stored on our servers.
      </p>
    </form>
  )
}
