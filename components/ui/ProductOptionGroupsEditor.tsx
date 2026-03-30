'use client';

import React from 'react';
import type { ProductOption, ProductOptionGroup } from '@/lib/mockData';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface ProductOptionGroupsEditorProps {
  value: ProductOptionGroup[];
  onChange: (groups: ProductOptionGroup[]) => void;
}

const emptyOption = (order: number): ProductOption => ({
  title: '',
  extraPrice: 0,
  active: true,
  order,
});

const emptyGroup = (order: number): ProductOptionGroup => ({
  title: '',
  quantidadeItensObrigatorios: 1,
  order,
  opcoes: [emptyOption(1)],
});

export function ProductOptionGroupsEditor({ value, onChange }: ProductOptionGroupsEditorProps) {
  const addGroup = () => {
    onChange([...value, emptyGroup(value.length + 1)]);
  };

  const removeGroup = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateGroup = (index: number, patch: Partial<ProductOptionGroup>) => {
    onChange(value.map((g, i) => (i === index ? { ...g, ...patch } : g)));
  };

  const addOption = (groupIndex: number) => {
    const g = value[groupIndex];
    const nextOrder = (g.opcoes?.length || 0) + 1;
    updateGroup(groupIndex, { opcoes: [...(g.opcoes || []), emptyOption(nextOrder)] });
  };

  const removeOption = (groupIndex: number, optIndex: number) => {
    const g = value[groupIndex];
    updateGroup(groupIndex, {
      opcoes: g.opcoes.filter((_, i) => i !== optIndex),
    });
  };

  const updateOption = (groupIndex: number, optIndex: number, patch: Partial<ProductOption>) => {
    const g = value[groupIndex];
    const opcoes = g.opcoes.map((o, i) => (i === optIndex ? { ...o, ...patch } : o));
    updateGroup(groupIndex, { opcoes });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pb-1 border-b border-gray-200">
        <div>
          <label className="block text-sm font-semibold text-gray-900">
            Seleções obrigatórias
          </label>
          <p className="text-xs text-gray-500 mt-1 max-w-xl">
            O cliente precisa completar todas antes de pedir (ex.: cor, tamanho ou sabores).
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={addGroup} className="text-sm shrink-0 w-full sm:w-auto">
          + Adicionar seleção
        </Button>
      </div>

      {value.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/60 px-4 py-6 text-center">
          <p className="text-sm text-gray-600">
            Nenhuma seleção obrigatória. Use <span className="font-medium">&quot;Adicionar seleção&quot;</span> se o
            produto exigir escolhas.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {value.map((group, gi) => (
            <div
              key={gi}
              className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-50/30 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-900">Seleção {gi + 1}</span>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => removeGroup(gi)}
                  className="text-xs px-3 py-1.5 bg-white border border-red-200 text-red-700 hover:bg-red-50"
                >
                  Remover seleção
                </Button>
              </div>

              <div className="p-4 space-y-4">
                <Input
                  label="Título da seleção *"
                  value={group.title}
                  onChange={(e) => updateGroup(gi, { title: e.target.value })}
                  placeholder="Ex: Cor, Tamanho, Sabores"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                  <Input
                    label="Quantidade obrigatória *"
                    type="number"
                    min={1}
                    value={group.quantidadeItensObrigatorios || ''}
                    onChange={(e) =>
                      updateGroup(gi, {
                        quantidadeItensObrigatorios: Math.max(1, parseInt(e.target.value, 10) || 1),
                      })
                    }
                  />
                  <Input
                    label="Ordem de exibição do grupo"
                    type="number"
                    min={1}
                    value={group.order || ''}
                    onChange={(e) =>
                      updateGroup(gi, { order: Math.max(1, parseInt(e.target.value, 10) || 1) })
                    }
                  />
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <span className="text-sm font-medium text-gray-800">Opções possíveis</span>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => addOption(gi)}
                      className="text-xs w-full sm:w-auto"
                    >
                      + Adicionar opção
                    </Button>
                  </div>
                  {group.opcoes.length === 0 ? (
                    <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                      Adicione ao menos uma opção nesta seleção.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {group.opcoes.map((opt, oi) => (
                        <div
                          key={oi}
                          className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 p-4 rounded-lg bg-gray-50/90 border border-gray-100"
                        >
                          <div className="md:col-span-5">
                            <Input
                              label="Título da opção *"
                              value={opt.title}
                              onChange={(e) => updateOption(gi, oi, { title: e.target.value })}
                              placeholder="Ex: Branco, P, Chocolate"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Input
                              label="Preço extra (R$)"
                              type="number"
                              step="0.01"
                              min="0"
                              value={opt.extraPrice === 0 ? '' : opt.extraPrice}
                              onChange={(e) =>
                                updateOption(gi, oi, {
                                  extraPrice: parseFloat(e.target.value) || 0,
                                })
                              }
                              placeholder="0,00"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Input
                              label="Ordem"
                              type="number"
                              min={1}
                              value={opt.order || ''}
                              onChange={(e) =>
                                updateOption(gi, oi, {
                                  order: Math.max(1, parseInt(e.target.value, 10) || 1),
                                })
                              }
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Select
                              label="Ativo"
                              value={opt.active ? 'true' : 'false'}
                              onChange={(e) =>
                                updateOption(gi, oi, { active: e.target.value === 'true' })
                              }
                              options={[
                                { value: 'true', label: 'Sim' },
                                { value: 'false', label: 'Não' },
                              ]}
                            />
                          </div>
                          <div className="md:col-span-1 flex md:items-end">
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => removeOption(gi, oi)}
                              className="text-xs w-full md:w-auto px-2 py-2 text-red-600 border-red-200 hover:bg-red-50"
                            >
                              Excluir
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
