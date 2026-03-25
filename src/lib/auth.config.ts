import type { NextAuthConfig } from 'next-auth'

export const authConfig: NextAuthConfig = {
  // Allow localhost and deployment hosts when AUTH_URL doesn't match (e.g. `next start` on :3000).
  // Set AUTH_URL to your canonical URL in production; use AUTH_TRUST_HOST on platforms that need it.
  trustHost: true,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const pathname = nextUrl.pathname

      // Vendor dashboard protection
      if (pathname.startsWith('/dashboard/vendor')) {
        if (!isLoggedIn) return Response.redirect(new URL('/login', nextUrl))
        if (auth?.user?.role !== 'VENDOR' && auth?.user?.role !== 'ADMIN') {
          return Response.redirect(new URL('/', nextUrl))
        }
        return true
      }

      // Admin dashboard protection
      if (pathname.startsWith('/dashboard/admin')) {
        if (!isLoggedIn) return Response.redirect(new URL('/login', nextUrl))
        if (auth?.user?.role !== 'ADMIN') {
          return Response.redirect(new URL('/', nextUrl))
        }
        return true
      }

      // Account/profile pages
      if (pathname.startsWith('/account')) {
        if (!isLoggedIn) return Response.redirect(new URL('/login', nextUrl))
        return true
      }

      // Redirect logged-in users away from auth pages
      if (isLoggedIn && (pathname === '/login' || pathname === '/register')) {
        return Response.redirect(new URL('/', nextUrl))
      }

      return true
    },
    // Session callback lives here so the proxy (middleware) also maps
    // token.role -> session.user.role. Without this the authorized callback
    // above always sees role === undefined and redirects vendors to /.
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      if (token.role) session.user.role = token.role as string
      return session
    },
  },
  providers: [],
}
