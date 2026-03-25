'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Archive, Loader2 } from 'lucide-react'

export function ArchiveProductButton({ productId }: { productId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleArchive() {
    if (!confirm('Archive this product? It will be hidden from the store.')) return
    setLoading(true)
    try {
      await fetch(`/api/vendor/products/${productId}`, { method: 'DELETE' })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 rounded-lg p-0 text-[#8C7B6E] hover:text-[#B54242]"
      onClick={handleArchive}
      disabled={loading}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
    </Button>
  )
}
