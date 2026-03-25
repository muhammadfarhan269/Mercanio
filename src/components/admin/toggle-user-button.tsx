'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface ToggleUserButtonProps {
  userId: string
  isActive: boolean
  isSelf: boolean
}

export function ToggleUserButton({ userId, isActive, isSelf }: ToggleUserButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    const action = isActive ? 'Deactivate' : 'Reactivate'
    if (!confirm(`${action} this user?`)) return
    setLoading(true)
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  if (isSelf) return <span className="text-xs text-[#8C7B6E]">You</span>

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
      {isActive ? 'Deactivate' : 'Reactivate'}
    </Button>
  )
}
