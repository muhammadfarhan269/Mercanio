'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  BarChart3,
  Settings,
  CreditCard,
  ArrowLeft,
} from 'lucide-react'

const navItems = [
  { label: 'Overview',  href: '/dashboard/vendor',            icon: LayoutDashboard },
  { label: 'Products',  href: '/dashboard/vendor/products',   icon: Package },
  { label: 'Inventory', href: '/dashboard/vendor/inventory',  icon: Boxes },
  { label: 'Orders',    href: '/dashboard/vendor/orders',     icon: ShoppingCart },
  { label: 'Analytics', href: '/dashboard/vendor/analytics',  icon: BarChart3 },
  { label: 'Settings',  href: '/dashboard/vendor/settings',   icon: Settings },
  { label: 'Payouts',   href: '/dashboard/vendor/payouts',    icon: CreditCard },
]

interface VendorSidebarProps {
  storeName: string
}

export function VendorSidebar({ storeName }: VendorSidebarProps) {
  const pathname = usePathname()

  const initial = storeName.charAt(0).toUpperCase()

  return (
    <aside className="flex h-full w-64 flex-col border-r border-[#E8DDD4] bg-white">
      {/* Store identity */}
      <div className="flex items-center gap-3 border-b border-[#E8DDD4] px-6 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C2692A] text-sm font-semibold text-white">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#1A1410]">{storeName}</p>
          <p className="text-xs text-[#8C7B6E]">Vendor Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive =
              href === '/dashboard/vendor'
                ? pathname === '/dashboard/vendor'
                : pathname === href || pathname.startsWith(href + '/')

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#C2692A] text-white'
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
