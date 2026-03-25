'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type ProductImage = {
  id: string
  url: string
  altText: string | null
}

export function ProductImageGallery({ images }: { images: ProductImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-[#EDE8E2] rounded-2xl flex items-center justify-center">
        <span className="text-[#B4A89C] text-sm">No image available</span>
      </div>
    )
  }

  const activeImage = images[activeIndex]!

  const prev = () => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1))
  const next = () => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1))

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#EDE8E2] group">
        <Image
          src={activeImage.url}
          alt={activeImage.altText ?? 'Product image'}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-opacity duration-300"
          priority
        />

        {/* Navigation arrows — only show if multiple images */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4 text-[#1A1410]" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4 text-[#1A1410]" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-all',
                    i === activeIndex
                      ? 'bg-white w-4'
                      : 'bg-white/60 hover:bg-white/80'
                  )}
                  aria-label={`View image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={cn(
                'relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors',
                i === activeIndex
                  ? 'border-[#C2692A]'
                  : 'border-transparent hover:border-[#E8DDD4]'
              )}
            >
              <Image
                src={image.url}
                alt={image.altText ?? `Thumbnail ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
