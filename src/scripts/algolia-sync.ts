import { config as loadEnv } from 'dotenv'
import { resolve } from 'node:path'

loadEnv({ path: resolve(process.cwd(), '.env') })
loadEnv({ path: resolve(process.cwd(), '.env.local'), override: true })

async function main() {
  const { syncAllProductsToAlgolia } = await import('@/lib/algolia.sync')
  const { db } = await import('@/lib/db')

  console.log('🔍 Syncing products to Algolia...')
  await syncAllProductsToAlgolia()
  console.log('✅ Algolia sync complete')
  await db.$disconnect()
}

main().catch((e) => {
  console.error('❌ Sync failed:', e)
  process.exit(1)
})
