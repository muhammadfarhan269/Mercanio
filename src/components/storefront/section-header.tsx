import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type SectionHeaderProps = {
  title: string
  subtitle?: string
  href?: string
  linkLabel?: string
  className?: string
}

export function SectionHeader({
  title,
  subtitle,
  href,
  linkLabel = 'View all',
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-end justify-between mb-8', className)}>
      <div>
        <h2 className="text-[22px] font-semibold text-[#1A1410] tracking-[-0.4px]">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[14px] text-[#8C7B6E] mt-1">{subtitle}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1.5 text-[13px] font-medium text-[#C2692A] hover:text-[#A85A24] transition-colors group"
        >
          {linkLabel}
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}
