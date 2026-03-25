import { requireAdmin, getSession } from '@/lib/auth.helpers'
import { db } from '@/lib/db'
import { formatPrice } from '@/lib/utils/format'
import { StatusBadge } from '@/components/admin/status-badge'
import { ToggleUserButton } from '@/components/admin/toggle-user-button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

const PAGE_SIZE = 20
const ROLE_FILTERS = ['ALL', 'CUSTOMER', 'VENDOR', 'ADMIN']

function fmt(d: Date | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; role?: string }>
}) {
  await requireAdmin()
  const session = await getSession()
  const { page: pageStr, role } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1', 10))
  const skip = (page - 1) * PAGE_SIZE

  const where = role && role !== 'ALL' ? { role: role as never } : {}

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, role: true,
        isActive: true, createdAt: true, lastLoginAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: PAGE_SIZE,
    }),
    db.user.count({ where }),
  ])

  const pages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1A1410]">Users</h1>
        <p className="mt-1 text-sm text-[#8C7B6E]">{total} total</p>
      </div>

      {/* Role filter */}
      <div className="mb-5 flex flex-wrap gap-2">
        {ROLE_FILTERS.map((r) => {
          const href = r === 'ALL' ? '/dashboard/admin/users' : `?role=${r}`
          const isActive = (r === 'ALL' && !role) || role === r
          return (
            <a
              key={r}
              href={href}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive ? 'bg-[#1A1410] text-white' : 'border border-[#E8DDD4] bg-white text-[#1A1410] hover:bg-[#F5F0EB]'
              }`}
            >
              {r === 'ALL' ? 'All' : r.charAt(0) + r.slice(1).toLowerCase()}
            </a>
          )
        })}
      </div>

      <div className="rounded-xl border border-[#E8DDD4] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-[#E8DDD4]">
              <TableHead className="text-[#8C7B6E]">Name</TableHead>
              <TableHead className="text-[#8C7B6E]">Email</TableHead>
              <TableHead className="text-[#8C7B6E]">Role</TableHead>
              <TableHead className="text-[#8C7B6E]">Joined</TableHead>
              <TableHead className="text-[#8C7B6E]">Last Login</TableHead>
              <TableHead className="text-[#8C7B6E]">Status</TableHead>
              <TableHead className="text-[#8C7B6E]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-[#8C7B6E]">No users found</TableCell>
              </TableRow>
            )}
            {users.map((u) => (
              <TableRow key={u.id} className="border-[#E8DDD4]">
                <TableCell className="text-sm font-medium text-[#1A1410]">{u.name ?? '—'}</TableCell>
                <TableCell className="text-sm text-[#8C7B6E]">{u.email}</TableCell>
                <TableCell><StatusBadge status={u.role} /></TableCell>
                <TableCell className="text-sm text-[#8C7B6E]">{fmt(u.createdAt)}</TableCell>
                <TableCell className="text-sm text-[#8C7B6E]">{fmt(u.lastLoginAt)}</TableCell>
                <TableCell>
                  <StatusBadge status={u.isActive ? 'ACTIVE' : 'SUSPENDED'} />
                </TableCell>
                <TableCell>
                  <ToggleUserButton
                    userId={u.id}
                    isActive={u.isActive}
                    isSelf={u.id === session?.user?.id}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`?page=${p}${role ? `&role=${role}` : ''}`}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                p === page ? 'bg-[#1A1410] text-white' : 'border border-[#E8DDD4] bg-white text-[#1A1410] hover:bg-[#F5F0EB]'
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
