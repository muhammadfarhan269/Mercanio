'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Loader2 } from 'lucide-react'

// --- Profile Form ---

const ProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
})
type ProfileInput = z.infer<typeof ProfileSchema>

export function AdminProfileForm({ currentName }: { currentName: string }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<ProfileInput>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: { name: currentName },
  })

  async function onSubmit(data: ProfileInput) {
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await fetch('/api/admin/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Failed to update profile')
        return
      }
      setSuccess(true)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input className="max-w-sm rounded-lg border-[#E8DDD4]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && <p className="text-sm text-[#B54242]">{error}</p>}
        {success && <p className="text-sm text-[#2B6B4A]">Profile updated.</p>}
        <Button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#C2692A] text-white hover:bg-[#A85A24]"
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </form>
    </Form>
  )
}

// --- Password Form ---

const PasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
type PasswordInput = z.infer<typeof PasswordSchema>

export function AdminPasswordForm() {
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<PasswordInput>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: PasswordInput) {
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await fetch('/api/admin/settings/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Failed to update password')
        return
      }
      setSuccess(true)
      form.reset()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input type="password" className="max-w-sm rounded-lg border-[#E8DDD4]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" className="max-w-sm rounded-lg border-[#E8DDD4]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input type="password" className="max-w-sm rounded-lg border-[#E8DDD4]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && <p className="text-sm text-[#B54242]">{error}</p>}
        {success && <p className="text-sm text-[#2B6B4A]">Password updated successfully.</p>}
        <Button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#C2692A] text-white hover:bg-[#A85A24]"
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Password
        </Button>
      </form>
    </Form>
  )
}
