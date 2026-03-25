import { requireVendor, getCurrentVendor } from '@/lib/auth.helpers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getVendorProducts } from '@/lib/queries/vendor-products'
import { formatPrice } from '@/lib/utils/format'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Pencil } from 'lucide-react'
import { ArchiveProductButton } from '@/components/vendor/archive-product-button'

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:         'bg-green-50 text-[#2B6B4A]',
  DRAFT:          'bg-[#F5F0EB] text-[#8C7B6E]',
  ARCHIVED:       'bg-red-50 text-[#B54242]',
  PENDING_REVIEW: 'bg-blue-50 text-blue-700',
}

export default async function VendorProductsPage() {
  await requireVendor()
  const vendor = await getCurrentVendor()
  if (!vendor) redirect('/')

  const products = await getVendorProducts(vendor.id)

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1410]">Products</h1>
          <p className="mt-1 text-sm text-[#8C7B6E]">{products.length} total</p>
        </div>
        <Link href="/dashboard/vendor/products/new">
          <Button className="rounded-lg bg-[#C2692A] text-white hover:bg-[#A85A24]">
            <Plus className="mr-2 h-4 w-4" />
            New Product
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-[#E8DDD4] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-[#E8DDD4]">
              <TableHead className="text-[#8C7B6E]">Product</TableHead>
              <TableHead className="text-[#8C7B6E]">Category</TableHead>
              <TableHead className="text-[#8C7B6E]">Price</TableHead>
              <TableHead className="text-[#8C7B6E]">Stock</TableHead>
              <TableHead className="text-[#8C7B6E]">Status</TableHead>
              <TableHead className="text-[#8C7B6E]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-[#8C7B6E]">
                  No products yet.{' '}
                  <Link href="/dashboard/vendor/products/new" className="text-[#C2692A] underline">
                    Create your first product
                  </Link>
                </TableCell>
              </TableRow>
            )}
            {products.map((product) => {
              const image = product.images[0]
              const variant = product.variants[0]
              const statusStyle = STATUS_STYLES[product.status] ?? STATUS_STYLES.DRAFT
              return (
                <TableRow key={product.id} className="border-[#E8DDD4]">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[#E8DDD4]">
                        {image ? (
                          <Image
                            src={image.url}
                            alt={image.altText ?? product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-[#F5F0EB]" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-[#1A1410] line-clamp-1">
                        {product.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-[#8C7B6E]">
                    {product.category.name}
                  </TableCell>
                  <TableCell className="text-sm text-[#1A1410]">
                    {variant ? formatPrice(variant.price) : '—'}
                  </TableCell>
                  <TableCell className="text-sm text-[#1A1410]">
                    {variant?.stock ?? 0}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle}`}
                    >
                      {product.status.charAt(0) + product.status.slice(1).toLowerCase().replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/vendor/products/${product.id}/edit`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 rounded-lg p-0 text-[#8C7B6E] hover:text-[#1A1410]"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      {product.status !== 'ARCHIVED' && (
                        <ArchiveProductButton productId={product.id} />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
