'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

const STATUSES = [
  { value: 'UNFULFILLED', label: 'Unfulfilled' },
  { value: 'PROCESSING',  label: 'Processing' },
  { value: 'SHIPPED',     label: 'Shipped' },
  { value: 'DELIVERED',   label: 'Delivered' },
  { value: 'CANCELLED',   label: 'Cancelled' },
  { value: 'RETURNED',    label: 'Returned' },
  { value: 'REFUNDED',    label: 'Refunded' },
]

interface FulfillmentSelectProps {
  itemId: string
  currentStatus: string
}

export function FulfillmentSelect({ itemId, currentStatus }: FulfillmentSelectProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleChange(value: string) {
    setLoading(true)
    try {
      await fetch(`/api/vendor/orders/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fulfillmentStatus: value }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#8C7B6E]" />}
      <Select defaultValue={currentStatus} onValueChange={handleChange} disabled={loading}>
        <SelectTrigger className="h-8 w-36 rounded-lg border-[#E8DDD4] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="z-50 rounded-lg border border-[#E8DDD4] bg-white shadow-lg">
          {STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value} className="text-xs">
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
