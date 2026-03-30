import type { ProductOptionGroupDto } from '@/lib/api/types';
import type { ProductOptionGroup } from '@/lib/mockData';

export function mapApiOptionGroups(
  dto: ProductOptionGroupDto[] | null | undefined
): ProductOptionGroup[] {
  if (!dto?.length) return [];
  return dto.map((g) => ({
    id: g.id,
    title: g.title || '',
    quantidadeItensObrigatorios: g.quantidadeItensObrigatorios,
    order: g.order,
    opcoes: (g.opcoes || []).map((o) => ({
      id: o.id,
      title: o.title || '',
      extraPrice: o.extraPrice,
      active: o.active,
      order: o.order,
    })),
  }));
}
