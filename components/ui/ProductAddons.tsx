'use client';

import { useState, useEffect } from 'react';
import type { ProductAddonDto } from '@/lib/api/types';
import type { CartItemAddon } from '@/store/cartStore';

interface ProductAddonsProps {
  addons: ProductAddonDto[];
  allowSelection: boolean;
  mainColor: string;
  darkMode?: boolean;
  selectedAddons?: CartItemAddon[];
  onAddonsChange?: (addons: CartItemAddon[]) => void;
}

export function ProductAddons({
  addons,
  allowSelection,
  mainColor,
  darkMode = false,
  selectedAddons = [],
  onAddonsChange,
}: ProductAddonsProps) {
  const [localSelectedAddons, setLocalSelectedAddons] = useState<CartItemAddon[]>(
    selectedAddons.map(a => ({ ...a }))
  );

  // Sincronizar estado local com props quando selectedAddons mudar externamente
  // Usar JSON.stringify para comparar profundamente e evitar loops
  useEffect(() => {
    const currentStr = JSON.stringify(localSelectedAddons.map(a => ({ ...a })));
    const newStr = JSON.stringify(selectedAddons.map(a => ({ ...a })));
    if (currentStr !== newStr) {
      setLocalSelectedAddons(selectedAddons.map(a => ({ ...a })));
    }
  }, [selectedAddons]);

  if (!addons || addons.length === 0) {
    return null;
  }

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  const handleAddonToggle = (addon: ProductAddonDto, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!allowSelection || !onAddonsChange) return;

    // Usar o ID do adicional como identificador único
    const addonIdentifier = addon.id;
    
    if (!addonIdentifier) {
      console.error('Adicional sem ID:', addon);
      return;
    }
    
    // Usar o estado atual para garantir que estamos trabalhando com os dados mais recentes
    const currentSelected = [...localSelectedAddons];
    const existingIndex = currentSelected.findIndex(
      (a) => (a as any).addonId === addonIdentifier
    );

    let newSelectedAddons: CartItemAddon[];

    if (existingIndex >= 0) {
      // Remove o adicional
      newSelectedAddons = currentSelected.filter(
        (a, idx) => idx !== existingIndex
      );
    } else {
      // Adiciona o adicional com quantidade 1
      const newAddon: CartItemAddon & { addonId?: number } = {
        productAddonId: addon.productAddonId,
        name: addon.name || '',
        extraPrice: addon.extraPrice,
        quantity: 1,
        addonId: addonIdentifier, // Adicionar ID único para comparação
      };
      newSelectedAddons = [...currentSelected, newAddon];
    }

    setLocalSelectedAddons(newSelectedAddons);
    onAddonsChange(newSelectedAddons);
  };

  const handleQuantityChange = (addonId: number, delta: number) => {
    if (!allowSelection || !onAddonsChange) return;

    const existingIndex = localSelectedAddons.findIndex(
      (a) => (a as any).addonId === addonId
    );

    if (existingIndex >= 0) {
      const newQuantity = localSelectedAddons[existingIndex].quantity + delta;
      if (newQuantity <= 0) {
        // Remove o adicional se quantidade for 0
        const newSelectedAddons = localSelectedAddons.filter(
          (a, idx) => idx !== existingIndex
        );
        setLocalSelectedAddons(newSelectedAddons);
        onAddonsChange(newSelectedAddons);
      } else {
        // Atualiza a quantidade
        const newSelectedAddons = [...localSelectedAddons];
        newSelectedAddons[existingIndex].quantity = newQuantity;
        setLocalSelectedAddons(newSelectedAddons);
        onAddonsChange(newSelectedAddons);
      }
    }
  };

  const getSelectedQuantity = (addon: ProductAddonDto): number => {
    if (!addon.id) return 0;
    const selected = localSelectedAddons.find(
      (a) => (a as any).addonId === addon.id
    );
    return selected?.quantity || 0;
  };

  const isSelected = (addon: ProductAddonDto): boolean => {
    if (!addon.id) return false;
    return localSelectedAddons.some(
      (a) => (a as any).addonId === addon.id
    );
  };

  return (
    <div className="space-y-3">
      <h3
        className="text-base md:text-lg font-semibold"
        style={{ color: mainColor }}
      >
        Adicionais disponíveis:
      </h3>
      <div className="space-y-2">
        {addons.map((addon, index) => {
          // Usar id como chave principal, com fallback para productAddonId e index
          const addonKey = addon.id || addon.productAddonId || index;
          const selected = isSelected(addon);
          const quantity = getSelectedQuantity(addon);

          return (
            <div
              key={addonKey}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                allowSelection
                  ? selected
                    ? darkMode
                      ? 'border-blue-400 bg-blue-900/20 shadow-md shadow-blue-500/10'
                      : 'border-blue-500 bg-blue-50 shadow-sm'
                    : darkMode
                      ? 'border-[#2F2F2F] bg-[#1A1A1A] hover:border-[#3F3F3F] hover:bg-[#222222] cursor-pointer'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
                  : darkMode
                    ? 'border-[#2F2F2F] bg-[#1A1A1A] opacity-75'
                    : 'border-gray-200 bg-white opacity-75'
              }`}
              onClick={(e) => {
                if (allowSelection) {
                  handleAddonToggle(addon, e);
                }
              }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {allowSelection && (
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        selected
                          ? darkMode
                            ? 'border-blue-400 bg-blue-500 shadow-sm'
                            : 'border-blue-500 bg-blue-500'
                          : darkMode
                            ? 'border-gray-500 bg-transparent'
                            : 'border-gray-300 bg-transparent'
                      }`}
                    >
                      {selected && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  )}
                  <div>
                    <span
                      className={`text-sm md:text-base font-medium ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {addon.name}
                    </span>
                    {addon.description && (
                      <p
                        className={`text-xs md:text-sm mt-0.5 ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        {addon.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {allowSelection && selected && quantity > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (addon.id) {
                          handleQuantityChange(addon.id, -1);
                        }
                      }}
                      className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                        darkMode
                          ? 'border-[#3F3F3F] bg-[#2A2A2A] hover:bg-[#353535] hover:border-[#4A4A4A] text-white active:scale-95'
                          : 'border-gray-300 bg-white hover:bg-gray-100 hover:border-gray-400 text-gray-700 active:scale-95'
                      }`}
                    >
                      -
                    </button>
                    <span
                      className={`w-8 text-center font-semibold ${
                        darkMode ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {quantity}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (addon.id) {
                          handleQuantityChange(addon.id, 1);
                        }
                      }}
                      className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                        darkMode
                          ? 'border-[#3F3F3F] bg-[#2A2A2A] hover:bg-[#353535] hover:border-[#4A4A4A] text-white active:scale-95'
                          : 'border-gray-300 bg-white hover:bg-gray-100 hover:border-gray-400 text-gray-700 active:scale-95'
                      }`}
                    >
                      +
                    </button>
                  </div>
                )}
                <span
                  className="text-lg md:text-xl font-bold min-w-[80px] text-right"
                  style={{ color: mainColor }}
                >
                  {formatPrice(addon.extraPrice)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {!allowSelection && (
        <p
          className={`text-xs italic ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          * Adicionais informativos. Pedidos não estão disponíveis no momento.
        </p>
      )}
    </div>
  );
}

