import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sign in',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F5F0EB] flex flex-col">
      {/* Minimal header */}
      <header className="px-6 py-5">
        <Link
          href="/"
          className="text-[#1A1410] font-semibold text-xl tracking-[-0.3px] hover:opacity-70 transition-opacity"
        >
          Mercanio
        </Link>
      </header>

      {/* Centered content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      {/* Minimal footer */}
      <footer className="px-6 py-5 text-center">
        <p className="text-[13px] text-[#8C7B6E]">
          © {new Date().getFullYear()} Mercanio. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
