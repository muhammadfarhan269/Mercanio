import { requireVendor, getCurrentVendor } from '@/lib/auth.helpers'
import { redirect } from 'next/navigation'
import { SettingsForm } from '@/components/vendor/settings-form'

export default async function VendorSettingsPage() {
  await requireVendor()
  const vendor = await getCurrentVendor()
  if (!vendor) redirect('/')

  const defaultValues = {
    storeName: vendor.storeName,
    description: vendor.description ?? '',
    email: vendor.email,
    phone: vendor.phone ?? '',
    website: vendor.website ?? '',
    logo: vendor.logo ?? '',
    banner: vendor.banner ?? '',
    returnPolicy: vendor.returnPolicy ?? '',
    shippingPolicy: vendor.shippingPolicy ?? '',
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1A1410]">Store Settings</h1>
        <p className="mt-1 text-sm text-[#8C7B6E]">Manage your store profile and policies</p>
      </div>
      <div className="max-w-2xl">
        <SettingsForm defaultValues={defaultValues} />
      </div>
    </div>
  )
}
