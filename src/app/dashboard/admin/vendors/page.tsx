import { requireAdmin } from '@/lib/auth.helpers'
import Link from 'next/link'
import { getAdminVendors } from '@/lib/queries/admin-vendors'
import { formatPrice } from '@/lib/utils/format'
import { StatusBadge } from '@/components/admin/status-badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

const STATUS_FILTERS = ['ALL', 'PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED', 'BANNED']

export default async function AdminVendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  await requireAdmin()
  const { status } = await searchParams
  const vendors = await getAdminVendors(status)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1A1410]">Vendors</h1>
        <p className="mt-1 text-sm text-[#8C7B6E]">{vendors.length} total</p>
      </div>

      {/* Status filter */}
      <div className="mb-5 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <a
            key={s}
            href={s === 'ALL' ? '/dashboard/admin/vendors' : `?status=${s}`}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              (s === 'ALL' && !status) || status === s
                ? 'bg-[#1A1410] text-white'
                : 'border border-[#E8DDD4] bg-white text-[#1A1410] hover:bg-[#F5F0EB]'
            }`}
          >
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </a>
        ))}
      </div>

      <div className="rounded-xl border border-[#E8DDD4] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-[#E8DDD4]">
              <TableHead className="text-[#8C7B6E]">Store</TableHead>
              <TableHead className="text-[#8C7B6E]">Owner</TableHead>
              <TableHead className="text-[#8C7B6E]">Status</TableHead>
              <TableHead className="text-[#8C7B6E]">Products</TableHead>
              <TableHead className="text-[#8C7B6E]">Commission</TableHead>
              <TableHead className="text-[#8C7B6E]">Joined</TableHead>
              <TableHead className="text-[#8C7B6E]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-[#8C7B6E]">No vendors found</TableCell>
              </TableRow>
            )}
            {vendors.map((v) => (
              <TableRow key={v.id} className="border-[#E8DDD4]">
                <TableCell className="font-medium text-[#1A1410]">{v.storeName}</TableCell>
                <TableCell className="text-sm text-[#8C7B6E]">{v.user.email}</TableCell>
                <TableCell><StatusBadge status={v.status} /></TableCell>
                <TableCell className="text-sm text-[#8C7B6E]">{v._count.products}</TableCell>
                <TableCell className="text-sm text-[#8C7B6E]">{Number(v.commissionRate)}%</TableCell>
                <TableCell className="text-sm text-[#8C7B6E]">
                  {new Date(v.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/dashboard/admin/vendors/${v.id}`}
                    className="rounded-lg border border-[#E8DDD4] px-3 py-1.5 text-xs font-medium text-[#1A1410] hover:bg-[#F5F0EB] transition-colors"
                  >
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
