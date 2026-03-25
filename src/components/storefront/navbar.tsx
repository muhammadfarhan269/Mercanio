import Link from 'next/link'
import { Search, User, Menu } from 'lucide-react'
import { auth } from '@/lib/auth'
import { CartCount } from './cart-count'

export async function Navbar() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E8DDD4]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-[#1A1410] font-semibold text-xl tracking-[-0.3px] hover:opacity-70 transition-opacity flex-shrink-0"
          >
            Mercanio
          </Link>

          {/* Nav links — desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/products" className="text-[14px] text-[#3D3028] hover:text-[#C2692A] transition-colors">
              Shop
            </Link>
            <Link href="/vendors" className="text-[14px] text-[#3D3028] hover:text-[#C2692A] transition-colors">
              Vendors
            </Link>
            <Link href="/categories" className="text-[14px] text-[#3D3028] hover:text-[#C2692A] transition-colors">
              Categories
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <Link
              href="/search"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-[#8C7B6E] hover:text-[#1A1410] hover:bg-[#F5F0EB] transition-colors"
              aria-label="Search"
            >
              <Search className="w-4.5 h-4.5" />
            </Link>

            {/* Cart */}
            <CartCount />

            {/* Account */}
            {session?.user ? (
              <Link
                href={
                  session.user.role === 'ADMIN'
                    ? '/dashboard/admin'
                    : session.user.role === 'VENDOR'
                      ? '/dashboard/vendor'
                      : '/account'
                }
                className="w-9 h-9 flex items-center justify-center rounded-lg text-[#8C7B6E] hover:text-[#1A1410] hover:bg-[#F5F0EB] transition-colors"
                aria-label="Account"
              >
                <User className="w-4.5 h-4.5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center h-9 px-4 rounded-lg bg-[#C2692A] hover:bg-[#A85A24] text-white text-[13px] font-medium transition-colors"
              >
                Sign in
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[#8C7B6E] hover:bg-[#F5F0EB] transition-colors"
              aria-label="Menu"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
