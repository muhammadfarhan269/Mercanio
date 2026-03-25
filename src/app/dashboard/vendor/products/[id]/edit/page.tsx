import { requireVendor, getCurrentVendor } from '@/lib/auth.helpers'
import { redirect, notFound } from 'next/navigation'
import { getVendorProductForEdit, getCategories } from '@/lib/queries/vendor-products'
import { ProductForm } from '@/components/vendor/product-form'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireVendor()
  const vendor = await getCurrentVendor()
  if (!vendor) redirect('/')

  const { id } = await params
  const [product, categories] = await Promise.all([
    getVendorProductForEdit(id, vendor.id),
    getCategories(),
  ])

  if (!product) notFound()

  const defaultValues = {
    name: product.name,
    shortDescription: product.shortDescription ?? '',
    description: product.description ?? '',
    categoryId: product.categoryId,
    status: product.status,
    isFeatured: product.isFeatured,
    tags: product.tags,
    images: product.images.map((img) => ({
      url: img.url,
      altText: img.altText ?? '',
      isPrimary: img.isPrimary,
      sortOrder: img.sortOrder,
    })),
    variants: product.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      price: v.price,
      compareAtPrice: v.compareAtPrice ?? null,
      stock: v.stock,
      lowStockThreshold: v.lowStockThreshold,
      attributes: (v.attributes as Record<string, string>) ?? {},
      isActive: v.isActive,
    })),
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1A1410]">Edit Product</h1>
        <p className="mt-1 text-sm text-[#8C7B6E]">{product.name}</p>
      </div>
      <div className="max-w-3xl">
        <ProductForm categories={categories} productId={product.id} defaultValues={defaultValues} />
      </div>
    </div>
  )
}
