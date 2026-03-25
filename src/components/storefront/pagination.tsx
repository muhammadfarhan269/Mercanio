'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type PaginationProps = {
  currentPage: number
  totalPages: number
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`${pathname}?${params.toString()}`, { scroll: true })
  }

  // Generate page numbers with ellipsis
  const getPages = () => {
    const pages: (number | 'ellipsis')[] = []
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    pages.push(1)
    if (currentPage > 3) pages.push('ellipsis')
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i)
    }
    if (currentPage < totalPages - 2) pages.push('ellipsis')
    pages.push(totalPages)
    return pages
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-12">
      <button
        type="button"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E8DDD4] text-[#8C7B6E] hover:border-[#C8B9AC] hover:text-[#1A1410] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getPages().map((page, i) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-[13px] text-[#8C7B6E]">
            …
          </span>
        ) : (
          <button
            type="button"
            key={page}
            onClick={() => goToPage(page)}
            className={cn(
              'w-9 h-9 flex items-center justify-center rounded-lg text-[13px] font-medium transition-colors',
              page === currentPage
                ? 'bg-[#C2692A] text-white border border-[#C2692A]'
                : 'border border-[#E8DDD4] text-[#3D3028] hover:border-[#C8B9AC] hover:text-[#1A1410]'
            )}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E8DDD4] text-[#8C7B6E] hover:border-[#C8B9AC] hover:text-[#1A1410] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
