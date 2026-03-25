'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Store,
  ShoppingCart,
  Users,
  Tag,
  FileText,
  Settings,
  ArrowLeft,
  Shield,
} from 'lucide-react'

const navItems = [
  { label: 'Overview',  href: '/dashboard/admin',           icon: LayoutDashboard },
  { label: 'Vendors',   href: '/dashboard/admin/vendors',   icon: Store },
  { label: 'Orders',    href: '/dashboard/admin/orders',    icon: ShoppingCart },
  { label: 'Users',     href: '/dashboard/admin/users',     icon: Users },
  { label: 'Discounts', href: '/dashboard/admin/discounts', icon: Tag },
  { label: 'Content',   href: '/dashboard/admin/content',   icon: FileText },
  { label: 'Settings',  href: '/dashboard/admin/settings',  icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-64 flex-col border-r border-[#E8DDD4] bg-white">
      {/* Platform identity */}
      <div className="flex items-center gap-3 border-b border-[#E8DDD4] px-6 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1A1410] text-white">
          <Shield className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#1A1410]">Mercanio Admin</p>
          <p className="text-xs text-[#8C7B6E]">Platform control</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive =
              href === '/dashboard/admin'
                ? pathname === '/dashboard/admin'
                : pathname === href || pathname.startsWith(href + '/')

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#1A1410] text-white'
                      : 'text-[#1A1410] hover:bg-[#F5F0EB]'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Back to store */}
      <div className="border-t border-[#E8DDD4] px-3 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#8C7B6E] transition-colors hover:bg-[#F5F0EB] hover:text-[#1A1410]"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Back to store
        </Link>
      </div>
    </aside>
  )
}
