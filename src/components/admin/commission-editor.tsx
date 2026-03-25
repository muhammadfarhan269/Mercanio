'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Check } from 'lucide-react'

export function CommissionEditor({
  vendorId,
  currentRate,
}: {
  vendorId: string
  currentRate: number
}) {
  const router = useRouter()
  const [value, setValue] = useState(String(currentRate))
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    const rate = parseFloat(value)
    if (isNaN(rate) || rate < 0 || rate > 100) return
    setLoading(true)
    try {
      await fetch(`/api/admin/vendors/${vendorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commissionRate: rate }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min={0}
        max={100}
        step={0.5}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-9 w-24 rounded-lg border-[#E8DDD4] text-sm"
      />
      <span className="text-sm text-[#8C7B6E]">%</span>
      <Button
        size="sm"
        className="rounded-lg bg-[#C2692A] text-white hover:bg-[#A85A24]"
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <Check className="h-3.5 w-3.5" /> : 'Save'}
      </Button>
    </div>
  )
}
