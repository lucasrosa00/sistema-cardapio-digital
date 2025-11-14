'use client';

import React from 'react';
import { ProductVariation } from '@/lib/mockData';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ProductVariationsProps {
  variations: ProductVariation[];
  onChange: (variations: ProductVariation[]) => void;
}

export const ProductVariations: React.FC<ProductVariationsProps> = ({
  variations,
  onChange,
}) => {
  const addVariation = () => {
    onChange([...variations, { label: '', price: 0 }]);
  };

  const removeVariation = (index: number) => {
    onChange(variations.filter((_, i) => i !== index));
  };

  const updateVariation = (index: number, field: 'label' | 'price', value: string | number) => {
    const updated = variations.map((variation, i) => {
      if (i === index) {
        return { ...variation, [field]: value };
      }
      return variation;
    });
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Variações de Preço
        </label>
        <Button
          type="button"
          variant="secondary"
          onClick={addVariation}
          className="text-xs"
        >
          + Adicionar Variação
        </Button>
      </div>

      {variations.length === 0 ? (
        <p className="text-sm text-gray-500 italic">
          Nenhuma variação adicionada. Clique em "Adicionar Variação" para começar.
        </p>
      ) : (
        <div className="space-y-3">
          {variations.map((variation, index) => (
            <div
              key={index}
              className="flex gap-3 items-start p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex-1 grid grid-cols-2 gap-3">
                <Input
                  label="Label"
                  value={variation.label}
                  onChange={(e) =>
                    updateVariation(index, 'label', e.target.value)
                  }
                  placeholder="Ex: 400g, Grande, 4 Unidades"
                />
                <Input
                  label="Preço (R$)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={variation.price || ''}
                  onChange={(e) =>
                    updateVariation(index, 'price', parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => removeVariation(index)}
                className="mt-6 px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200"
              >
                Remover
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

