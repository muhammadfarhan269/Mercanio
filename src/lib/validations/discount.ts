import { z } from 'zod'

export const DiscountSchema = z.object({
  code: z.string().min(2, 'Code must be at least 2 characters').max(50).toUpperCase(),
  description: z.string().max(200).optional(),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING']),
  scope: z.enum(['PLATFORM', 'VENDOR']),
  value: z.number().min(0, 'Value must be positive'),
  minOrderAmount: z.number().int().min(0).optional().nullable(),
  maxUses: z.number().int().min(1).optional().nullable(),
  startsAt: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
})

export type DiscountInput = z.infer<typeof DiscountSchema>
