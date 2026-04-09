export interface Category {
  id: number;
  restaurantId: number;
  title: string;
  active: boolean;
  order: number;
}

export interface Subcategory {
  id: number;
  restaurantId: number;
  categoryId: number;
  title: string;
  active: boolean;
  order: number;
}

export interface ProductVariation {
  label: string;
  price: number;
}

export interface ProductOption {
  id?: number;
  title: string;
  extraPrice: number;
  active: boolean;
  order: number;
}

export interface ProductOptionGroup {
  id?: number;
  title: string;
  quantidadeItensObrigatorios: number;
  opcoes: ProductOption[];
  order: number;
}

export interface Product {
  id: number;
  restaurantId: number;
  categoryId: number;
  subcategoryId: number;
  title: string;
  description: string;
  /** Descrição longa (detalhe do produto) */
  longDescription?: string;
  priceType: 'unique' | 'variable';
  price?: number;
  variations?: ProductVariation[];
  images?: string[];
  active: boolean;
  order: number;
  isAvailable?: boolean;
  availableAddons?: Array<{
    id: number;
    productAddonId: number;
    name: string | null;
    description: string | null;
    extraPrice: number;
    active: boolean;
  }>;
  optionGroups?: ProductOptionGroup[];
}

// Arrays mockados removidos - dados agora vêm da API
// Mantendo apenas as interfaces para compatibilidade

