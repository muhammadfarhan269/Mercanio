'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'popular', label: 'Most reviewed' },
] as const

export function ProductSort() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get('sort') ?? 'newest'

  const handleSort = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('sort', value)
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="flex items-center gap-2">
      <label className="text-[13px] text-[#8C7B6E] flex-shrink-0">Sort by</label>
      <select
        value={currentSort}
        onChange={(e) => handleSort(e.target.value)}
        className="h-9 pl-3 pr-8 rounded-lg border border-[#E8DDD4] bg-white text-[13px] text-[#1A1410] outline-none focus:border-[#C2692A] cursor-pointer"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
