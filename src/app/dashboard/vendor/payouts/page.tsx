import { requireVendor, getCurrentVendor } from '@/lib/auth.helpers'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { formatPrice } from '@/lib/utils/format'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatCard } from '@/components/vendor/stat-card'
import { DollarSign, Clock, CheckCircle } from 'lucide-react'

const STATUS_STYLES: Record<string, string> = {
  PENDING:    'bg-[#F5F0EB] text-[#8C7B6E]',
  PROCESSING: 'bg-blue-50 text-blue-700',
  PAID:       'bg-green-50 text-[#2B6B4A]',
  FAILED:     'bg-red-50 text-[#B54242]',
  ON_HOLD:    'bg-amber-50 text-amber-700',
}

function labelStatus(s: string) {
  return s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' ')
}

export default async function VendorPayoutsPage() {
  await requireVendor()
  const vendor = await getCurrentVendor()
  if (!vendor) redirect('/')

  const payouts = await db.payout.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: 'desc' },
  })

  const totalPaid = payouts
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0)

  const pendingAmount = payouts
    .filter((p) => p.status === 'PENDING' || p.status === 'PROCESSING')
    .reduce((sum, p) => sum + p.amount, 0)

  const paidCount = payouts.filter((p) => p.status === 'PAID').length

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1A1410]">Payouts</h1>
        <p className="mt-1 text-sm text-[#8C7B6E]">Your payout history</p>
      </div>

      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Paid Out"
          value={formatPrice(totalPaid)}
          subtext={`${paidCount} completed payout${paidCount !== 1 ? 's' : ''}`}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="Pending / Processing"
          value={formatPrice(pendingAmount)}
          subtext="Awaiting transfer"
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          label="Total Payouts"
          value={payouts.length.toString()}
          icon={<CheckCircle className="h-5 w-5" />}
        />
      </div>

      {/* Payout table */}
      <div className="rounded-xl border border-[#E8DDD4] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-[#E8DDD4]">
              <TableHead className="text-[#8C7B6E]">Period</TableHead>
              <TableHead className="text-[#8C7B6E]">Amount</TableHead>
              <TableHead className="text-[#8C7B6E]">Orders</TableHead>
              <TableHead className="text-[#8C7B6E]">Status</TableHead>
              <TableHead className="text-[#8C7B6E]">Paid At</TableHead>
              <TableHead className="text-[#8C7B6E]">Transfer ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-[#8C7B6E]">
                  No payouts yet. Payouts are issued by Mercanio once orders are fulfilled.
                </TableCell>
              </TableRow>
            )}
            {payouts.map((payout) => {
              const statusStyle = STATUS_STYLES[payout.status] ?? STATUS_STYLES.PENDING
              const periodStart = new Date(payout.periodStart).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })
              const periodEnd = new Date(payout.periodEnd).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })

              return (
                <TableRow key={payout.id} className="border-[#E8DDD4]">
                  <TableCell className="text-sm text-[#1A1410]">
                    {periodStart} – {periodEnd}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-[#1A1410]">
                    {formatPrice(payout.amount)}
                  </TableCell>
                  <TableCell className="text-sm text-[#8C7B6E]">
                    {payout.ordersCount}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle}`}
                    >
                      {labelStatus(payout.status)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-[#8C7B6E]">
                    {payout.paidAt
                      ? new Date(payout.paidAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[#8C7B6E]">
                    {payout.stripeTransferId ?? '—'}
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
