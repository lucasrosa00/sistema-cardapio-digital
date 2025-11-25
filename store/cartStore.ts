import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: number;
  productTitle: string;
  price: number;
  quantity: number;
  variationLabel?: string;
  image?: string;
}

interface CartState {
  items: CartItem[];
  tableNumber: string | null;
  tableId: number | null;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: number, variationLabel?: string) => void;
  updateQuantity: (productId: number, quantity: number, variationLabel?: string) => void;
  clearCart: () => void;
  setTableNumber: (tableNumber: string | null) => void;
  setTableId: (tableId: number | null) => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      tableNumber: null,
      tableId: null,

      addItem: (item) => {
        const items = get().items;
        const existingItemIndex = items.findIndex(
          (i) => i.productId === item.productId && i.variationLabel === item.variationLabel
        );

        if (existingItemIndex >= 0) {
          // Item já existe, incrementa quantidade
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += 1;
          set({ items: updatedItems });
        } else {
          // Novo item
          set({ items: [...items, { ...item, quantity: 1 }] });
        }
      },

      removeItem: (productId, variationLabel) => {
        set({
          items: get().items.filter(
            (item) => !(item.productId === productId && item.variationLabel === variationLabel)
          ),
        });
      },

      updateQuantity: (productId, quantity, variationLabel) => {
        if (quantity <= 0) {
          get().removeItem(productId, variationLabel);
          return;
        }

        const items = get().items;
        const existingItemIndex = items.findIndex(
          (i) => i.productId === productId && i.variationLabel === variationLabel
        );

        if (existingItemIndex >= 0) {
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity = quantity;
          set({ items: updatedItems });
        }
      },

      clearCart: () => {
        set({ items: [], tableNumber: null, tableId: null });
      },

      setTableNumber: (tableNumber) => {
        set({ tableNumber });
      },

      setTableId: (tableId) => {
        set({ tableId });
      },

      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

