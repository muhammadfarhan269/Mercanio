/**
 * Format a price from cents/pence to a display string.
 * e.g. 2999 → "$29.99"
 */
export function formatPrice(
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount / 100)
}

/**
 * Format a compact number for stats display.
 * e.g. 1200 → "1.2K", 45000 → "45K"
 */
export function formatCompact(num: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num)
}

/**
 * Calculate discount percentage.
 * e.g. compareAtPrice=5000, price=3999 → 20
 */
export function discountPercent(price: number, compareAtPrice: number): number {
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
}
