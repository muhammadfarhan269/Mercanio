import { requireAdmin } from '@/lib/auth.helpers'
import { db } from '@/lib/db'
import { StatusBadge } from '@/components/admin/status-badge'
import {
  CreateBannerButton,
  ToggleBannerButton,
  DeleteBannerButton,
  InlineSettingEditor,
} from '@/components/admin/content-actions'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

function fmt(d: Date | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function placementLabel(p: string) {
  const map: Record<string, string> = {
    hero: 'Hero',
    promo_strip: 'Promo Strip',
    category_feature: 'Category Feature',
  }
  return map[p] ?? p
}

export default async function AdminContentPage() {
  await requireAdmin()

  const [banners, settings] = await Promise.all([
    db.banner.findMany({ orderBy: [{ placement: 'asc' }, { sortOrder: 'asc' }] }),
    db.platformSetting.findMany({ orderBy: { key: 'asc' } }),
  ])

  return (
    <div className="p-8 space-y-10">
      {/* Banners */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#1A1410]">Content</h1>
            <p className="mt-1 text-sm text-[#8C7B6E]">Manage banners and platform settings</p>
          </div>
          <CreateBannerButton />
        </div>

        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#8C7B6E]">Banners</h2>
        <div className="rounded-xl border border-[#E8DDD4] bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E8DDD4]">
                <TableHead className="text-[#8C7B6E]">Title</TableHead>
                <TableHead className="text-[#8C7B6E]">Placement</TableHead>
                <TableHead className="text-[#8C7B6E]">Sort</TableHead>
                <TableHead className="text-[#8C7B6E]">Starts</TableHead>
                <TableHead className="text-[#8C7B6E]">Ends</TableHead>
                <TableHead className="text-[#8C7B6E]">Status</TableHead>
                <TableHead className="text-[#8C7B6E]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-[#8C7B6E]">
                    No banners yet. Add one to get started.
                  </TableCell>
                </TableRow>
              )}
              {banners.map((b) => (
                <TableRow key={b.id} className="border-[#E8DDD4]">
                  <TableCell className="font-medium text-[#1A1410]">
                    <div>{b.title}</div>
                    {b.subtitle && <div className="text-xs text-[#8C7B6E]">{b.subtitle}</div>}
                  </TableCell>
                  <TableCell className="text-sm text-[#8C7B6E]">{placementLabel(b.placement)}</TableCell>
                  <TableCell className="text-sm text-[#8C7B6E]">{b.sortOrder}</TableCell>
                  <TableCell className="text-sm text-[#8C7B6E]">{fmt(b.startsAt)}</TableCell>
                  <TableCell className="text-sm text-[#8C7B6E]">{fmt(b.endsAt)}</TableCell>
                  <TableCell>
                    <StatusBadge status={b.isActive ? 'ACTIVE' : 'ARCHIVED'} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ToggleBannerButton id={b.id} isActive={b.isActive} />
                      <DeleteBannerButton id={b.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Platform Settings */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#8C7B6E]">Platform Settings</h2>
        <div className="rounded-xl border border-[#E8DDD4] bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E8DDD4]">
                <TableHead className="text-[#8C7B6E]">Key</TableHead>
                <TableHead className="text-[#8C7B6E]">Description</TableHead>
                <TableHead className="text-[#8C7B6E]">Value</TableHead>
                <TableHead className="text-[#8C7B6E]">Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-[#8C7B6E]">
                    No platform settings found.
                  </TableCell>
                </TableRow>
              )}
              {settings.map((s) => (
                <TableRow key={s.key} className="border-[#E8DDD4]">
                  <TableCell className="font-mono text-sm font-medium text-[#1A1410]">{s.key}</TableCell>
                  <TableCell className="text-sm text-[#8C7B6E]">{s.description ?? '—'}</TableCell>
                  <TableCell>
                    <InlineSettingEditor settingKey={s.key} value={s.value} />
                  </TableCell>
                  <TableCell className="text-sm text-[#8C7B6E]">{fmt(s.updatedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  )
}
