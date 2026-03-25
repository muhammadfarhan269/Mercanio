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
    'Discover unique handcrafted products from independent vendors. Mercanio is a modern multi-vendor marketplace built for makers and thoughtful buyers.',
  keywords: ['marketplace', 'handmade', 'independent vendors', 'shop', 'ecommerce'],
  authors: [{ name: 'Mercanio' }],
  creator: 'Mercanio',
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Mercanio',
    title: 'Mercanio — The Modern Marketplace',
    description: 'Discover unique products from independent vendors.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mercanio — The Modern Marketplace',
    description: 'Discover unique products from independent vendors.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body
        suppressHydrationWarning
        className="bg-[#F5F0EB] text-[#1A1410] antialiased"
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
