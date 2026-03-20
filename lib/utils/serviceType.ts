/**
 * Retorna o texto apropriado baseado no tipo de serviço
 * @param serviceType - Tipo de serviço: 'Menu' | 'Catalog' | null | undefined
 * @returns "Cardápio Digital" para Menu ou null, "Catálogo Digital" para Catalog
 */
export function getServiceTypeLabel(serviceType: 'Menu' | 'Catalog' | null | undefined): string {
  return serviceType === 'Catalog' ? 'Catálogo Digital' : 'Cardápio Digital';
}

/** Placeholder do campo título de categoria (dashboard) */
export function getCategoryTitlePlaceholder(serviceType: 'Menu' | 'Catalog' | null | undefined): string {
  return serviceType === 'Catalog'
    ? 'Ex: Roupas, Eletrônicos, Casa e Decoração'
    : 'Ex: Entradas, Pratos Principais, Bebidas';
}

/** Placeholder do campo título de subcategoria (dashboard) */
export function getSubcategoryTitlePlaceholder(serviceType: 'Menu' | 'Catalog' | null | undefined): string {
  return serviceType === 'Catalog'
    ? 'Ex: Camisetas, Calças, Calçados'
    : 'Ex: Porções, Grelhados, Sobremesas';
}

/** Placeholder do nome de adicional (dashboard) */
export function getAddonNamePlaceholder(serviceType: 'Menu' | 'Catalog' | null | undefined): string {
  return serviceType === 'Catalog'
    ? 'Ex: Garantia estendida, Embalagem para presente, Gravação'
    : 'Ex: Bacon, Cheddar, Topper';
}

