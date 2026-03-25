import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getCategories } from '@/lib/queries/storefront'

export const metadata: Metadata = {
  title: 'Categories | Mercanio',
  description: 'Browse all product categories on Mercanio.',
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="bg-[#F5F0EB] min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-[32px] font-semibold text-[#1A1410] tracking-[-0.8px] mb-2">
            Categories
          </h1>
          <p className="text-[14px] text-[#8C7B6E]">
            Browse our curated collections
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-[#EDE8E2]"
            >
              {category.image && (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1410]/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-white font-semibold text-[16px] leading-tight mb-1">
                  {category.name}
                </p>
                <p className="text-white/60 text-[12px]">
                  {category._count.products} products
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
