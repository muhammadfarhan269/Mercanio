import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { SessionProvider } from '@/components/session-provider'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Mercanio — The Modern Marketplace',
    template: '%s | Mercanio',
  },
  description:
    'A full-stack multi-vendor marketplace platform. Discover unique products from independent vendors.',
  keywords: ['marketplace', 'multi-vendor', 'ecommerce', 'shop'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mercanio.com',
    siteName: 'Mercanio',
    title: 'Mercanio — The Modern Marketplace',
    description: 'Discover unique products from independent vendors.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-[#F5F0EB] text-[#1A1410] antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
