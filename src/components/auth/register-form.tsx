'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, Check, X } from 'lucide-react'
import { RegisterSchema, type RegisterInput } from '@/lib/validations/auth'
import { cn } from '@/lib/utils'

function PasswordRequirement({
  met,
  label,
}: {
  met: boolean
  label: string
}) {
  return (
    <li className="flex items-center gap-1.5">
      {met ? (
        <Check className="w-3 h-3 text-[#2B6B4A] flex-shrink-0" />
      ) : (
        <X className="w-3 h-3 text-[#B4A89C] flex-shrink-0" />
      )}
      <span
        className={cn(
          'text-[12px]',
          met ? 'text-[#2B6B4A]' : 'text-[#8C7B6E]'
        )}
      >
        {label}
      </span>
    </li>
  )
}

export function RegisterForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
  })

  const password = watch('password', '')
  const passwordRequirements = [
    { met: password.length >= 8, label: 'At least 8 characters' },
    { met: /[A-Z]/.test(password), label: 'One uppercase letter' },
    { met: /[0-9]/.test(password), label: 'One number' },
  ]

  const onSubmit = (data: RegisterInput) => {
    setServerError(null)
    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        const result = await response.json()

        if (!response.ok) {
          setServerError(result.error ?? 'Registration failed. Please try again.')
          return
        }

        // Auto sign-in after registration
        const signInResult = await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false,
        })

        if (signInResult?.error) {
          // Registration succeeded but auto-login failed — send to login
          router.push('/login?registered=true')
          return
        }

        router.push('/')
        router.refresh()
      } catch {
        setServerError('Something went wrong. Please try again.')
      }
    })
  }

  const handleGoogleSignIn = () => {
    startTransition(async () => {
      await signIn('google', { callbackUrl: '/' })
    })
  }

  return (
    <div className="w-full max-w-[420px]">
      <div className="bg-white rounded-2xl border border-[#E8DDD4] p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[22px] font-semibold text-[#1A1410] tracking-[-0.4px] mb-1">
            Create your account
          </h1>
          <p className="text-[14px] text-[#8C7B6E]">
            Join Mercanio and start shopping or selling
          </p>
        </div>

        {/* Server error */}
        {serverError && (
          <div className="mb-5 px-4 py-3 bg-[#F5EBEB] border border-[#E8C4C4] rounded-lg">
            <p className="text-[13px] text-[#8C3A2A]">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="block text-[13px] font-medium text-[#3D3028]"
            >
              Full name
            </label>
            <input
              {...register('name')}
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Jane Smith"
              disabled={isPending}
              className={cn(
                'w-full h-10 px-3.5 rounded-lg border bg-white text-[14px] text-[#1A1410]',
                'placeholder:text-[#B4A89C] outline-none transition-colors',
                'focus:border-[#C2692A] focus:ring-2 focus:ring-[#C2692A]/10',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                errors.name
                  ? 'border-[#B54242]'
                  : 'border-[#E8DDD4] hover:border-[#C8B9AC]'
              )}
            />
            {errors.name && (
              <p className="text-[12px] text-[#B54242]">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-[13px] font-medium text-[#3D3028]"
            >
              Email address
            </label>
            <input
              {...register('email')}
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              disabled={isPending}
              className={cn(
                'w-full h-10 px-3.5 rounded-lg border bg-white text-[14px] text-[#1A1410]',
                'placeholder:text-[#B4A89C] outline-none transition-colors',
                'focus:border-[#C2692A] focus:ring-2 focus:ring-[#C2692A]/10',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                errors.email
                  ? 'border-[#B54242]'
                  : 'border-[#E8DDD4] hover:border-[#C8B9AC]'
              )}
            />
            {errors.email && (
              <p className="text-[12px] text-[#B54242]">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-[13px] font-medium text-[#3D3028]"
            >
              Password
            </label>
            <div className="relative">
              <input
                {...register('password')}
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Create a strong password"
                disabled={isPending}
                className={cn(
                  'w-full h-10 px-3.5 pr-10 rounded-lg border bg-white text-[14px] text-[#1A1410]',
                  'placeholder:text-[#B4A89C] outline-none transition-colors',
                  'focus:border-[#C2692A] focus:ring-2 focus:ring-[#C2692A]/10',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  errors.password
                    ? 'border-[#B54242]'
                    : 'border-[#E8DDD4] hover:border-[#C8B9AC]'
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7B6E] hover:text-[#1A1410] transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Password requirements */}
            {password.length > 0 && (
              <ul className="space-y-1 mt-2">
                {passwordRequirements.map((req) => (
                  <PasswordRequirement
                    key={req.label}
                    met={req.met}
                    label={req.label}
                  />
                ))}
              </ul>
            )}

            {errors.password && (
              <p className="text-[12px] text-[#B54242]">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="confirmPassword"
              className="block text-[13px] font-medium text-[#3D3028]"
            >
              Confirm password
            </label>
            <div className="relative">
              <input
                {...register('confirmPassword')}
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Repeat your password"
                disabled={isPending}
                className={cn(
                  'w-full h-10 px-3.5 pr-10 rounded-lg border bg-white text-[14px] text-[#1A1410]',
                  'placeholder:text-[#B4A89C] outline-none transition-colors',
                  'focus:border-[#C2692A] focus:ring-2 focus:ring-[#C2692A]/10',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  errors.confirmPassword
                    ? 'border-[#B54242]'
                    : 'border-[#E8DDD4] hover:border-[#C8B9AC]'
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7B6E] hover:text-[#1A1410] transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[12px] text-[#B54242]">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className={cn(
              'w-full h-10 rounded-lg bg-[#C2692A] hover:bg-[#A85A24] text-white',
              'text-[14px] font-medium transition-colors mt-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2692A] focus-visible:ring-offset-2'
            )}
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating account...
              </span>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E8DDD4]" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-[12px] text-[#8C7B6E]">
              or continue with
            </span>
          </div>
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isPending}
          className={cn(
            'w-full h-10 rounded-lg border border-[#E8DDD4] bg-white hover:bg-[#F5F0EB]',
            'text-[14px] font-medium text-[#1A1410] transition-colors',
            'flex items-center justify-center gap-2.5',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Terms */}
        <p className="mt-4 text-[11px] text-[#8C7B6E] text-center leading-relaxed">
          By creating an account you agree to our{' '}
          <Link href="/terms" className="text-[#C2692A] hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-[#C2692A] hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>

      {/* Login link */}
      <p className="mt-5 text-center text-[13px] text-[#8C7B6E]">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-[#C2692A] hover:text-[#A85A24] font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
