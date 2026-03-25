import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type CartItem = {
  variantId: string
  productId: string
  productName: string
  variantAttributes: Record<string, string>
  sku: string
  price: number
  compareAtPrice: number | null
  imageUrl: string | null
  vendorId: string
  vendorName: string
  quantity: number
  stock: number
}

type CartStore = {
  items: CartItem[]
  isOpen: boolean

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void

  // Computed (as functions — Zustand doesn't support computed properties natively)
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find(
            (item) => item.variantId === newItem.variantId
          )
          if (existing) {
            // Increment quantity, respect stock limit
            return {
              items: state.items.map((item) =>
                item.variantId === newItem.variantId
                  ? {
                      ...item,
                      quantity: Math.min(item.quantity + 1, item.stock),
                    }
                  : item
              ),
            }
          }
          return { items: [...state.items, { ...newItem, quantity: 1 }] }
        })
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        }))
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity < 1) {
          get().removeItem(variantId)
          return
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.variantId === variantId
              ? { ...item, quantity: Math.min(quantity, item.stock) }
              : item
          ),
        }))
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        )
      },
    }),
    {
      name: 'mercanio-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
