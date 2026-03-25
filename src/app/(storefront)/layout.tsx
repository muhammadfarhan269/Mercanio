import { Navbar } from '@/components/storefront/navbar'
import { Footer } from '@/components/storefront/footer'

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
