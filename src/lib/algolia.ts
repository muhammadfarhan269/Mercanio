import { algoliasearch } from 'algoliasearch'

if (!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID) {
  throw new Error('NEXT_PUBLIC_ALGOLIA_APP_ID is not set')
}

if (!process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY) {
  throw new Error('NEXT_PUBLIC_ALGOLIA_SEARCH_KEY is not set')
}

// Search client — safe to use on client and server
export const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY
)

// Admin client — server only, never expose to client
export function getAdminClient() {
  if (!process.env.ALGOLIA_ADMIN_KEY) {
    throw new Error('ALGOLIA_ADMIN_KEY is not set')
  }
  return algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
    process.env.ALGOLIA_ADMIN_KEY
  )
}

export const PRODUCTS_INDEX = 'mercanio_products'
