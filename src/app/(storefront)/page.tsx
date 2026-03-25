import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Package, Store, ShoppingBag } from 'lucide-react'
import { ProductCard } from '@/components/storefront/product-card'
import { SectionHeader } from '@/components/storefront/section-header'
import {
  getFeaturedProducts,
  getCategories,
  getFeaturedVendors,
  getLatestProducts,
  getHeroBanner,
  getPlatformStats,
} from '@/lib/queries/storefront'
import { formatCompact } from '@/lib/utils/format'

export default async function HomePage() {
  const [
    featuredProducts,
    categories,
    vendors,
    latestProducts,
    heroBanner,
    stats,
  ] = await Promise.all([
    getFeaturedProducts(8),
    getCategories(),
    getFeaturedVendors(4),
    getLatestProducts(8),
    getHeroBanner(),
    getPlatformStats(),
  ])

  return (
    <div className="bg-[#F5F0EB]">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#1A1410] min-h-[520px] flex items-center">
        {heroBanner?.image && (
          <Image
            src={heroBanner.image}
            alt={heroBanner.title}
            fill
            className="object-cover opacity-30"
            priority
          />
        )}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <p className="text-[#C2692A] text-[13px] font-medium uppercase tracking-[0.1em] mb-4">
              Independent makers · Handcrafted goods
            </p>

            {/* Headline */}
            <h1 className="text-white text-[40px] sm:text-[52px] font-semibold leading-[1.1] tracking-[-1.5px] mb-6">
              {heroBanner?.title ?? 'Find something made with care'}
            </h1>

            {/* Subheading */}
            <p className="text-[#8C7B6E] text-[16px] leading-relaxed mb-8 max-w-lg">
              {heroBanner?.subtitle ??
                'Discover unique products from independent vendors. Every purchase supports a real maker.'}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-[#C2692A] hover:bg-[#A85A24] text-white text-[14px] font-medium transition-colors"
              >
                {heroBanner?.linkText ?? 'Shop now'}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/sell"
                className="inline-flex items-center h-11 px-6 rounded-lg border border-[#3D3028] hover:border-[#8C7B6E] text-[#8C7B6E] hover:text-white text-[14px] font-medium transition-colors"
              >
                Start selling
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────── */}
      <section className="bg-white border-b border-[#E8DDD4]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x divide-[#E8DDD4]">
            {[
              { icon: Package, value: formatCompact(stats.productCount), label: 'Products' },
              { icon: Store, value: formatCompact(stats.vendorCount), label: 'Vendors' },
              { icon: ShoppingBag, value: formatCompact(stats.orderCount) + '+', label: 'Orders placed' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 py-5 px-4">
                <Icon className="w-4 h-4 text-[#C2692A] flex-shrink-0" />
                <div className="text-center sm:text-left">
                  <span className="block text-[18px] font-semibold text-[#1A1410] leading-none">
                    {value}
                  </span>
                  <span className="text-[12px] text-[#8C7B6E]">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Categories ──────────────────────────────────────── */}
        <section className="py-16">
          <SectionHeader
            title="Shop by category"
            subtitle="Explore our curated collections"
            href="/categories"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group relative aspect-square overflow-hidden rounded-xl bg-[#E8DDD4]"
              >
                {category.image && (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1410]/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-medium text-[14px] leading-tight">
                    {category.name}
                  </p>
                  <p className="text-white/60 text-[11px] mt-0.5">
                    {category._count.products} items
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Featured products ───────────────────────────────── */}
        {featuredProducts.length > 0 && (
          <section className="pb-16">
            <SectionHeader
              title="Featured products"
              subtitle="Handpicked by our team"
              href="/products?featured=true"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={i < 4}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Promo banner ────────────────────────────────────── */}
        <section className="pb-16">
          <div className="rounded-2xl bg-[#1A1410] px-8 py-12 sm:px-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-[#C2692A] text-[12px] font-medium uppercase tracking-[0.1em] mb-2">
                Limited time
              </p>
              <h2 className="text-white text-[24px] font-semibold tracking-[-0.4px] mb-1">
                20% off sitewide
              </h2>
              <p className="text-[#8C7B6E] text-[14px]">
                Use code <span className="text-white font-mono font-medium">SUMMER20</span> at checkout
              </p>
            </div>
            <Link
              href="/products"
              className="flex-shrink-0 inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-[#C2692A] hover:bg-[#A85A24] text-white text-[14px] font-medium transition-colors"
            >
              Shop the sale
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* ── Featured vendors ────────────────────────────────── */}
        <section className="pb-16">
          <SectionHeader
            title="Meet our vendors"
            subtitle="Independent makers worth knowing"
            href="/vendors"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {vendors.map((vendor) => (
              <Link
                key={vendor.id}
                href={`/vendors/${vendor.slug}`}
                className="group bg-white rounded-xl border border-[#E8DDD4] p-6 hover:border-[#C8B9AC] hover:shadow-[0_4px_12px_rgba(26,20,16,0.08)] transition-all duration-200"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-[#F5E6D8] flex items-center justify-center mb-4">
                  <span className="text-[#C2692A] font-semibold text-[16px]">
                    {vendor.storeName.charAt(0)}
                  </span>
                </div>

                <h3 className="text-[15px] font-semibold text-[#1A1410] mb-1 group-hover:text-[#C2692A] transition-colors">
                  {vendor.storeName}
                </h3>
                <p className="text-[12px] text-[#8C7B6E] line-clamp-2 mb-3 leading-relaxed">
                  {vendor.description}
                </p>
                <p className="text-[11px] text-[#C2692A] font-medium">
                  {vendor._count.products} products
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── New arrivals ─────────────────────────────────────── */}
        {latestProducts.length > 0 && (
          <section className="pb-16">
            <SectionHeader
              title="New arrivals"
              subtitle="Recently added to the marketplace"
              href="/products?sort=newest"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {latestProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* ── Sell CTA ─────────────────────────────────────────── */}
        <section className="pb-24">
          <div className="rounded-2xl border border-[#E8DDD4] bg-white px-8 py-12 sm:px-12 text-center">
            <p className="text-[#C2692A] text-[12px] font-medium uppercase tracking-[0.1em] mb-3">
              For makers
            </p>
            <h2 className="text-[28px] font-semibold text-[#1A1410] tracking-[-0.6px] mb-3">
              Sell on Mercanio
            </h2>
            <p className="text-[14px] text-[#8C7B6E] max-w-md mx-auto mb-8 leading-relaxed">
              Join our community of independent makers. Set up your store in minutes and start selling to thousands of customers.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/sell"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-[#C2692A] hover:bg-[#A85A24] text-white text-[14px] font-medium transition-colors"
              >
                Open your store
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/sellers/fees"
                className="inline-flex items-center h-11 px-6 rounded-lg border border-[#E8DDD4] hover:border-[#C8B9AC] text-[#3D3028] text-[14px] font-medium transition-colors"
              >
                See our fees
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
