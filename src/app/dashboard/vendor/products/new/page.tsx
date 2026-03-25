import { requireVendor } from '@/lib/auth.helpers'
import { getCategories } from '@/lib/queries/vendor-products'
import { ProductForm } from '@/components/vendor/product-form'

export default async function NewProductPage() {
  await requireVendor()
  const categories = await getCategories()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1A1410]">New Product</h1>
        <p className="mt-1 text-sm text-[#8C7B6E]">Add a new product to your store</p>
      </div>
      <div className="max-w-3xl">
        <ProductForm categories={categories} />
      </div>
    </div>
  )
}
