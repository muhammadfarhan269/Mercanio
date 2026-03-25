import { z } from 'zod'

export const VendorSettingsSchema = z.object({
  storeName: z.string().min(2, 'Store name must be at least 2 characters').max(100),
  description: z.string().max(2000).optional(),
  email: z.string().email('Valid email required'),
  phone: z.string().max(30).optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  logo: z.string().url().optional().or(z.literal('')),
  banner: z.string().url().optional().or(z.literal('')),
  returnPolicy: z.string().max(5000).optional(),
  shippingPolicy: z.string().max(5000).optional(),
})

export type VendorSettingsInput = z.infer<typeof VendorSettingsSchema>
