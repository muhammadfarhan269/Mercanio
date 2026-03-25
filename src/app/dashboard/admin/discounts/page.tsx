import { requireAdmin } from '@/lib/auth.helpers'
import { db } from '@/lib/db'
import { formatPrice } from '@/lib/utils/format'
import { StatusBadge } from '@/components/admin/status-badge'
import { CreateDiscountButton, DeactivateDiscountButton } from '@/components/admin/discount-actions'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

function fmt(d: Date | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatValue(type: string, value: number) {
  if (type === 'PERCENTAGE') return `${value}%`
  if (type === 'FIXED_AMOUNT') return formatPrice(Math.round(value * 100))
  return 'Free shipping'
}

export default async function AdminDiscountsPage() {
  await requireAdmin()

  const discounts = await db.discount.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { usages: true } } },
  })

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1410]">Discounts</h1>
          <p className="mt-1 text-sm text-[#8C7B6E]">{discounts.length} total</p>
        </div>
        <CreateDiscountButton />
      </div>

      <div className="rounded-xl border border-[#E8DDD4] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-[#E8DDD4]">
              <TableHead className="text-[#8C7B6E]">Code</TableHead>
              <TableHead className="text-[#8C7B6E]">Type</TableHead>
              <TableHead className="text-[#8C7B6E]">Value</TableHead>
              <TableHead className="text-[#8C7B6E]">Scope</TableHead>
              <TableHead className="text-[#8C7B6E]">Uses</TableHead>
              <TableHead className="text-[#8C7B6E]">Expires</TableHead>
              <TableHead className="text-[#8C7B6E]">Status</TableHead>
              <TableHead className="text-[#8C7B6E]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discounts.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-[#8C7B6E]">
                  No discounts yet. Create one to get started.
                </TableCell>
              </TableRow>
            )}
            {discounts.map((d) => (
              <TableRow key={d.id} className="border-[#E8DDD4]">
                <TableCell className="font-mono text-sm font-medium text-[#1A1410]">{d.code}</TableCell>
                <TableCell className="text-sm text-[#8C7B6E]">
                  {d.type.charAt(0) + d.type.slice(1).toLowerCase().replace('_', ' ')}
                </TableCell>
                <TableCell className="text-sm text-[#1A1410]">{formatValue(d.type, Number(d.value))}</TableCell>
                <TableCell className="text-sm text-[#8C7B6E]">
                  {d.scope.charAt(0) + d.scope.slice(1).toLowerCase()}
                </TableCell>
                <TableCell className="text-sm text-[#8C7B6E]">
                  {d._count.usages}{d.maxUses ? ` / ${d.maxUses}` : ''}
                </TableCell>
                <TableCell className="text-sm text-[#8C7B6E]">{fmt(d.expiresAt)}</TableCell>
                <TableCell>
                  <StatusBadge status={d.isActive ? 'ACTIVE' : 'ARCHIVED'} />
                </TableCell>
                <TableCell>
                  <DeactivateDiscountButton id={d.id} isActive={d.isActive} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
