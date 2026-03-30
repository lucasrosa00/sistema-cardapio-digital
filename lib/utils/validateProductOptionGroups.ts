import type { ProductOptionGroup } from '@/lib/mockData';

export interface OptionGroupsValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Valida grupos de opção do produto (dashboard).
 * - Título da seleção e das opções preenchidos
 * - quantidadeItensObrigatorios >= 1 e <= número de opções ativas
 * - Pelo menos uma opção ativa por grupo quando houver opções
 */
export function validateProductOptionGroups(groups: ProductOptionGroup[]): OptionGroupsValidationResult {
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    if (!g.title?.trim()) {
      return { valid: false, error: `Preencha o título da seleção obrigatória ${i + 1}.` };
    }
    const q = g.quantidadeItensObrigatorios;
    if (!Number.isFinite(q) || q < 1) {
      return { valid: false, error: `A quantidade obrigatória da seleção "${g.title}" deve ser pelo menos 1.` };
    }
    const activeOpts = g.opcoes.filter((o) => o.active);
    if (activeOpts.length === 0 && g.opcoes.length > 0) {
      return { valid: false, error: `A seleção "${g.title}" precisa de ao menos uma opção ativa.` };
    }
    if (g.opcoes.length === 0) {
      return { valid: false, error: `A seleção "${g.title}" precisa de ao menos uma opção.` };
    }
    for (let j = 0; j < g.opcoes.length; j++) {
      const o = g.opcoes[j];
      if (!o.title?.trim()) {
        return {
          valid: false,
          error: `Preencha o título de todas as opções na seleção "${g.title}".`,
        };
      }
      if (o.extraPrice < 0) {
        return { valid: false, error: `Preço extra inválido na opção "${o.title}".` };
      }
    }
    if (q > activeOpts.length) {
      return {
        valid: false,
        error: `Na seleção "${g.title}", a quantidade obrigatória (${q}) não pode ser maior que o número de opções ativas (${activeOpts.length}).`,
      };
    }
  }
  return { valid: true };
}
