'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type Category = { id: string; name: string; slug: string; _count: { products: number } }
type Vendor = { id: string; storeName: string; slug: string; _count: { products: number } }

type ProductFiltersProps = {
  categories: Category[]
  vendors: Vendor[]
  totalProducts: number
}

export function ProductFilters({ categories, vendors, totalProducts }: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key)
        } else {
          params.set(key, value)
          if (key !== 'page') params.delete('page')
        }
      })
      return params.toString()
    },
    [searchParams]
  )

  const updateFilter = (key: string, value: string | null) => {
    router.push(`${pathname}?${createQueryString({ [key]: value })}`, {
      scroll: false,
    })
  }

  const currentCategory = searchParams.get('category')
  const currentVendor = searchParams.get('vendor')
  const currentInStock = searchParams.get('inStock')
  const currentSale = searchParams.get('sale')

  const hasActiveFilters = currentCategory || currentVendor || currentInStock || currentSale

  const clearAll = () => {
    router.push(pathname, { scroll: false })
  }

  return (
    <aside className="w-full lg:w-56 flex-shrink-0">
      {/* Filter header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[13px] font-medium text-[#1A1410] uppercase tracking-[0.06em]">
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1 text-[12px] text-[#C2692A] hover:text-[#A85A24] transition-colors"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-[12px] text-[#8C7B6E] mb-6">
        {totalProducts} product{totalProducts !== 1 ? 's' : ''}
      </p>

      {/* Category filter */}
      <div className="mb-8">
        <p className="text-[12px] font-medium text-[#3D3028] uppercase tracking-[0.06em] mb-3">
          Category
        </p>
        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onClick={() => updateFilter('category', null)}
              className={cn(
                'w-full text-left text-[13px] py-1.5 px-2 rounded-lg transition-colors',
                !currentCategory
                  ? 'bg-[#F5E6D8] text-[#9A5220] font-medium'
                  : 'text-[#3D3028] hover:bg-[#F5F0EB]'
              )}
            >
              All categories
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() =>
                  updateFilter('category', currentCategory === cat.slug ? null : cat.slug)
                }
                className={cn(
                  'w-full text-left text-[13px] py-1.5 px-2 rounded-lg transition-colors flex items-center justify-between',
                  currentCategory === cat.slug
                    ? 'bg-[#F5E6D8] text-[#9A5220] font-medium'
                    : 'text-[#3D3028] hover:bg-[#F5F0EB]'
                )}
              >
                <span>{cat.name}</span>
                <span className="text-[11px] text-[#8C7B6E]">{cat._count.products}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Vendor filter */}
      <div className="mb-8">
        <p className="text-[12px] font-medium text-[#3D3028] uppercase tracking-[0.06em] mb-3">
          Vendor
        </p>
        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onClick={() => updateFilter('vendor', null)}
              className={cn(
                'w-full text-left text-[13px] py-1.5 px-2 rounded-lg transition-colors',
                !currentVendor
                  ? 'bg-[#F5E6D8] text-[#9A5220] font-medium'
                  : 'text-[#3D3028] hover:bg-[#F5F0EB]'
              )}
            >
              All vendors
            </button>
          </li>
          {vendors.map((vendor) => (
            <li key={vendor.id}>
              <button
                type="button"
                onClick={() =>
                  updateFilter('vendor', currentVendor === vendor.slug ? null : vendor.slug)
                }
                className={cn(
                  'w-full text-left text-[13px] py-1.5 px-2 rounded-lg transition-colors flex items-center justify-between',
                  currentVendor === vendor.slug
                    ? 'bg-[#F5E6D8] text-[#9A5220] font-medium'
                    : 'text-[#3D3028] hover:bg-[#F5F0EB]'
                )}
              >
                <span className="truncate">{vendor.storeName}</span>
                <span className="text-[11px] text-[#8C7B6E] flex-shrink-0 ml-2">
                  {vendor._count.products}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Quick filters */}
      <div className="mb-8">
        <p className="text-[12px] font-medium text-[#3D3028] uppercase tracking-[0.06em] mb-3">
          Quick filters
        </p>
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={currentInStock === 'true'}
              onChange={(e) =>
                updateFilter('inStock', e.target.checked ? 'true' : null)
              }
              className="w-4 h-4 rounded border-[#E8DDD4] accent-[#C2692A]"
            />
            <span className="text-[13px] text-[#3D3028] group-hover:text-[#1A1410] transition-colors">
              In stock only
            </span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={currentSale === 'true'}
              onChange={(e) =>
                updateFilter('sale', e.target.checked ? 'true' : null)
              }
              className="w-4 h-4 rounded border-[#E8DDD4] accent-[#C2692A]"
            />
            <span className="text-[13px] text-[#3D3028] group-hover:text-[#1A1410] transition-colors">
              On sale
            </span>
          </label>
        </div>
      </div>
    </aside>
  )
}
