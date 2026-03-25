export const SITE_NAME = 'Mercanio'
export const SITE_DESCRIPTION = 'The modern multi-vendor marketplace platform'
export const SITE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

// Brand colors as JS constants (for use in Recharts, canvas, etc.)
export const COLORS = {
  sienna:     '#C2692A',
  siennaHover:'#A85A24',
  ink:        '#1A1410',
  inkTertiary:'#8C7B6E',
  parchment:  '#F5F0EB',
  sand:       '#E8DDD4',
  forest:     '#2B6B4A',
  ember:      '#B54242',
} as const

// Recharts-ready palette for charts and analytics
export const CHART_COLORS = [
  '#C2692A', // sienna — primary series
  '#2B6B4A', // forest — secondary series
  '#8C7B6E', // driftwood — tertiary series
  '#B54242', // ember — quaternary series
] as const

// Commission rate default
export const DEFAULT_COMMISSION_RATE = 10 // percent

// Pagination
export const PRODUCTS_PER_PAGE = 24
export const ORDERS_PER_PAGE = 20

// Price formatting
export const DEFAULT_CURRENCY = 'USD'

// Low stock threshold
export const LOW_STOCK_THRESHOLD = 5
