import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItemAddon {
  productAddonId: number;
  name: string;
  extraPrice: number;
  quantity: number;
}

/** Opções escolhidas nos grupos obrigatórios do produto */
export interface CartItemSelectedOption {
  optionGroupId: number;
  optionGroupTitle?: string;
  optionId: number;
  optionTitle: string;
  extraPrice: number;
}

export interface CartItem {
  productId: number;
  productTitle: string;
  price: number;
  quantity: number;
  variationLabel?: string;
  image?: string;
  addons?: CartItemAddon[];
  selectedOptions?: CartItemSelectedOption[];
}

interface CartState {
  items: CartItem[];
  tableNumber: string | null;
  tableId: number | null;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: number, variationLabel?: string, addons?: CartItemAddon[], selectedOptions?: CartItemSelectedOption[]) => void;
  updateQuantity: (productId: number, quantity: number, variationLabel?: string, addons?: CartItemAddon[], selectedOptions?: CartItemSelectedOption[]) => void;
  clearCart: () => void;
  setTableNumber: (tableNumber: string | null) => void;
  setTableId: (tableId: number | null) => void;
  getTotal: () => number;
  getItemCount: () => number;
}

// Função auxiliar para criar chave única de um item do carrinho
const createItemKey = (item: {
  productId: number;
  variationLabel?: string;
  addons?: CartItemAddon[];
  selectedOptions?: CartItemSelectedOption[];
}): string => {
  const normalizedAddons = item.addons && item.addons.length > 0 ? item.addons : [];
  const addonsKey = normalizedAddons
    .map(a => {
      const addonId = a.productAddonId || (a as any).addonId || 0;
      return `${addonId}:${a.quantity}`;
    })
    .sort()
    .join(',');
  const optionsKey =
    item.selectedOptions && item.selectedOptions.length > 0
      ? item.selectedOptions
          .slice()
          .sort((a, b) => a.optionGroupId - b.optionGroupId || a.optionId - b.optionId)
          .map((o) => `${o.optionGroupId}:${o.optionId}`)
          .join(',')
      : '';
  return `${item.productId}-${item.variationLabel || 'unique'}-${addonsKey}-${optionsKey}`;
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
          selectedOptions:
            item.selectedOptions && item.selectedOptions.length > 0 ? item.selectedOptions : undefined,
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

      removeItem: (productId, variationLabel, addons?: CartItemAddon[], selectedOptions?: CartItemSelectedOption[]) => {
        const items = get().items;
        const targetKey = createItemKey({ 
          productId, 
          variationLabel, 
          addons: addons || [],
          selectedOptions: selectedOptions || [],
        });
        
        set({
          items: items.filter(
            (item) => createItemKey(item) !== targetKey
          ),
        });
      },

      updateQuantity: (productId, quantity, variationLabel, addons?: CartItemAddon[], selectedOptions?: CartItemSelectedOption[]) => {
        if (quantity <= 0) {
          get().removeItem(productId, variationLabel, addons, selectedOptions);
          return;
        }

        const items = get().items;
        const targetKey = createItemKey({ 
          productId, 
          variationLabel, 
          addons: addons || [],
          selectedOptions: selectedOptions || [],
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
          const optionsExtra =
            item.selectedOptions?.reduce((s, o) => s + o.extraPrice, 0) || 0;
          const unitWithOptions = item.price + optionsExtra;
          const itemBasePrice = unitWithOptions * item.quantity;
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

