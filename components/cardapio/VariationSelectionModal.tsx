'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

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
  onSelectVariation: (variation: Variation) => void;
}

export function VariationSelectionModal({
  isOpen,
  onClose,
  productTitle,
  variations,
  mainColor,
  onSelectVariation,
}: VariationSelectionModalProps) {
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedVariation) {
      onSelectVariation(selectedVariation);
      setSelectedVariation(null);
      onClose();
    }
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
              Selecionar opção - {productTitle}
            </h2>
          </div>

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

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex gap-2">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={!selectedVariation}
              className="flex-1"
              style={{ backgroundColor: mainColor }}
            >
              Adicionar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

