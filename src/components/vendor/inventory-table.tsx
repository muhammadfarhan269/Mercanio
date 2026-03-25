'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Check, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils/format'

interface Variant {
  id: string
  sku: string
  stock: number
  lowStockThreshold: number
  price: number
  attributes: Record<string, string>
}

interface Product {
  id: string
  name: string
  status: string
  images: { url: string; altText: string | null }[]
  variants: Variant[]
}

export function InventoryTable({ products }: { products: Product[] }) {
  const router = useRouter()
  // Map variantId → edited stock value
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  async function saveStock(variantId: string) {
    const raw = edits[variantId]
    if (raw === undefined) return
    const stock = parseInt(raw, 10)
    if (isNaN(stock) || stock < 0) return

    setSaving((s) => ({ ...s, [variantId]: true }))
    try {
      await fetch(`/api/vendor/inventory/${variantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock }),
      })
      setSaved((s) => ({ ...s, [variantId]: true }))
      setEdits((e) => { const n = { ...e }; delete n[variantId]; return n })
      router.refresh()
      setTimeout(() => setSaved((s) => ({ ...s, [variantId]: false })), 2000)
    } finally {
      setSaving((s) => ({ ...s, [variantId]: false }))
    }
  }

  const rows: { product: Product; variant: Variant }[] = []
  for (const p of products) {
    for (const v of p.variants) {
      rows.push({ product: p, variant: v })
    }
  }

  const lowStockCount = rows.filter(
    ({ variant: v }) => v.stock <= v.lowStockThreshold && v.stock > 0
  ).length
  const outOfStockCount = rows.filter(({ variant: v }) => v.stock === 0).length

  return (
    <div>
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="mb-6 flex flex-wrap gap-3">
          {outOfStockCount > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-[#B54242]">
              <AlertTriangle className="h-4 w-4" />
              <span>{outOfStockCount} variant{outOfStockCount !== 1 ? 's' : ''} out of stock</span>
            </div>
          )}
          {lowStockCount > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              <span>{lowStockCount} variant{lowStockCount !== 1 ? 's' : ''} running low</span>
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-[#E8DDD4] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-[#E8DDD4]">
              <TableHead className="text-[#8C7B6E]">Product / SKU</TableHead>
              <TableHead className="text-[#8C7B6E]">Attributes</TableHead>
              <TableHead className="text-[#8C7B6E]">Price</TableHead>
              <TableHead className="text-[#8C7B6E]">Stock</TableHead>
              <TableHead className="text-[#8C7B6E]">Alert At</TableHead>
              <TableHead className="text-[#8C7B6E]">Update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-[#8C7B6E]">
                  No products with active variants
                </TableCell>
              </TableRow>
            )}
            {rows.map(({ product, variant }) => {
              const image = product.images[0]
              const isLow = variant.stock > 0 && variant.stock <= variant.lowStockThreshold
              const isOut = variant.stock === 0
              const attrStr = Object.entries(variant.attributes)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ')

              return (
                <TableRow key={variant.id} className="border-[#E8DDD4]">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-[#E8DDD4]">
                        {image ? (
                          <Image src={image.url} alt={image.altText ?? product.name} fill className="object-cover" />
                        ) : (
                          <div className="h-full w-full bg-[#F5F0EB]" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1A1410] line-clamp-1">{product.name}</p>
                        <p className="text-xs text-[#8C7B6E]">{variant.sku}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-[#8C7B6E]">
                    {attrStr || '—'}
                  </TableCell>
                  <TableCell className="text-sm text-[#1A1410]">
                    {formatPrice(variant.price)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-sm font-medium ${
                        isOut
                          ? 'text-[#B54242]'
                          : isLow
                          ? 'text-amber-600'
                          : 'text-[#1A1410]'
                      }`}
                    >
                      {variant.stock}
                      {isOut && ' — Out of stock'}
                      {isLow && ' — Low stock'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-[#8C7B6E]">
                    {variant.lowStockThreshold}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        className="h-8 w-20 rounded-lg border-[#E8DDD4] text-sm"
                        placeholder={String(variant.stock)}
                        value={edits[variant.id] ?? ''}
                        onChange={(e) =>
                          setEdits((prev) => ({ ...prev, [variant.id]: e.target.value }))
                        }
                      />
                      <Button
                        size="sm"
                        className="h-8 rounded-lg bg-[#C2692A] px-3 text-white hover:bg-[#A85A24]"
                        disabled={edits[variant.id] === undefined || saving[variant.id]}
                        onClick={() => saveStock(variant.id)}
                      >
                        {saving[variant.id] ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : saved[variant.id] ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          'Save'
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
