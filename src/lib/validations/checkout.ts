import { z } from 'zod'

export const AddressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  line1: z.string().min(1, 'Address is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().default('US'),
})

export const CheckoutSchema = z.object({
  address: AddressSchema,
  saveAddress: z.boolean().default(false),
  notes: z.string().optional(),
})

export type AddressInput = z.infer<typeof AddressSchema>
export type CheckoutInput = z.infer<typeof CheckoutSchema>
