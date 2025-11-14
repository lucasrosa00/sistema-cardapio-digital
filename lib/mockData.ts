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
  images?: string[]; // base64 strings
  active: boolean;
  order: number;
}

export const mockCategories: Category[] = [
];

export const mockSubcategories: Subcategory[] = [
];

export const mockProducts: Product[] = [
];

