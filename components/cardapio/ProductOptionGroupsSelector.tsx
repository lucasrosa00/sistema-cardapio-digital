'use client';

import { useMemo, useCallback } from 'react';
import type { ProductOptionGroup } from '@/lib/mockData';
import type { CartItemSelectedOption } from '@/store/cartStore';

export interface ProductOptionGroupsSelectorProps {
  groups: ProductOptionGroup[];
  value: CartItemSelectedOption[];
  onChange: (selections: CartItemSelectedOption[]) => void;
  mainColor: string;
  darkMode?: boolean;
  serviceType?: 'Menu' | 'Catalog' | null;
  disabled?: boolean;
}

function activeSortedOptions(group: ProductOptionGroup) {
  return (group.opcoes || [])
    .filter((o) => o.active)
    .slice()
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

function selectionsForGroup(group: ProductOptionGroup, value: CartItemSelectedOption[]) {
  return value.filter((s) => s.optionGroupId === group.id);
}

export function ProductOptionGroupsSelector({
  groups,
  value,
  onChange,
  mainColor,
  darkMode = false,
  serviceType = 'Menu',
  disabled = false,
}: ProductOptionGroupsSelectorProps) {
  const sortedGroups = useMemo(
    () =>
      groups
        .filter((g) => g.title?.trim() && activeSortedOptions(g).length > 0)
        .slice()
        .sort((a, b) => (a.order || 0) - (b.order || 0)),
    [groups]
  );

  const isCatalog = serviceType === 'Catalog';
  const sectionTitle = isCatalog ? 'Personalize sua escolha' : 'Monte seu pedido';
  const sectionSubtitle = isCatalog
    ? 'Selecione as opções obrigatórias antes de adicionar ao carrinho.'
    : 'Escolha as opções obrigatórias (sabores, tamanhos etc.) antes de adicionar.';

  const toggleOption = useCallback(
    (group: ProductOptionGroup, optionId: number, optionTitle: string, extraPrice: number, maxPick: number) => {
      if (disabled || typeof group.id !== 'number') return;
      const gid = group.id;
      const current = selectionsForGroup(group, value);
      const already = current.some((s) => s.optionId === optionId);

      if (already) {
        onChange(value.filter((s) => !(s.optionGroupId === gid && s.optionId === optionId)));
        return;
      }

      if (current.length >= maxPick) {
        if (maxPick === 1) {
          onChange([
            ...value.filter((s) => s.optionGroupId !== gid),
            {
              optionGroupId: gid,
              optionGroupTitle: group.title,
              optionId,
              optionTitle,
              extraPrice,
            },
          ]);
        } else {
          const withoutOldest = current.slice(1);
          const rest = value.filter((s) => s.optionGroupId !== gid);
          onChange([
            ...rest,
            ...withoutOldest.map((s) => ({ ...s })),
            {
              optionGroupId: gid,
              optionGroupTitle: group.title,
              optionId,
              optionTitle,
              extraPrice,
            },
          ]);
        }
        return;
      }

      onChange([
        ...value,
        {
          optionGroupId: gid,
          optionGroupTitle: group.title,
          optionId,
          optionTitle,
          extraPrice,
        },
      ]);
    },
    [value, onChange, disabled]
  );

  if (sortedGroups.length === 0) return null;

  return (
    <div
      className={`space-y-3 ${
        isCatalog
          ? darkMode
            ? 'bg-zinc-900/40'
            : 'bg-gradient-to-br from-slate-50 to-white'
          : darkMode
            ? 'bg-[#1A1A1A]'
            : 'bg-amber-50/30'
      }`}
    >
      <div
        className={
          darkMode ? 'bg-black/20' : isCatalog ? 'bg-white/60' : 'bg-white/50'
        }
      >
        <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{sectionTitle}</p>
        <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{sectionSubtitle}</p>
      </div>

      <div className="space-y-4">
        {sortedGroups.map((group) => {
          const opts = activeSortedOptions(group);
          const maxPick = Math.min(
            Math.max(1, group.quantidadeItensObrigatorios || 1),
            opts.length
          );
          const picked = selectionsForGroup(group, value);
          const labelHint =
            maxPick === 1
              ? isCatalog
                ? 'Escolha 1 opção'
                : 'Escolha 1'
              : isCatalog
                ? `Escolha ${maxPick} opções`
                : `Escolha ${maxPick} opção(ões)`;

          return (
            <div key={typeof group.id === 'number' ? group.id : group.title} className="space-y-2">
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <span
                  className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}
                  style={!darkMode ? { color: mainColor } : undefined}
                >
                  {group.title}
                </span>
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {labelHint}
                  <span className="ml-1 opacity-80">
                    ({picked.length}/{maxPick})
                  </span>
                </span>
              </div>
              <div
                className={
                  isCatalog
                    ? // Grid preenche a largura: células iguais por linha, sem “buraco” à direita
                      'grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(min(100%,6.25rem),1fr))]'
                    : 'flex flex-col gap-2 w-full'
                }
              >
                {opts.map((opt) => {
                  const selected = picked.some((s) => s.optionId === opt.id);
                  const oid = opt.id;
                  if (typeof oid !== 'number') return null;
                  return (
                    <button
                      key={oid}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggleOption(group, oid, opt.title, opt.extraPrice, maxPick)}
                      className={`
                        px-2 py-2 rounded-lg text-sm font-medium transition-all border
                        min-h-[2.75rem]
                        ${isCatalog ? 'w-full text-center flex flex-col items-center justify-center min-w-0' : 'w-full text-left'}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}
                        ${
                          selected
                            ? darkMode
                              ? 'border-blue-400 bg-blue-950/50 text-white ring-1 ring-blue-500/40'
                              : 'border-transparent text-white shadow-md'
                            : darkMode
                              ? 'border-[#3F3F3F] bg-[#252525] text-gray-200 hover:border-[#505050]'
                              : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300'
                        }
                      `}
                      style={
                        selected && !darkMode
                          ? { backgroundColor: mainColor, borderColor: mainColor }
                          : undefined
                      }
                    >
                      <span className={`block ${isCatalog ? 'break-words leading-tight' : ''}`}>{opt.title}</span>
                      {opt.extraPrice > 0 && (
                        <span className={`text-xs mt-0.5 block ${selected && !darkMode ? 'text-white/90' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          + R$ {opt.extraPrice.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Retorna true se todas as seleções obrigatórias estão completas */
export function areOptionGroupsComplete(
  groups: ProductOptionGroup[],
  value: CartItemSelectedOption[]
): boolean {
  const sorted = groups
    .filter((g) => g.title?.trim() && activeSortedOptions(g).length > 0 && typeof g.id === 'number')
    .slice()
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  for (const g of sorted) {
    const opts = activeSortedOptions(g);
    const need = Math.min(Math.max(1, g.quantidadeItensObrigatorios || 1), opts.length);
    const picked = selectionsForGroup(g, value);
    if (picked.length !== need) return false;
  }
  return true;
}
