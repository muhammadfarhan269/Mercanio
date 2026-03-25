'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DiscountSchema, type DiscountInput } from '@/lib/validations/discount'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Loader2, X } from 'lucide-react'

export function DiscountForm({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<DiscountInput>({
    resolver: zodResolver(DiscountSchema),
    defaultValues: {
      code: '',
      type: 'PERCENTAGE',
      scope: 'PLATFORM',
      value: 0,
      minOrderAmount: null,
      maxUses: null,
      startsAt: null,
      expiresAt: null,
    },
  })

  async function onSubmit(data: DiscountInput) {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error?.fieldErrors ? 'Please fix the errors above' : (body.error ?? 'Failed to create discount'))
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
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1A1410]">Create Discount</h2>
          <button onClick={onClose} className="text-[#8C7B6E] hover:text-[#1A1410]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input
                      className="rounded-lg border-[#E8DDD4] uppercase"
                      placeholder="SUMMER20"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-lg border-[#E8DDD4]">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-[60] bg-white border border-[#E8DDD4] shadow-lg rounded-lg">
                        <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                        <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                        <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scope</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-lg border-[#E8DDD4]">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-[60] bg-white border border-[#E8DDD4] shadow-lg rounded-lg">
                        <SelectItem value="PLATFORM">Platform</SelectItem>
                        <SelectItem value="VENDOR">Vendor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        className="rounded-lg border-[#E8DDD4]"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minOrderAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Order (cents)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Optional"
                        className="rounded-lg border-[#E8DDD4]"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? null : parseInt(e.target.value, 10) || 0)}
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
                name="maxUses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Uses</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Unlimited"
                        className="rounded-lg border-[#E8DDD4]"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? null : parseInt(e.target.value, 10) || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expires At</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="rounded-lg border-[#E8DDD4]"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
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
