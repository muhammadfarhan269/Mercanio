import { Ratelimit } from '@upstash/ratelimit'
import { redis } from '@/lib/redis'

// Auth routes: 5 attempts per 15 minutes per IP
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: 'mercanio:auth',
})

// API routes: 60 requests per minute per IP
export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1 m'),
  analytics: true,
  prefix: 'mercanio:api',
})

// Checkout: 10 attempts per hour per IP
export const checkoutRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  analytics: true,
  prefix: 'mercanio:checkout',
})

export function getIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0]?.trim() : 'anonymous'
  return ip ?? 'anonymous'
}
