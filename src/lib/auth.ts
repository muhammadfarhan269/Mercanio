import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/lib/db'
import { authConfig } from '@/lib/auth.config'

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const user = await db.user.findUnique({
          where: { email: email.toLowerCase() },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            image: true,
            isActive: true,
            deletedAt: true,
          },
        })

        if (!user) return null
        if (!user.password) return null // OAuth-only account
        if (!user.isActive) return null
        if (user.deletedAt) return null

        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) return null

        // Update last login
        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // On initial sign in, attach role and id to token
      if (user) {
        token.id = user.id
        token.role = user.role
      }

      // On session update (e.g. role change)
      if (trigger === 'update' && session?.role) {
        token.role = session.role
      }

      // Always fetch fresh role from DB on token refresh
      // This ensures role changes take effect without re-login
      if (token.id && !user) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, isActive: true, deletedAt: true },
        })
        if (!dbUser || !dbUser.isActive || dbUser.deletedAt) {
          // Invalidate token for deleted/deactivated users
          return {}
        }
        token.role = dbUser.role
      }

      return token
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      if (token.role) session.user.role = token.role as string
      return session
    },
    async signIn({ user, account }) {
      // Block OAuth sign-in for deactivated/deleted accounts
      if (account?.provider !== 'credentials') {
        const existingUser = await db.user.findUnique({
          where: { email: user.email! },
          select: { isActive: true, deletedAt: true },
        })
        if (existingUser && (!existingUser.isActive || existingUser.deletedAt)) {
          return false
        }
      }
      return true
    },
  },
  events: {
    async createUser({ user }) {
      // Send welcome notification when new user is created via OAuth
      if (user.id) {
        await db.notification.create({
          data: {
            userId: user.id,
            type: 'ORDER_PLACED', // reusing closest type — extend enum later
            title: 'Welcome to Mercanio',
            message: 'Your account has been created. Start exploring the marketplace.',
          },
        })
      }
    },
  },
})
