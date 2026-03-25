import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { normalizePgConnectionString } from '@/lib/normalize-pg-connection-string'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set')
  }
  const adapter = new PrismaPg({
    connectionString: normalizePgConnectionString(connectionString),
    // Neon cold starts + TLS can exceed default pg timeouts; avoid ETIMEDOUT on first queries.
    connectionTimeoutMillis: 60_000,
    max: 15,
    idleTimeoutMillis: 30_000,
  })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const db =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
