'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface VendorStatusSelectProps {
  vendorId: string
  currentStatus: string
}

const ACTIONS = [
  { label: 'Approve',  value: 'ACTIVE',     style: 'bg-[#2B6B4A] hover:bg-[#1E5C38] text-white' },
  { label: 'Suspend',  value: 'SUSPENDED',  style: 'bg-amber-600 hover:bg-amber-700 text-white' },
  { label: 'Ban',      value: 'BANNED',     style: 'bg-[#B54242] hover:bg-[#8C3A2A] text-white' },
  { label: 'Reject',   value: 'REJECTED',   style: 'bg-[#8C7B6E] hover:bg-[#6B5D52] text-white' },
]

export function VendorStatusSelect({ vendorId, currentStatus }: VendorStatusSelectProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function handleAction(status: string) {
    if (!confirm(`Set vendor status to ${status}?`)) return
    setLoading(status)
    try {
      await fetch(`/api/admin/vendors/${vendorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ACTIONS.filter((a) => a.value !== currentStatus).map((action) => (
        <Button
          key={action.value}
          size="sm"
          className={`rounded-lg text-xs ${action.style}`}
          disabled={loading !== null}
          onClick={() => handleAction(action.value)}
        >
          {loading === action.value && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
          {action.label}
        </Button>
      ))}
    </div>
  )
}
