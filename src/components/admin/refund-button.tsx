'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function RefundButton({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRefund() {
    if (!confirm('Issue a full refund for this order? This cannot be undone.')) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/refund`, { method: 'POST' })
      if (!res.ok) {
        const body = await res.json()
        setError(body.error ?? 'Refund failed')
        return
      }
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Button
        onClick={handleRefund}
        disabled={loading}
        className="rounded-lg bg-[#B54242] text-white hover:bg-[#8C3A2A]"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Issue Full Refund
      </Button>
      {error && <p className="mt-2 text-sm text-[#B54242]">{error}</p>}
    </div>
  )
}
