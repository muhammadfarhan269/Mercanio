import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Sign in | Mercanio',
  description: 'Sign in to your Mercanio account',
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
