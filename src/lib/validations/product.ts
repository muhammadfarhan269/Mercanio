import { z } from 'zod'

export const ProductVariantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().int('Price must be in whole cents').min(1, 'Price must be at least $0.01'),
  compareAtPrice: z.number().int().min(0).nullable().optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  lowStockThreshold: z.number().int().min(0),
  attributes: z.record(z.string(), z.string()),
  isActive: z.boolean(),
})

export const ProductFormSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  shortDescription: z.string().max(300).optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED', 'PENDING_REVIEW']),
  isFeatured: z.boolean(),
  tags: z.array(z.string()),
  images: z.array(
    z.object({
      url: z.string().url(),
      altText: z.string().optional(),
      isPrimary: z.boolean(),
      sortOrder: z.number().int(),
    })
  ),
  variants: z
    .array(ProductVariantSchema)
    .min(1, 'At least one variant is required'),
})

export type ProductFormInput = z.infer<typeof ProductFormSchema>
export type ProductVariantInput = z.infer<typeof ProductVariantSchema>
