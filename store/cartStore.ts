import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItemAddon {
  productAddonId: number;
  name: string;
  extraPrice: number;
  quantity: number;
}

export interface CartItem {
  productId: number;
  productTitle: string;
  price: number;
  quantity: number;
  variationLabel?: string;
  image?: string;
  addons?: CartItemAddon[];
}

interface CartState {
  items: CartItem[];
  tableNumber: string | null;
  tableId: number | null;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: number, variationLabel?: string, addons?: CartItemAddon[]) => void;
  updateQuantity: (productId: number, quantity: number, variationLabel?: string, addons?: CartItemAddon[]) => void;
  clearCart: () => void;
  setTableNumber: (tableNumber: string | null) => void;
  setTableId: (tableId: number | null) => void;
  getTotal: () => number;
  getItemCount: () => number;
}

// Função auxiliar para criar chave única de um item do carrinho
const createItemKey = (item: { productId: number; variationLabel?: string; addons?: CartItemAddon[] }): string => {
  // Normalizar addons: undefined ou [] vira string vazia, senão ordena e cria chave
  const normalizedAddons = item.addons && item.addons.length > 0 ? item.addons : [];
  const addonsKey = normalizedAddons
    .map(a => {
      // Usar productAddonId se disponível, senão usar addonId (campo auxiliar) ou 0
      const addonId = a.productAddonId || (a as any).addonId || 0;
      return `${addonId}:${a.quantity}`;
    })
    .sort()
    .join(',');
  return `${item.productId}-${item.variationLabel || 'unique'}-${addonsKey}`;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      tableNumber: null,
      tableId: null,

      addItem: (item) => {
        const items = get().items;
        // Normalizar addons para garantir comparação consistente
        const normalizedItem = {
          ...item,
          addons: item.addons && item.addons.length > 0 ? item.addons : undefined,
        };
        const newItemKey = createItemKey(normalizedItem as CartItem);
        
        const existingItemIndex = items.findIndex(
          (i) => createItemKey(i) === newItemKey
        );

        if (existingItemIndex >= 0) {
          // Item já existe, incrementa quantidade
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += 1;
          set({ items: updatedItems });
        } else {
          // Novo item
          set({ items: [...items, { ...normalizedItem, quantity: 1 }] });
        }
      },

      removeItem: (productId, variationLabel, addons?: CartItemAddon[]) => {
        const items = get().items;
        const targetKey = createItemKey({ 
          productId, 
          variationLabel, 
          addons: addons || []
        });
        
        set({
          items: items.filter(
            (item) => createItemKey(item) !== targetKey
          ),
        });
      },

      updateQuantity: (productId, quantity, variationLabel, addons?: CartItemAddon[]) => {
        if (quantity <= 0) {
          get().removeItem(productId, variationLabel, addons);
          return;
        }

        const items = get().items;
        const targetKey = createItemKey({ 
          productId, 
          variationLabel, 
          addons: addons || []
        });
        
        const existingItemIndex = items.findIndex(
          (i) => createItemKey(i) === targetKey
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
        return get().items.reduce((total, item) => {
          const itemBasePrice = item.price * item.quantity;
          const addonsPrice = item.addons?.reduce((addonTotal, addon) => {
            return addonTotal + (addon.extraPrice * addon.quantity * item.quantity);
          }, 0) || 0;
          return total + itemBasePrice + addonsPrice;
        }, 0);
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

