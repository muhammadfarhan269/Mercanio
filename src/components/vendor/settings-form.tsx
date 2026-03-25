'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { VendorSettingsSchema, type VendorSettingsInput } from '@/lib/validations/vendor-settings'
import { useUploadThing } from '@/lib/uploadthing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Loader2, Upload, X, Check } from 'lucide-react'

interface SettingsFormProps {
  defaultValues: VendorSettingsInput
}

function ImageUploadField({
  value,
  onChange,
  endpoint,
  label,
  aspectClass,
}: {
  value: string
  onChange: (url: string) => void
  endpoint: 'vendorLogo' | 'vendorBanner'
  label: string
  aspectClass: string
}) {
  const [uploading, setUploading] = useState(false)

  const { startUpload } = useUploadThing(endpoint, {
    onClientUploadComplete: (res) => {
      if (res?.[0]) onChange(res[0].ufsUrl)
      setUploading(false)
    },
    onUploadError: () => setUploading(false),
  })

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    await startUpload(files)
    e.target.value = ''
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-[#1A1410]">{label}</p>
      <div className={`relative overflow-hidden rounded-xl border-2 border-dashed border-[#E8DDD4] bg-[#F5F0EB] ${aspectClass}`}>
        {value ? (
          <>
            <Image src={value} alt={label} fill className="object-cover" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <label className="flex h-full cursor-pointer flex-col items-center justify-center gap-1 text-[#8C7B6E] hover:text-[#C2692A] transition-colors">
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <Upload className="h-6 w-6" />
                <span className="text-xs">Upload {label}</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
              disabled={uploading}
            />
          </label>
        )}
      </div>
    </div>
  )
}

export function SettingsForm({ defaultValues }: SettingsFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const form = useForm<VendorSettingsInput>({
    resolver: zodResolver(VendorSettingsSchema),
    defaultValues,
  })

  async function onSubmit(data: VendorSettingsInput) {
    setSaving(true)
    try {
      await fetch('/api/vendor/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Store identity */}
        <div className="rounded-xl border border-[#E8DDD4] bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-[#1A1410]">Store Identity</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ImageUploadField
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        endpoint="vendorLogo"
                        label="Logo"
                        aspectClass="h-32 w-32"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="banner"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ImageUploadField
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        endpoint="vendorBanner"
                        label="Banner"
                        aspectClass="h-32 w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="storeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Name</FormLabel>
                  <FormControl>
                    <Input className="rounded-lg border-[#E8DDD4]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input type="email" className="rounded-lg border-[#E8DDD4]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      className="rounded-lg border-[#E8DDD4]"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://"
                      className="rounded-lg border-[#E8DDD4]"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        className="rounded-lg border-[#E8DDD4]"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Policies */}
        <div className="rounded-xl border border-[#E8DDD4] bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-[#1A1410]">Policies</h2>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="returnPolicy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Return Policy</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder="Describe your return and refund policy..."
                      className="rounded-lg border-[#E8DDD4]"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shippingPolicy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shipping Policy</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder="Describe your shipping policy..."
                      className="rounded-lg border-[#E8DDD4]"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#C2692A] text-white hover:bg-[#A85A24]"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : saved ? (
              <Check className="mr-2 h-4 w-4" />
            ) : null}
            {saved ? 'Saved!' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
