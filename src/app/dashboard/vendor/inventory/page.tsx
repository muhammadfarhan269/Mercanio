import { requireVendor, getCurrentVendor } from '@/lib/auth.helpers'
import { redirect } from 'next/navigation'
import { getVendorInventory } from '@/lib/queries/vendor-inventory'
import { InventoryTable } from '@/components/vendor/inventory-table'

export default async function VendorInventoryPage() {
  await requireVendor()
  const vendor = await getCurrentVendor()
  if (!vendor) redirect('/')

  const products = await getVendorInventory(vendor.id)

  // Cast attributes for the client component
  const serialized = products.map((p) => ({
    ...p,
    variants: p.variants.map((v) => ({
      ...v,
      attributes: (v.attributes as Record<string, string>) ?? {},
    })),
  }))

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1A1410]">Inventory</h1>
        <p className="mt-1 text-sm text-[#8C7B6E]">
          Manage stock levels for your product variants
        </p>
      </div>
      <InventoryTable products={serialized} />
    </div>
  )
}
