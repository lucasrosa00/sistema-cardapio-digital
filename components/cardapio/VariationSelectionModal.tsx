'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ProductAddons } from '@/components/ui/ProductAddons';
import type { ProductAddonDto } from '@/lib/api/types';
import type { ProductOptionGroup } from '@/lib/mockData';
import type { CartItemAddon, CartItemSelectedOption } from '@/store/cartStore';
import {
  ProductOptionGroupsSelector,
  areOptionGroupsComplete,
} from '@/components/cardapio/ProductOptionGroupsSelector';
import { productHasActiveOptionGroups } from '@/lib/utils/productOptionGroups';

interface Variation {
  label: string;
  price: number;
}

interface VariationSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
  variations: Variation[];
  mainColor: string;
  darkMode?: boolean;
  availableAddons?: ProductAddonDto[];
  allowSelection?: boolean;
  optionGroups?: ProductOptionGroup[];
  serviceType?: 'Menu' | 'Catalog' | null;
  onSelectVariation: (
    variation: Variation,
    addons?: CartItemAddon[],
    selectedOptions?: CartItemSelectedOption[]
  ) => void;
}

export function VariationSelectionModal({
  isOpen,
  onClose,
  productTitle,
  variations,
  mainColor,
  darkMode = false,
  availableAddons = [],
  allowSelection = false,
  optionGroups = [],
  serviceType = 'Menu',
  onSelectVariation,
}: VariationSelectionModalProps) {
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<CartItemAddon[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<CartItemSelectedOption[]>([]);

  if (!isOpen) return null;

  const hasOg = productHasActiveOptionGroups(optionGroups);
  const optionsOk = !hasOg || areOptionGroupsComplete(optionGroups, selectedOptions);

  const handleConfirm = () => {
    if (selectedVariation && optionsOk) {
      onSelectVariation(
        selectedVariation,
        selectedAddons.length > 0 ? selectedAddons : undefined,
        selectedOptions.length > 0 ? selectedOptions : undefined
      );
      setSelectedVariation(null);
      setSelectedAddons([]);
      setSelectedOptions([]);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedVariation(null);
    setSelectedAddons([]);
    setSelectedOptions([]);
    onClose();
  };

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="min-h-screen px-4 py-8 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              {serviceType === 'Catalog' ? 'Monte seu item' : 'Escolha a opção'} — {productTitle}
            </h2>
          </div>

          {hasOg && optionGroups.length > 0 && (
            <div className="px-6 pt-4">
              <ProductOptionGroupsSelector
                groups={optionGroups}
                value={selectedOptions}
                onChange={setSelectedOptions}
                mainColor={mainColor}
                darkMode={false}
                serviceType={serviceType}
              />
            </div>
          )}

          {/* Variações */}
          <div className="px-6 py-4 space-y-2">
            {variations.map((variation, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedVariation(variation)}
                className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                  selectedVariation?.label === variation.label
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-gray-900">
                    {variation.label}
                  </span>
                  <span
                    className="text-lg font-bold"
                    style={{ color: mainColor }}
                  >
                    {formatPrice(variation.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Adicionais */}
          {availableAddons && availableAddons.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <ProductAddons
                addons={availableAddons}
                allowSelection={allowSelection}
                mainColor={mainColor}
                darkMode={darkMode}
                selectedAddons={selectedAddons}
                onAddonsChange={setSelectedAddons}
              />
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex gap-2">
            <Button
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={!selectedVariation || !optionsOk}
              className="flex-1"
              style={{ backgroundColor: mainColor }}
            >
              {!optionsOk && hasOg ? 'Complete as escolhas' : 'Adicionar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

