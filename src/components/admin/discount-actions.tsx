'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DiscountForm } from '@/components/admin/discount-form'
import { Loader2, Plus } from 'lucide-react'

export function CreateDiscountButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        className="rounded-lg bg-[#C2692A] text-white hover:bg-[#A85A24]"
        onClick={() => setOpen(true)}
      >
        <Plus className="mr-2 h-4 w-4" /> Create Discount
      </Button>
      {open && <DiscountForm onClose={() => setOpen(false)} />}
    </>
  )
}

export function DeactivateDiscountButton({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    try {
      await fetch(`/api/admin/discounts/${id}`, { method: 'PATCH' })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className={`rounded-lg text-xs ${
        isActive
          ? 'border-[#E8DDD4] text-[#B54242] hover:bg-red-50'
          : 'border-[#E8DDD4] text-[#2B6B4A] hover:bg-green-50'
      }`}
      onClick={handleToggle}
      disabled={loading}
    >
      {loading && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
      {isActive ? 'Deactivate' : 'Activate'}
    </Button>
  )
}
