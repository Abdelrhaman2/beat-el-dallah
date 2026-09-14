import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem, Coupon } from "@/types";

interface CartState {
  items: CartItem[];
  appliedCoupon: Coupon | null;
  isCartDrawerOpen: boolean;

  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  setCartDrawerOpen: (isOpen: boolean) => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;

  // Computations
  getItemsCount: () => number;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getDepositAmount: (depositPercent?: number) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,
      isCartDrawerOpen: false,

      addItem: (newItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex((item) => item.id === newItem.id);
          if (existingIndex > -1) {
            const updated = [...state.items];
            updated[existingIndex].quantity += newItem.quantity;
            return { items: updated, isCartDrawerOpen: true };
          }
          return { items: [...state.items, newItem], isCartDrawerOpen: true };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, delta) => {
        set((state) => {
          const updated = state.items
            .map((item) => {
              if (item.id === id) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
              }
              return item;
            })
            .filter(Boolean) as CartItem[];
          return { items: updated };
        });
      },

      clearCart: () => {
        set({ items: [], appliedCoupon: null });
      },

      setCartDrawerOpen: (isOpen) => {
        set({ isCartDrawerOpen: isOpen });
      },

      applyCoupon: (coupon) => {
        set({ appliedCoupon: coupon });
      },

      removeCoupon: () => {
        set({ appliedCoupon: null });
      },

      getItemsCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getDiscountAmount: () => {
        const subtotal = get().getSubtotal();
        const coupon = get().appliedCoupon;
        if (!coupon) return 0;

        if (coupon.discount_type === "percentage") {
          return (subtotal * coupon.discount_value) / 100;
        } else {
          return Math.min(coupon.discount_value, subtotal);
        }
      },

      getDepositAmount: (depositPercent = 25) => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscountAmount();
        const effectiveTotal = Math.max(0, subtotal - discount);
        return (effectiveTotal * depositPercent) / 100;
      },
    }),
    {
      name: "beit-el-dallah-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, appliedCoupon: state.appliedCoupon }),
    }
  )
);
