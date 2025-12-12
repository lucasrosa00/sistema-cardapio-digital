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

export interface ProductVariation {
  label: string;
  price: number;
}

export interface Product {
  id: number;
  restaurantId: number;
  categoryId: number;
  subcategoryId: number;
  title: string;
  description: string;
  priceType: 'unique' | 'variable';
  price?: number;
  variations?: ProductVariation[];
  images?: string[];
  active: boolean;
  order: number;
  availableAddons?: Array<{
    id: number;
    productAddonId: number;
    name: string | null;
    description: string | null;
    extraPrice: number;
    active: boolean;
  }>;
}

// Arrays mockados removidos - dados agora vêm da API
// Mantendo apenas as interfaces para compatibilidade

