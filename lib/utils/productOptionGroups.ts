import type { ProductOptionGroup } from '@/lib/mockData';

/** Produto tem grupos de opção com ao menos uma opção ativa (cliente precisa escolher). */
export function productHasActiveOptionGroups(
  groups: ProductOptionGroup[] | null | undefined
): boolean {
  if (!groups?.length) return false;
  return groups.some(
    (g) =>
      typeof g.id === 'number' &&
      Boolean(g.title?.trim()) &&
      (g.opcoes || []).some((o) => o.active)
  );
}
