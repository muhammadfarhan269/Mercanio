import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // @ts-expect-error Stripe SDK types require the latest apiVersion union member.
  apiVersion: '2024-06-20',
  typescript: true,
})
