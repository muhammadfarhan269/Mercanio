import { config as loadEnv } from 'dotenv'
import { resolve } from 'node:path'
loadEnv({ path: resolve(process.cwd(), '.env') })
loadEnv({ path: resolve(process.cwd(), '.env.local'), override: true })

import {
  PrismaClient,
  UserRole,
  VendorStatus,
  ProductStatus,
  OrderStatus,
  FulfillmentStatus,
  ReviewStatus,
  DiscountType,
  DiscountScope,
  NotificationType,
} from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import slugify from 'slugify'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
})

function slug(text: string) {
  return slugify(text, { lower: true, strict: true })
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

function randomSubset<T>(arr: T[], min: number, max: number): T[] {
  const count = randomInt(min, max)
  return [...arr].sort(() => Math.random() - 0.5).slice(0, count)
}

function daysAgo(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

// ── Price helpers (all prices in cents) ──────────────────────
const PRICES = {
  budget:   () => randomInt(499, 1999),
  mid:      () => randomInt(2000, 7999),
  premium:  () => randomInt(8000, 24999),
  luxury:   () => randomInt(25000, 99999),
}

async function main() {
  console.log('🌱 Starting Mercanio seed...\n')

  // ── 1. PLATFORM SETTINGS ────────────────────────────────────
  console.log('📋 Creating platform settings...')
  await db.platformSetting.createMany({
    data: [
      { key: 'platform_name',        value: 'Mercanio',                       description: 'Platform display name' },
      { key: 'platform_commission',  value: '10',                             description: 'Default commission rate (%)' },
      { key: 'min_payout_amount',    value: '5000',                           description: 'Minimum vendor payout in cents ($50)' },
      { key: 'max_product_images',   value: '8',                              description: 'Max images per product' },
      { key: 'maintenance_mode',     value: 'false',                          description: 'Put platform in maintenance mode' },
      { key: 'featured_vendor_limit',value: '6',                              description: 'Number of featured vendors on homepage' },
      { key: 'reviews_require_approval', value: 'false',                      description: 'Require admin approval for reviews' },
    ],
    skipDuplicates: true,
  })

  // ── 2. CATEGORIES ────────────────────────────────────────────
  console.log('📁 Creating categories...')
  const categoryData = [
    { name: 'Clothing',        image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400' },
    { name: 'Accessories',     image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400' },
    { name: 'Home & Living',   image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400' },
    { name: 'Art & Prints',    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400' },
    { name: 'Jewellery',       image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400' },
    { name: 'Beauty',          image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400' },
    { name: 'Food & Drink',    image: 'https://images.unsplash.com/photo-1505935428862-770b6f24f629?w=400' },
    { name: 'Stationery',      image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400' },
  ]

  const categories = await Promise.all(
    categoryData.map((c) =>
      db.category.upsert({
        where: { slug: slug(c.name) },
        update: {},
        create: { name: c.name, slug: slug(c.name), image: c.image, isActive: true },
      })
    )
  )
  console.log(`   ✓ ${categories.length} categories`)

  // ── 3. ADMIN USER ────────────────────────────────────────────
  console.log('👤 Creating admin user...')
  const adminPassword = await bcrypt.hash('Admin123!', 12)
  await db.user.upsert({
    where: { email: 'admin@mercanio.com' },
    update: {},
    create: {
      name: 'Mercanio Admin',
      email: 'admin@mercanio.com',
      password: adminPassword,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
      isActive: true,
    },
  })
  console.log('   ✓ admin@mercanio.com / Admin123!')

  // ── 4. VENDOR USERS & STORES ─────────────────────────────────
  console.log('🏪 Creating vendors...')
  const vendorPassword = await bcrypt.hash('Vendor123!', 12)

  const vendorData = [
    {
      name: 'Sarah Chen',
      email: 'sarah@threadcraft.com',
      store: 'ThreadCraft Studio',
      description: 'Independent fashion designer creating sustainable, slow-fashion pieces. Each garment is made to order in our London studio using ethically sourced fabrics.',
      categories: ['Clothing', 'Accessories'],
    },
    {
      name: 'James Okafor',
      email: 'james@oakandstone.com',
      store: 'Oak & Stone',
      description: 'Handcrafted homeware and furniture made from reclaimed oak and natural stone. Every piece tells the story of its materials.',
      categories: ['Home & Living', 'Art & Prints'],
    },
    {
      name: 'Priya Sharma',
      email: 'priya@lumenjewels.com',
      store: 'Lumen Jewels',
      description: 'Fine jewellery crafted using traditional goldsmithing techniques. Specialising in custom engagement rings and heirloom pieces.',
      categories: ['Jewellery', 'Accessories'],
    },
    {
      name: 'Marcus Webb',
      email: 'marcus@inkandpage.com',
      store: 'Ink & Page',
      description: 'Premium stationery and art prints for the thoughtful creative. Our products are printed on FSC-certified paper using archival inks.',
      categories: ['Stationery', 'Art & Prints'],
    },
  ]

  const vendors: Array<{ user: Awaited<ReturnType<typeof db.user.create>>, vendor: Awaited<ReturnType<typeof db.vendor.create>> }> = []

  for (const vd of vendorData) {
    const user = await db.user.upsert({
      where: { email: vd.email },
      update: {},
      create: {
        name: vd.name,
        email: vd.email,
        password: vendorPassword,
        role: UserRole.VENDOR,
        emailVerified: new Date(),
        isActive: true,
      },
    })

    const vendor = await db.vendor.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        storeName: vd.store,
        slug: slug(vd.store),
        description: vd.description,
        email: vd.email,
        status: VendorStatus.ACTIVE,
        stripeOnboardingDone: true,
        stripeChargesEnabled: true,
        stripePayoutsEnabled: true,
        commissionRate: 10,
        returnPolicy: '30-day returns on all items. Items must be unused and in original packaging.',
        shippingPolicy: 'Orders dispatched within 2-3 business days. Free shipping on orders over $75.',
      },
    })

    vendors.push({ user, vendor })
  }
  console.log(`   ✓ ${vendors.length} vendors`)

  // ── 5. CUSTOMER USERS ────────────────────────────────────────
  console.log('👥 Creating customers...')
  const customerPassword = await bcrypt.hash('Customer123!', 12)

  const customerData = [
    { name: 'Emma Wilson',    email: 'emma@example.com' },
    { name: 'Liam Johnson',   email: 'liam@example.com' },
    { name: 'Olivia Brown',   email: 'olivia@example.com' },
    { name: 'Noah Davis',     email: 'noah@example.com' },
    { name: 'Ava Martinez',   email: 'ava@example.com' },
    { name: 'Ethan Garcia',   email: 'ethan@example.com' },
    { name: 'Sophia Lee',     email: 'sophia@example.com' },
    { name: 'Mason Anderson', email: 'mason@example.com' },
    { name: 'Isabella Thomas',email: 'isabella@example.com' },
    { name: 'Logan White',    email: 'logan@example.com' },
  ]

  const customers = await Promise.all(
    customerData.map((c) =>
      db.user.upsert({
        where: { email: c.email },
        update: {},
        create: {
          name: c.name,
          email: c.email,
          password: customerPassword,
          role: UserRole.CUSTOMER,
          emailVerified: new Date(),
          isActive: true,
        },
      })
    )
  )
  console.log(`   ✓ ${customers.length} customers`)
  console.log('   ✓ All passwords: Customer123!')

  // ── 6. ADDRESSES ─────────────────────────────────────────────
  console.log('📮 Creating addresses...')
  const addressData = [
    { line1: '42 Maple Street',  city: 'New York',    state: 'NY', postalCode: '10001', country: 'US' },
    { line1: '17 Oak Avenue',    city: 'Los Angeles', state: 'CA', postalCode: '90001', country: 'US' },
    { line1: '8 Pine Road',      city: 'Chicago',     state: 'IL', postalCode: '60601', country: 'US' },
    { line1: '23 Elm Drive',     city: 'Houston',     state: 'TX', postalCode: '77001', country: 'US' },
    { line1: '56 Cedar Lane',    city: 'Phoenix',     state: 'AZ', postalCode: '85001', country: 'US' },
    { line1: '91 Birch Court',   city: 'Philadelphia',state: 'PA', postalCode: '19101', country: 'US' },
    { line1: '34 Walnut Place',  city: 'San Antonio', state: 'TX', postalCode: '78201', country: 'US' },
    { line1: '67 Spruce Way',    city: 'San Diego',   state: 'CA', postalCode: '92101', country: 'US' },
    { line1: '12 Willow Court',  city: 'Dallas',      state: 'TX', postalCode: '75201', country: 'US' },
    { line1: '78 Poplar Street', city: 'San Jose',    state: 'CA', postalCode: '95101', country: 'US' },
  ]

  const addresses = await Promise.all(
    customers.map((customer, i) =>
      db.address.create({
        data: {
          userId: customer.id,
          firstName: customer.name!.split(' ')[0]!,
          lastName: customer.name!.split(' ')[1]!,
          ...addressData[i % addressData.length]!,
          isDefault: true,
          type: 'SHIPPING',
        },
      })
    )
  )
  console.log(`   ✓ ${addresses.length} addresses`)

  // ── 7. PRODUCTS ──────────────────────────────────────────────
  console.log('📦 Creating products...')

  const productDefinitions = [
    // ThreadCraft Studio — Clothing & Accessories
    {
      vendorIndex: 0,
      category: 'Clothing',
      name: 'Merino Wool Turtleneck',
      description: 'A luxuriously soft turtleneck knitted from 100% merino wool. Designed for warmth without bulk, it features a relaxed fit and ribbed cuffs. Available in four seasonal colourways.',
      shortDescription: 'Luxuriously soft 100% merino wool turtleneck',
      tags: ['wool', 'knitwear', 'sustainable', 'winter'],
      priceRange: 'premium',
      variants: [
        { attributes: { Size: 'XS', Color: 'Oatmeal' }, stock: 8 },
        { attributes: { Size: 'S',  Color: 'Oatmeal' }, stock: 12 },
        { attributes: { Size: 'M',  Color: 'Oatmeal' }, stock: 15 },
        { attributes: { Size: 'L',  Color: 'Oatmeal' }, stock: 10 },
        { attributes: { Size: 'S',  Color: 'Forest Green' }, stock: 6 },
        { attributes: { Size: 'M',  Color: 'Forest Green' }, stock: 9 },
        { attributes: { Size: 'L',  Color: 'Forest Green' }, stock: 7 },
        { attributes: { Size: 'M',  Color: 'Charcoal' }, stock: 11 },
        { attributes: { Size: 'L',  Color: 'Charcoal' }, stock: 8 },
      ],
      images: [
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800',
      ],
    },
    {
      vendorIndex: 0,
      category: 'Clothing',
      name: 'Linen Midi Dress',
      description: 'A flowing midi dress in 100% washed linen. The relaxed silhouette and natural fabric make it perfect for warm weather. Features subtle side pockets and an adjustable tie waist.',
      shortDescription: 'Flowing washed linen midi dress with side pockets',
      tags: ['linen', 'summer', 'sustainable', 'dress'],
      priceRange: 'premium',
      variants: [
        { attributes: { Size: 'XS', Color: 'Sand' }, stock: 5 },
        { attributes: { Size: 'S',  Color: 'Sand' }, stock: 8 },
        { attributes: { Size: 'M',  Color: 'Sand' }, stock: 10 },
        { attributes: { Size: 'L',  Color: 'Sand' }, stock: 7 },
        { attributes: { Size: 'S',  Color: 'Terracotta' }, stock: 6 },
        { attributes: { Size: 'M',  Color: 'Terracotta' }, stock: 8 },
        { attributes: { Size: 'L',  Color: 'Terracotta' }, stock: 5 },
      ],
      images: [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800',
      ],
    },
    {
      vendorIndex: 0,
      category: 'Accessories',
      name: 'Hand-Woven Leather Belt',
      description: 'A classic hand-woven belt in full-grain vegetable-tanned leather. The intricate weave pattern is crafted by artisans in our studio. Gets better with age.',
      shortDescription: 'Hand-woven full-grain vegetable-tanned leather belt',
      tags: ['leather', 'handmade', 'accessories', 'belt'],
      priceRange: 'mid',
      variants: [
        { attributes: { Size: 'S (28-30")', Color: 'Tan' },   stock: 10 },
        { attributes: { Size: 'M (32-34")', Color: 'Tan' },   stock: 14 },
        { attributes: { Size: 'L (36-38")', Color: 'Tan' },   stock: 8 },
        { attributes: { Size: 'M (32-34")', Color: 'Brown' }, stock: 12 },
        { attributes: { Size: 'L (36-38")', Color: 'Brown' }, stock: 9 },
      ],
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
      ],
    },
    {
      vendorIndex: 0,
      category: 'Accessories',
      name: 'Wool Felt Bucket Hat',
      description: 'A structured bucket hat in premium wool felt. Water resistant and windproof, it is ideal for outdoor adventures. The inner band is lined with soft cotton for all-day comfort.',
      shortDescription: 'Premium wool felt bucket hat, water resistant',
      tags: ['hat', 'wool', 'outdoor', 'accessories'],
      priceRange: 'mid',
      variants: [
        { attributes: { Size: 'S/M', Color: 'Stone' }, stock: 20 },
        { attributes: { Size: 'L/XL', Color: 'Stone' }, stock: 15 },
        { attributes: { Size: 'S/M', Color: 'Olive' }, stock: 12 },
        { attributes: { Size: 'L/XL', Color: 'Olive' }, stock: 10 },
      ],
      images: [
        'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800',
      ],
    },
    // Oak & Stone — Home & Living, Art & Prints
    {
      vendorIndex: 1,
      category: 'Home & Living',
      name: 'Reclaimed Oak Serving Board',
      description: 'A generous serving board hand-cut from a single piece of reclaimed oak. Each board carries the natural grain and character of its original life. Oiled with food-safe linseed oil and ready to use.',
      shortDescription: 'Hand-cut reclaimed oak serving board, food-safe finish',
      tags: ['oak', 'kitchen', 'handmade', 'reclaimed'],
      priceRange: 'mid',
      variants: [
        { attributes: { Size: 'Small (30cm)' },  stock: 8 },
        { attributes: { Size: 'Medium (40cm)' }, stock: 12 },
        { attributes: { Size: 'Large (50cm)' },  stock: 6 },
      ],
      images: [
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
        'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800',
      ],
    },
    {
      vendorIndex: 1,
      category: 'Home & Living',
      name: 'Concrete & Oak Desk Organiser',
      description: 'A modernist desk organiser combining hand-poured concrete and turned oak. Three compartments keep your essentials in order. No two pieces are identical — the concrete takes on a unique texture each time.',
      shortDescription: 'Hand-poured concrete and turned oak desk organiser',
      tags: ['concrete', 'oak', 'desk', 'office', 'handmade'],
      priceRange: 'mid',
      variants: [
        { attributes: { Finish: 'Natural Concrete' }, stock: 15 },
        { attributes: { Finish: 'Charcoal Concrete' }, stock: 10 },
      ],
      images: [
        'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800',
      ],
    },
    {
      vendorIndex: 1,
      category: 'Art & Prints',
      name: 'Abstract Landscape Print',
      description: 'A large-format abstract landscape inspired by the Scottish Highlands. Printed on 300gsm acid-free cotton rag using archival pigment inks. Comes unframed with a 5cm white border for framing.',
      shortDescription: 'Large-format archival abstract landscape print',
      tags: ['print', 'art', 'abstract', 'landscape', 'wall art'],
      priceRange: 'premium',
      variants: [
        { attributes: { Size: 'A3 (30×42cm)' },   stock: 50 },
        { attributes: { Size: 'A2 (42×59cm)' },   stock: 30 },
        { attributes: { Size: 'A1 (59×84cm)' },   stock: 20 },
        { attributes: { Size: '50×70cm' },          stock: 25 },
      ],
      images: [
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
        'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800',
      ],
    },
    {
      vendorIndex: 1,
      category: 'Home & Living',
      name: 'Stone Soap Dish',
      description: 'A minimalist soap dish carved from a single piece of Welsh slate. The natural drainage grooves keep your soap dry between uses. Feels as good as it looks.',
      shortDescription: 'Carved Welsh slate soap dish with natural drainage',
      tags: ['stone', 'bathroom', 'minimalist', 'slate'],
      priceRange: 'budget',
      variants: [
        { attributes: { Size: 'Standard' }, stock: 40 },
      ],
      images: [
        'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=800',
      ],
    },
    // Lumen Jewels — Jewellery & Accessories
    {
      vendorIndex: 2,
      category: 'Jewellery',
      name: 'Gold Vermeil Signet Ring',
      description: 'A classic signet ring in 18ct gold vermeil over sterling silver. The flat top can be left plain or engraved with a monogram or crest. Available in sizes J through T.',
      shortDescription: '18ct gold vermeil signet ring, engravable',
      tags: ['ring', 'gold', 'signet', 'jewellery', 'gift'],
      priceRange: 'premium',
      variants: [
        { attributes: { Size: 'J', Metal: 'Gold Vermeil' },         stock: 5 },
        { attributes: { Size: 'L', Metal: 'Gold Vermeil' },         stock: 8 },
        { attributes: { Size: 'N', Metal: 'Gold Vermeil' },         stock: 10 },
        { attributes: { Size: 'P', Metal: 'Gold Vermeil' },         stock: 7 },
        { attributes: { Size: 'R', Metal: 'Gold Vermeil' },         stock: 4 },
        { attributes: { Size: 'N', Metal: 'Sterling Silver' },      stock: 12 },
        { attributes: { Size: 'P', Metal: 'Sterling Silver' },      stock: 9 },
      ],
      images: [
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800',
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
      ],
    },
    {
      vendorIndex: 2,
      category: 'Jewellery',
      name: 'Pearl Drop Earrings',
      description: 'Delicate drop earrings featuring Akoya freshwater pearls set in recycled sterling silver. The pearls are hand-selected for their lustre and symmetry. Hypoallergenic posts.',
      shortDescription: 'Freshwater pearl drop earrings in recycled sterling silver',
      tags: ['earrings', 'pearl', 'silver', 'jewellery'],
      priceRange: 'premium',
      variants: [
        { attributes: { Length: 'Short (2cm)' }, stock: 15 },
        { attributes: { Length: 'Long (4cm)' },  stock: 12 },
      ],
      images: [
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800',
      ],
    },
    {
      vendorIndex: 2,
      category: 'Jewellery',
      name: 'Twisted Gold Bangle',
      description: 'A sculptural bangle in 14ct solid gold with a distinctive twisted profile. Substantial enough to wear alone, refined enough to stack. Made to order in our workshop.',
      shortDescription: '14ct solid gold twisted bangle, made to order',
      tags: ['bangle', 'gold', 'bracelet', 'jewellery', 'luxury'],
      priceRange: 'luxury',
      variants: [
        { attributes: { Size: 'Small (16cm)' },  stock: 3 },
        { attributes: { Size: 'Medium (17cm)' }, stock: 5 },
        { attributes: { Size: 'Large (18cm)' },  stock: 3 },
      ],
      images: [
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800',
      ],
    },
    // Ink & Page — Stationery & Art
    {
      vendorIndex: 3,
      category: 'Stationery',
      name: 'Lay-Flat Notebook A5',
      description: 'A beautifully bound A5 notebook with a lay-flat spine and 160 pages of 100gsm ivory Tomoe River paper. The cover is hand-stitched in genuine leather. Perfect for fountain pens.',
      shortDescription: 'Leather-bound lay-flat notebook, Tomoe River paper',
      tags: ['notebook', 'stationery', 'leather', 'writing'],
      priceRange: 'mid',
      variants: [
        { attributes: { Cover: 'Tan Leather',   Ruling: 'Dotted' },  stock: 20 },
        { attributes: { Cover: 'Tan Leather',   Ruling: 'Lined' },   stock: 20 },
        { attributes: { Cover: 'Tan Leather',   Ruling: 'Blank' },   stock: 15 },
        { attributes: { Cover: 'Black Leather', Ruling: 'Dotted' },  stock: 18 },
        { attributes: { Cover: 'Black Leather', Ruling: 'Lined' },   stock: 18 },
        { attributes: { Cover: 'Black Leather', Ruling: 'Blank' },   stock: 12 },
      ],
      images: [
        'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800',
        'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800',
      ],
    },
    {
      vendorIndex: 3,
      category: 'Art & Prints',
      name: 'Typographic City Print',
      description: 'A minimal typographic print celebrating the street names of a great city. Available in London, New York, Paris, and Tokyo editions. Printed on 270gsm uncoated stock.',
      shortDescription: 'Minimal typographic city street map print',
      tags: ['print', 'typography', 'city', 'wall art', 'gift'],
      priceRange: 'budget',
      variants: [
        { attributes: { City: 'London',   Size: 'A3' }, stock: 100 },
        { attributes: { City: 'New York', Size: 'A3' }, stock: 100 },
        { attributes: { City: 'Paris',    Size: 'A3' }, stock: 80 },
        { attributes: { City: 'Tokyo',    Size: 'A3' }, stock: 80 },
        { attributes: { City: 'London',   Size: 'A2' }, stock: 60 },
        { attributes: { City: 'New York', Size: 'A2' }, stock: 60 },
      ],
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      ],
    },
    {
      vendorIndex: 3,
      category: 'Stationery',
      name: 'Wax Seal Stamp Set',
      description: 'A complete wax seal kit containing a solid brass stamp with an interchangeable monogram insert, 3 sticks of artisan sealing wax in muted tones, and a candle for melting. Presented in a linen box.',
      shortDescription: 'Brass wax seal stamp set with artisan wax sticks',
      tags: ['wax seal', 'stationery', 'gift', 'letters'],
      priceRange: 'mid',
      variants: [
        { attributes: { Wax: 'Ivory / Burgundy / Forest' }, stock: 30 },
        { attributes: { Wax: 'Gold / Navy / Charcoal' },    stock: 25 },
      ],
      images: [
        'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800',
      ],
    },
    {
      vendorIndex: 3,
      category: 'Stationery',
      name: 'Fountain Pen Ink Set',
      description: 'A curated set of six fountain pen inks in an exclusive Mercanio colourway, hand-filled in our studio. Each 30ml glass bottle is labelled with the ink name and a sample swatch. Iron-gall based formula.',
      shortDescription: 'Six curated fountain pen inks in glass bottles',
      tags: ['ink', 'fountain pen', 'stationery', 'writing'],
      priceRange: 'mid',
      variants: [
        { attributes: { Set: 'Earth Tones' },  stock: 40 },
        { attributes: { Set: 'Ocean Tones' },  stock: 35 },
        { attributes: { Set: 'Forest Tones' }, stock: 30 },
      ],
      images: [
        'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
      ],
    },
  ]

  const createdProducts: Array<{
    product: Awaited<ReturnType<typeof db.product.create>>,
    variants: Awaited<ReturnType<typeof db.productVariant.create>>[],
  }> = []

  for (const def of productDefinitions) {
    const vendor = vendors[def.vendorIndex]!
    const category = categories.find((c) => c.name === def.category)!
    const priceBase = PRICES[def.priceRange as keyof typeof PRICES]()

    const product = await db.product.create({
      data: {
        vendorId: vendor.vendor.id,
        categoryId: category.id,
        name: def.name,
        slug: slug(def.name) + '-' + Math.random().toString(36).slice(2, 6),
        description: def.description,
        shortDescription: def.shortDescription,
        status: ProductStatus.ACTIVE,
        isFeatured: Math.random() > 0.6,
        tags: def.tags,
        images: {
          create: def.images.map((url, i) => ({
            url,
            isPrimary: i === 0,
            sortOrder: i,
          })),
        },
        attributes: {
          create: [
            ...Object.keys(def.variants[0]!.attributes).map((name) => ({
              name,
              values: [...new Set(def.variants.map((v) => v.attributes[name as keyof typeof v.attributes] as string))],
            })),
          ],
        },
      },
    })

    const variants = await Promise.all(
      def.variants.map((v, i) =>
        db.productVariant.create({
          data: {
            productId: product.id,
            sku: `${slug(def.name).slice(0, 8).toUpperCase()}-${i.toString().padStart(3, '0')}`,
            price: priceBase + randomInt(-200, 500),
            compareAtPrice: Math.random() > 0.6 ? Math.round(priceBase * 1.25) : null,
            stock: v.stock,
            attributes: v.attributes,
            isActive: true,
          },
        })
      )
    )

    createdProducts.push({ product, variants })
  }
  console.log(`   ✓ ${createdProducts.length} products with ${createdProducts.reduce((a, p) => a + p.variants.length, 0)} variants`)

  // ── 8. DISCOUNTS ─────────────────────────────────────────────
  console.log('🏷️  Creating discounts...')
  await db.discount.createMany({
    data: [
      {
        code: 'WELCOME10',
        description: '10% off your first order',
        type: DiscountType.PERCENTAGE,
        scope: DiscountScope.PLATFORM,
        value: 10,
        maxUsesPerUser: 1,
        isActive: true,
        applicableProductIds: [],
        applicableCategoryIds: [],
      },
      {
        code: 'FREESHIP',
        description: 'Free shipping on any order',
        type: DiscountType.FREE_SHIPPING,
        scope: DiscountScope.PLATFORM,
        value: 0,
        maxUses: 500,
        isActive: true,
        applicableProductIds: [],
        applicableCategoryIds: [],
      },
      {
        code: 'SUMMER20',
        description: '20% off sitewide summer sale',
        type: DiscountType.PERCENTAGE,
        scope: DiscountScope.PLATFORM,
        value: 20,
        startsAt: daysAgo(7),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        isActive: true,
        applicableProductIds: [],
        applicableCategoryIds: [],
      },
      {
        vendorId: vendors[3]!.vendor.id,
        code: 'INKPAGE15',
        description: '15% off all stationery',
        type: DiscountType.PERCENTAGE,
        scope: DiscountScope.VENDOR,
        value: 15,
        isActive: true,
        applicableProductIds: [],
        applicableCategoryIds: [],
      },
    ],
    skipDuplicates: true,
  })
  console.log('   ✓ 4 discount codes')

  // ── 9. ORDERS ────────────────────────────────────────────────
  console.log('🛍️  Creating orders...')

  const orderStatuses = [
    OrderStatus.DELIVERED,
    OrderStatus.DELIVERED,
    OrderStatus.DELIVERED,
    OrderStatus.SHIPPED,
    OrderStatus.CONFIRMED,
    OrderStatus.PROCESSING,
    OrderStatus.PENDING,
    OrderStatus.REFUNDED,
  ]

  let orderCount = 0
  const createdOrderItems: Array<Awaited<ReturnType<typeof db.orderItem.create>>> = []

  for (let i = 0; i < 40; i++) {
    const customer = randomFrom(customers)
    const address = addresses.find((a) => a.userId === customer.id)
    if (!address) continue

    const itemCount = randomInt(1, 3)
    const selectedVariants = randomSubset(
      createdProducts.flatMap((p) => p.variants.map((v) => ({ variant: v, product: p.product }))),
      itemCount,
      itemCount
    )

    let subtotal = 0
    const itemsData = selectedVariants.map(({ variant, product }) => {
      const vendor = vendors.find((v) => v.vendor.id === product.vendorId)!
      const quantity = randomInt(1, 2)
      const unitPrice = variant.price
      const itemSubtotal = unitPrice * quantity
      const commissionRate = 10
      const commissionAmount = Math.round(itemSubtotal * (commissionRate / 100))
      const vendorPayout = itemSubtotal - commissionAmount
      subtotal += itemSubtotal

      return {
        variantId: variant.id,
        vendorId: vendor.vendor.id,
        quantity,
        unitPrice,
        subtotal: itemSubtotal,
        total: itemSubtotal,
        vendorPayout,
        commissionAmount,
        commissionRate,
        productSnapshot: {
          name: product.name,
          sku: variant.sku,
          attributes: variant.attributes,
        },
        fulfillmentStatus: FulfillmentStatus.DELIVERED,
        discountAmount: 0,
      }
    })

    const status = randomFrom(orderStatuses)
    const createdDaysAgo = randomInt(1, 90)
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

    const order = await db.order.create({
      data: {
        orderNumber,
        userId: customer.id,
        status,
        subtotal,
        shippingTotal: subtotal > 7500 ? 0 : 599,
        discountTotal: 0,
        taxTotal: Math.round(subtotal * 0.08),
        total: subtotal + (subtotal > 7500 ? 0 : 599) + Math.round(subtotal * 0.08),
        stripePaymentIntentId: `pi_seed_${Math.random().toString(36).slice(2, 18)}`,
        shippingAddressId: address.id,
        shippingSnapshot: {
          firstName: address.firstName,
          lastName: address.lastName,
          line1: address.line1,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        },
        createdAt: daysAgo(createdDaysAgo),
        items: {
          create: itemsData,
        },
      },
      include: { items: true },
    })

    // Status history
    await db.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: OrderStatus.CONFIRMED,
        note: 'Payment confirmed via Stripe',
        createdAt: daysAgo(createdDaysAgo),
      },
    })

    if (status === OrderStatus.SHIPPED || status === OrderStatus.DELIVERED) {
      await db.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: OrderStatus.SHIPPED,
          note: 'Order shipped by vendor',
          createdAt: daysAgo(createdDaysAgo - 2),
        },
      })
    }

    createdOrderItems.push(...order.items)
    orderCount++
  }
  console.log(`   ✓ ${orderCount} orders`)

  // ── 10. REVIEWS ──────────────────────────────────────────────
  console.log('⭐ Creating reviews...')

  const reviewBodies = [
    'Absolutely love this. The quality exceeded my expectations and it arrived beautifully packaged.',
    'Really impressed with the craftsmanship. You can tell a lot of care went into making this.',
    'Great product, very well made. Shipping was fast and the packaging was lovely.',
    'Exactly as described. This is the third time I have ordered from this vendor and they never disappoint.',
    'Beautiful piece. Got it as a gift and the recipient was thrilled.',
    'Good quality but took a little longer to arrive than expected. Still very happy with the product itself.',
    'Stunning. The photos do not do it justice — it looks even better in person.',
    'Very happy with this purchase. The attention to detail is impressive.',
  ]

  let reviewCount = 0
  const usedOrderItems = new Set<string>()

  for (const orderItem of createdOrderItems.slice(0, 25)) {
    if (usedOrderItems.has(orderItem.id)) continue
    if (Math.random() > 0.65) continue

    usedOrderItems.add(orderItem.id)

    const order = await db.order.findFirst({
      where: { items: { some: { id: orderItem.id } } },
      select: { userId: true },
    })
    if (!order?.userId) continue

    const product = await db.productVariant.findUnique({
      where: { id: orderItem.variantId },
      select: { productId: true, product: { select: { vendorId: true } } },
    })
    if (!product) continue

    await db.review.create({
      data: {
        userId: order.userId,
        productId: product.productId,
        vendorId: product.product.vendorId,
        orderItemId: orderItem.id,
        rating: randomFrom([4, 4, 5, 5, 5]),
        title: randomFrom([
          'Excellent quality',
          'Highly recommend',
          'Beautiful piece',
          'Very happy',
          'Great purchase',
          'Worth every penny',
        ]),
        body: randomFrom(reviewBodies),
        status: ReviewStatus.APPROVED,
        images: [],
      },
    })
    reviewCount++
  }
  console.log(`   ✓ ${reviewCount} reviews`)

  // ── 11. BANNERS ──────────────────────────────────────────────
  console.log('🖼️  Creating banners...')
  await db.banner.createMany({
    data: [
      {
        title: 'New Season Arrivals',
        subtitle: 'Discover handcrafted pieces from independent makers',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400',
        linkUrl: '/products',
        linkText: 'Shop now',
        placement: 'hero',
        sortOrder: 0,
        isActive: true,
      },
      {
        title: 'Free shipping over $75',
        subtitle: null,
        image: '',
        linkUrl: '/products',
        linkText: 'Shop the collection',
        placement: 'promo_strip',
        sortOrder: 0,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  })
  console.log('   ✓ 2 banners')

  // ── 12. NOTIFICATIONS ────────────────────────────────────────
  console.log('🔔 Creating notifications...')
  for (const { vendor } of vendors) {
    await db.vendorNotification.create({
      data: {
        vendorId: vendor.id,
        type: NotificationType.VENDOR_APPROVED,
        title: 'Store approved',
        message: 'Your store has been approved and is now live on Mercanio.',
        isRead: true,
      },
    })
    await db.vendorNotification.create({
      data: {
        vendorId: vendor.id,
        type: NotificationType.ORDER_PLACED,
        title: 'New order received',
        message: 'You have received a new order. Log in to your dashboard to fulfil it.',
        isRead: false,
      },
    })
  }
  console.log('   ✓ Vendor notifications created')

  // ── Summary ──────────────────────────────────────────────────
  console.log('\n✅ Seed complete!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Demo credentials:')
  console.log('')
  console.log('  ADMIN')
  console.log('  Email:    admin@mercanio.com')
  console.log('  Password: Admin123!')
  console.log('')
  console.log('  VENDORS (all use password: Vendor123!)')
  console.log('  sarah@threadcraft.com   — ThreadCraft Studio')
  console.log('  james@oakandstone.com   — Oak & Stone')
  console.log('  priya@lumenjewels.com   — Lumen Jewels')
  console.log('  marcus@inkandpage.com   — Ink & Page')
  console.log('')
  console.log('  CUSTOMERS (all use password: Customer123!)')
  console.log('  emma@example.com, liam@example.com,')
  console.log('  olivia@example.com, noah@example.com,')
  console.log('  ava@example.com  ... (10 total)')
  console.log('')
  console.log('  DISCOUNT CODES')
  console.log('  WELCOME10  — 10% off first order')
  console.log('  FREESHIP   — Free shipping')
  console.log('  SUMMER20   — 20% off sitewide')
  console.log('  INKPAGE15  — 15% off Ink & Page')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })