/**
 * pg warns when `sslmode` is require/prefer/verify-ca because today they are
 * treated like verify-full; future pg will follow libpq semantics instead.
 * Neon URLs often use `sslmode=require` — normalizing to verify-full keeps
 * current behavior and removes the startup warning.
 */
export function normalizePgConnectionString(connectionString: string): string {
  if (
    /\buselibpqcompat=true\b/i.test(connectionString) ||
    /\bsslmode=verify-full\b/i.test(connectionString)
  ) {
    return connectionString
  }
  return connectionString.replace(
    /\bsslmode=(require|prefer|verify-ca)\b/gi,
    'sslmode=verify-full'
  )
}
