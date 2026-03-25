import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-[#1A1410] text-[#8C7B6E] mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="text-white font-semibold text-xl tracking-[-0.3px] mb-3">
              Mercanio
            </p>
            <p className="text-[13px] leading-relaxed text-[#8C7B6E] max-w-[200px]">
              The modern marketplace for independent makers and thoughtful buyers.
            </p>
          </div>

          {/* Shop */}
          <div>
            <p className="text-white text-[13px] font-medium mb-4">Shop</p>
            <ul className="space-y-2.5">
              {[
                { label: 'All products', href: '/products' },
                { label: 'Categories', href: '/categories' },
                { label: 'New arrivals', href: '/products?sort=newest' },
                { label: 'Sale', href: '/products?sale=true' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[13px] hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sell */}
          <div>
            <p className="text-white text-[13px] font-medium mb-4">Sell</p>
            <ul className="space-y-2.5">
              {[
                { label: 'Start selling', href: '/sell' },
                { label: 'Vendor dashboard', href: '/dashboard/vendor' },
                { label: 'Seller guidelines', href: '/sellers/guidelines' },
                { label: 'Fees & commissions', href: '/sellers/fees' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[13px] hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <p className="text-white text-[13px] font-medium mb-4">Help</p>
            <ul className="space-y-2.5">
              {[
                { label: 'Help centre', href: '/help' },
                { label: 'Shipping info', href: '/shipping' },
                { label: 'Returns policy', href: '/returns' },
                { label: 'Contact us', href: '/contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[13px] hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#3D3028] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px]">
            © {new Date().getFullYear()} Mercanio. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-[12px] hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-[12px] hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/cookies" className="text-[12px] hover:text-white transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
