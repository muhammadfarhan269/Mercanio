import type {
  User,
  Vendor,
  Product,
  ProductVariant,
  ProductImage,
  Category,
  Order,
  OrderItem,
  Cart,
  CartItem,
  Address,
  Review,
  Discount,
  Payout,
  Notification,
  VendorNotification,
} from '@prisma/client'

// Re-export Prisma types for use throughout the app
export type {
  User,
  Vendor,
  Product,
  ProductVariant,
  ProductImage,
  Category,
  Order,
  OrderItem,
  Cart,
  CartItem,
  Address,
  Review,
  Discount,
  Payout,
  Notification,
  VendorNotification,
}

// Extended types with relations
export type ProductWithRelations = Product & {
  vendor: Vendor
  category: Category
  variants: ProductVariant[]
  images: ProductImage[]
}

export type OrderWithItems = Order & {
  items: (OrderItem & {
    variant: ProductVariant
    vendor: Vendor
  })[]
}

export type CartWithItems = Cart & {
  items: (CartItem & {
    variant: ProductVariant & {
      product: Product & {
        images: ProductImage[]
        vendor: Vendor
      }
    }
  })[]
}

export type VendorWithUser = Vendor & {
  user: User
}

// API response wrapper
export type ApiResponse<T> = {
  data?: T
  error?: string
  message?: string
}

// Pagination
export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
