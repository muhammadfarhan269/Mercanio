import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

type ReviewStarsProps = {
  rating: number
  size?: 'sm' | 'md'
  showCount?: boolean
  count?: number
}

export function ReviewStars({
  rating,
  size = 'sm',
  showCount,
  count,
}: ReviewStarsProps) {
  const starSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5'

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              starSize,
              star <= rating
                ? 'fill-[#C2692A] text-[#C2692A]'
                : 'fill-[#E8DDD4] text-[#E8DDD4]'
            )}
          />
        ))}
      </div>
      {showCount && count !== undefined && (
        <span className="text-[12px] text-[#8C7B6E]">
          ({count} review{count != 1 ? 's' : ''})
        </span>
      )}
    </div>
  )
}
