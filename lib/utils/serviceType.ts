/**
 * Retorna o texto apropriado baseado no tipo de serviço
 * @param serviceType - Tipo de serviço: 'Menu' | 'Catalog' | null | undefined
 * @returns "Cardápio Digital" para Menu ou null, "Catálogo Digital" para Catalog
 */
export function getServiceTypeLabel(serviceType: 'Menu' | 'Catalog' | null | undefined): string {
  return serviceType === 'Catalog' ? 'Catálogo Digital' : 'Cardápio Digital';
}

