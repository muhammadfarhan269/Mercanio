'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'
import { ProductFormSchema, type ProductFormInput } from '@/lib/validations/product'
import { useUploadThing } from '@/lib/uploadthing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash2, Upload, X, Loader2 } from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface ProductFormProps {
  categories: Category[]
  productId?: string
  defaultValues?: Partial<ProductFormInput>
}

export function ProductForm({ categories, productId, defaultValues }: ProductFormProps) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const form = useForm<ProductFormInput>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: '',
      shortDescription: '',
      description: '',
      categoryId: '',
      status: 'DRAFT',
      isFeatured: false,
      tags: [],
      images: [],
      variants: [
        {
          sku: '',
          price: 0,
          compareAtPrice: null,
          stock: 0,
          lowStockThreshold: 5,
          attributes: {},
          isActive: true,
        },
      ],
      ...defaultValues,
    },
  })

  const { fields: variantFields, append: appendVariant, remove: removeVariant } =
    useFieldArray({ control: form.control, name: 'variants' })

  const images = form.watch('images')

  const { startUpload } = useUploadThing('productImage', {
    onClientUploadComplete: (res) => {
      if (!res) return
      const newImages = res.map((file, i) => ({
        url: file.ufsUrl,
        altText: '',
        isPrimary: images.length === 0 && i === 0,
        sortOrder: images.length + i,
      }))
      form.setValue('images', [...images, ...newImages])
      setUploading(false)
    },
    onUploadError: () => {
      setUploading(false)
    },
  })

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    await startUpload(files)
    e.target.value = ''
  }

  function removeImage(index: number) {
    const updated = images.filter((_, i) => i !== index)
    form.setValue('images', updated)
  }

  async function onSubmit(data: ProductFormInput) {
    setSaving(true)
    try {
      const url = productId
        ? `/api/vendor/products/${productId}`
        : '/api/vendor/products'
      const method = productId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const body = await res.json()
        console.error('Save failed', body)
        return
      }

      router.push('/dashboard/vendor/products')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic info */}
        <div className="rounded-xl border border-[#E8DDD4] bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-[#1A1410]">Basic Information</h2>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Merino Wool Sweater" className="rounded-lg border-[#E8DDD4]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="One-line summary (shown in listings)"
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Full product description"
                      rows={5}
                      className="rounded-lg border-[#E8DDD4]"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-lg border-[#E8DDD4]">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-lg border-[#E8DDD4]">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="rounded-xl border border-[#E8DDD4] bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-[#1A1410]">Images</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-[#E8DDD4]">
                <Image src={img.url} alt={img.altText || ''} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <X className="h-3 w-3" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 rounded bg-[#C2692A] px-1 py-0.5 text-[10px] text-white">
                    Primary
                  </span>
                )}
              </div>
            ))}

            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-[#E8DDD4] text-[#8C7B6E] hover:border-[#C2692A] hover:text-[#C2692A] transition-colors">
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span className="text-xs">Upload</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          </div>
          {form.formState.errors.images && (
            <p className="mt-2 text-sm text-[#B54242]">
              {form.formState.errors.images.message}
            </p>
          )}
        </div>

        {/* Variants */}
        <div className="rounded-xl border border-[#E8DDD4] bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#1A1410]">Variants</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg border-[#E8DDD4] text-[#1A1410]"
              onClick={() =>
                appendVariant({
                  sku: '',
                  price: 0,
                  compareAtPrice: null,
                  stock: 0,
                  lowStockThreshold: 5,
                  attributes: {},
                  isActive: true,
                })
              }
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add Variant
            </Button>
          </div>

          <div className="space-y-4">
            {variantFields.map((field, index) => (
              <div key={field.id} className="rounded-lg border border-[#E8DDD4] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-[#8C7B6E]">
                    Variant {index + 1}
                  </span>
                  {variantFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="text-[#B54242] hover:text-[#B54242]/80"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name={`variants.${index}.sku`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">SKU</FormLabel>
                        <FormControl>
                          <Input className="rounded-lg border-[#E8DDD4] h-9 text-sm" {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`variants.${index}.price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Price (cents)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            className="rounded-lg border-[#E8DDD4] h-9 text-sm"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`variants.${index}.compareAtPrice`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Compare At (cents)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            placeholder="Optional"
                            className="rounded-lg border-[#E8DDD4] h-9 text-sm"
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === '' ? null : parseInt(e.target.value, 10) || 0
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`variants.${index}.stock`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Stock</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            className="rounded-lg border-[#E8DDD4] h-9 text-sm"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`variants.${index}.lowStockThreshold`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Low Stock Alert</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            className="rounded-lg border-[#E8DDD4] h-9 text-sm"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={saving || uploading}
            className="rounded-lg bg-[#C2692A] text-white hover:bg-[#A85A24]"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {productId ? 'Save Changes' : 'Create Product'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-lg border-[#E8DDD4]"
            onClick={() => router.push('/dashboard/vendor/products')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
