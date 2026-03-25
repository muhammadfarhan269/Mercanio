'use client'

import { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { CheckoutSchema } from '@/lib/validations/checkout'
import { cn } from '@/lib/utils'

type AddressFormProps = {
  form: UseFormReturn<z.input<typeof CheckoutSchema>>
}

type FieldProps = {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

function Field({ label, error, required, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[13px] font-medium text-[#3D3028]">
        {label}
        {required && <span className="text-[#B54242] ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[12px] text-[#B54242]">{error}</p>}
    </div>
  )
}

const inputClass = (hasError: boolean) =>
  cn(
    'w-full h-10 px-3.5 rounded-lg border bg-white text-[14px] text-[#1A1410]',
    'placeholder:text-[#B4A89C] outline-none transition-colors',
    'focus:border-[#C2692A] focus:ring-2 focus:ring-[#C2692A]/10',
    hasError ? 'border-[#B54242]' : 'border-[#E8DDD4] hover:border-[#C8B9AC]'
  )

export function AddressForm({ form }: AddressFormProps) {
  const {
    register,
    formState: { errors },
  } = form
  const e = errors.address

  return (
    <div className="space-y-4">
      {/* Contact */}
      <div>
        <p className="text-[12px] font-medium text-[#8C7B6E] uppercase tracking-[0.06em] mb-3">
          Contact
        </p>
        <div className="space-y-3">
          <Field label="Email address" error={e?.email?.message} required>
            <input
              {...register('address.email')}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={inputClass(!!e?.email)}
            />
          </Field>
          <Field label="Phone" error={e?.phone?.message}>
            <input
              {...register('address.phone')}
              type="tel"
              autoComplete="tel"
              placeholder="+1 (555) 000-0000"
              className={inputClass(!!e?.phone)}
            />
          </Field>
        </div>
      </div>

      {/* Name */}
      <div>
        <p className="text-[12px] font-medium text-[#8C7B6E] uppercase tracking-[0.06em] mb-3">
          Shipping address
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" error={e?.firstName?.message} required>
            <input
              {...register('address.firstName')}
              type="text"
              autoComplete="given-name"
              placeholder="Jane"
              className={inputClass(!!e?.firstName)}
            />
          </Field>
          <Field label="Last name" error={e?.lastName?.message} required>
            <input
              {...register('address.lastName')}
              type="text"
              autoComplete="family-name"
              placeholder="Smith"
              className={inputClass(!!e?.lastName)}
            />
          </Field>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-3">
        <Field label="Address" error={e?.line1?.message} required>
          <input
            {...register('address.line1')}
            type="text"
            autoComplete="address-line1"
            placeholder="123 Main Street"
            className={inputClass(!!e?.line1)}
          />
        </Field>
        <Field label="Apartment, suite, etc." error={e?.line2?.message}>
          <input
            {...register('address.line2')}
            type="text"
            autoComplete="address-line2"
            placeholder="Apt 4B (optional)"
            className={inputClass(!!e?.line2)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="City" error={e?.city?.message} required>
            <input
              {...register('address.city')}
              type="text"
              autoComplete="address-level2"
              placeholder="New York"
              className={inputClass(!!e?.city)}
            />
          </Field>
          <Field label="State" error={e?.state?.message} required>
            <input
              {...register('address.state')}
              type="text"
              autoComplete="address-level1"
              placeholder="NY"
              className={inputClass(!!e?.state)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Postal code" error={e?.postalCode?.message} required>
            <input
              {...register('address.postalCode')}
              type="text"
              autoComplete="postal-code"
              placeholder="10001"
              className={inputClass(!!e?.postalCode)}
            />
          </Field>
          <Field label="Country" error={e?.country?.message} required>
            <select
              {...register('address.country')}
              className={cn(inputClass(!!e?.country), 'cursor-pointer')}
            >
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="CA">Canada</option>
              <option value="AU">Australia</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
            </select>
          </Field>
        </div>
      </div>

      {/* Order notes */}
      <Field label="Order notes" error={errors.notes?.message}>
        <textarea
          {...register('notes')}
          rows={2}
          placeholder="Special instructions for your order (optional)"
          className={cn(inputClass(!!errors.notes), 'h-auto py-2.5 resize-none')}
        />
      </Field>
    </div>
  )
}
