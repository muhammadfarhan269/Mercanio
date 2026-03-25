import type { Metadata } from 'next'
import Link from 'next/link'
import { Store } from 'lucide-react'
import { getAllVendors } from '@/lib/queries/vendors'

export const metadata: Metadata = {
  title: 'Vendors | Mercanio',
  description: 'Discover independent vendors selling on Mercanio.',
}

export default async function VendorsPage() {
  const vendors = await getAllVendors()

  return (
    <div className="bg-[#F5F0EB] min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-[32px] font-semibold text-[#1A1410] tracking-[-0.8px] mb-2">
            Our vendors
          </h1>
          <p className="text-[14px] text-[#8C7B6E]">
            {vendors.length} independent makers on Mercanio
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {vendors.map((vendor) => (
            <Link
              key={vendor.id}
              href={`/vendors/${vendor.slug}`}
              className="group bg-white rounded-2xl border border-[#E8DDD4] p-6 hover:border-[#C8B9AC] hover:shadow-[0_4px_12px_rgba(26,20,16,0.08)] transition-all duration-200"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-[#F5E6D8] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#C2692A] font-semibold text-[20px]">
                    {vendor.storeName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 className="text-[16px] font-semibold text-[#1A1410] group-hover:text-[#C2692A] transition-colors">
                    {vendor.storeName}
                  </h2>
                  <p className="text-[12px] text-[#8C7B6E]">
                    {vendor._count.products} products
                  </p>
                </div>
              </div>

              {vendor.description && (
                <p className="text-[13px] text-[#3D3028] leading-relaxed line-clamp-3">
                  {vendor.description}
                </p>
              )}

              <div className="flex items-center gap-1.5 mt-4 text-[13px] font-medium text-[#C2692A]">
                <Store className="w-3.5 h-3.5" />
                Visit store
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
