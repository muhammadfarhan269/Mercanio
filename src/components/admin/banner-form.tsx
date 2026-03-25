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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Loader2, X } from 'lucide-react'

const BannerFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  subtitle: z.string().max(300).optional(),
  image: z.string().url('Must be a valid URL'),
  linkUrl: z.string().url().optional().or(z.literal('')),
  linkText: z.string().max(100).optional(),
  placement: z.enum(['hero', 'promo_strip', 'category_feature']),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
})

type BannerFormInput = z.infer<typeof BannerFormSchema>

export function BannerForm({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<BannerFormInput>({
    resolver: zodResolver(BannerFormSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      image: '',
      linkUrl: '',
      linkText: '',
      placement: 'hero',
      sortOrder: 0,
      isActive: true,
      startsAt: '',
      endsAt: '',
    },
  })

  async function onSubmit(data: BannerFormInput) {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/content/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          startsAt: data.startsAt || null,
          endsAt: data.endsAt || null,
        }),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error?.fieldErrors ? 'Please fix the errors above' : (body.error ?? 'Failed to create banner'))
        return
      }
      router.refresh()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1A1410]">Create Banner</h2>
          <button onClick={onClose} className="text-[#8C7B6E] hover:text-[#1A1410]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input className="rounded-lg border-[#E8DDD4]" placeholder="Summer Sale" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtitle</FormLabel>
                  <FormControl>
                    <Input className="rounded-lg border-[#E8DDD4]" placeholder="Optional tagline" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input className="rounded-lg border-[#E8DDD4]" placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="linkUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link URL</FormLabel>
                    <FormControl>
                      <Input className="rounded-lg border-[#E8DDD4]" placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linkText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link Text</FormLabel>
                    <FormControl>
                      <Input className="rounded-lg border-[#E8DDD4]" placeholder="Shop Now" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="placement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placement</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-lg border-[#E8DDD4]">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-[60] bg-white border border-[#E8DDD4] shadow-lg rounded-lg">
                        <SelectItem value="hero">Hero</SelectItem>
                        <SelectItem value="promo_strip">Promo Strip</SelectItem>
                        <SelectItem value="category_feature">Category Feature</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        className="rounded-lg border-[#E8DDD4]"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="startsAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Starts At</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="rounded-lg border-[#E8DDD4]"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value || '')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endsAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ends At</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="rounded-lg border-[#E8DDD4]"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value || '')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {error && <p className="text-sm text-[#B54242]">{error}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" className="rounded-lg border-[#E8DDD4]" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="rounded-lg bg-[#C2692A] text-white hover:bg-[#A85A24]">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
