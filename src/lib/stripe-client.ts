import { loadStripe, type Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null> | null = null

/**
 * Single loadStripe instance for the browser. Avoids Elements seeing a new
 * `stripe` Promise identity after Fast Refresh / remounts.
 */
export function getStripe(): Promise<Stripe | null> {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()
  if (!key) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
  }
  if (key === 'pk_test_...' || key === 'pk_live_...') {
    throw new Error(
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is still a placeholder. Paste your full publishable key from the Stripe Dashboard into .env.local and restart the dev server.'
    )
  }
  if (!stripePromise) {
    stripePromise = loadStripe(key)
  }
  return stripePromise
}
