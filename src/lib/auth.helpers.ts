import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'

/**
 * Get the current session. Returns null if not authenticated.
 * Use in Server Components and Route Handlers.
 */
export async function getSession() {
  return await auth()
}

/**
 * Get the current user or redirect to login.
 * Use in protected Server Components.
 */
export async function requireAuth() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  return session
}

/**
 * Require VENDOR or ADMIN role.
 */
export async function requireVendor() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.role !== 'VENDOR' && session.user.role !== 'ADMIN') {
    redirect('/')
  }
  return session
}

/**
 * Require ADMIN role.
 */
export async function requireAdmin() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/')
  return session
}

/**
 * Get the vendor record for the current user.
 * Returns null if user has no vendor profile.
 */
export async function getCurrentVendor() {
  const session = await auth()
  if (!session?.user?.id) return null

  return db.vendor.findUnique({
    where: { userId: session.user.id },
  })
}

/**
 * Hash a password using bcrypt (12 rounds).
 */
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs')
  return bcrypt.hash(password, 12)
}

/**
 * Verify a password against a hash.
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const bcrypt = await import('bcryptjs')
  return bcrypt.compare(password, hash)
}
