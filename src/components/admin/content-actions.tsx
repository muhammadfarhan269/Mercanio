'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BannerForm } from '@/components/admin/banner-form'
import { Loader2, Plus, Pencil, Check, X } from 'lucide-react'

export function CreateBannerButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        className="rounded-lg bg-[#C2692A] text-white hover:bg-[#A85A24]"
        onClick={() => setOpen(true)}
      >
        <Plus className="mr-2 h-4 w-4" /> Add Banner
      </Button>
      {open && <BannerForm onClose={() => setOpen(false)} />}
    </>
  )
}

export function ToggleBannerButton({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    try {
      await fetch(`/api/admin/content/banners/${id}`, { method: 'PATCH' })
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

export function DeleteBannerButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this banner?')) return
    setLoading(true)
    try {
      await fetch(`/api/admin/content/banners/${id}`, { method: 'DELETE' })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="rounded-lg border-[#E8DDD4] text-xs text-[#B54242] hover:bg-red-50"
      onClick={handleDelete}
      disabled={loading}
    >
      {loading && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
      Delete
    </Button>
  )
}

export function InlineSettingEditor({ settingKey, value }: { settingKey: string; value: string }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await fetch(`/api/admin/content/settings/${settingKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: inputValue }),
      })
      router.refresh()
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setInputValue(value)
    setEditing(false)
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#1A1410]">{value}</span>
        <button
          onClick={() => setEditing(true)}
          className="text-[#8C7B6E] hover:text-[#1A1410]"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="h-7 rounded-md border-[#E8DDD4] text-sm"
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="text-[#2B6B4A] hover:text-[#1E5C38]"
      >
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
      </button>
      <button onClick={handleCancel} className="text-[#B54242] hover:text-[#8C3A2A]">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
