import { Category, Subcategory, Product } from '@/lib/mockData';

// Estrutura para armazenar dados por restaurante
export interface RestaurantData {
  categories: Category[];
  subcategories: Subcategory[];
  products: Product[];
}

// Funções helper para buscar dados dos stores principais
// Essas funções devem ser chamadas de fora do store, passando os stores como parâmetros
export const getRestaurantDataFromStores = (
  restaurantId: number,
  categoriesStore: { getCategoriesByRestaurant: (id: number) => Category[] },
  subcategoriesStore: { getSubcategoriesByRestaurant: (id: number) => Subcategory[] },
  productsStore: { getProductsByRestaurant: (id: number) => Product[] }
): RestaurantData => {
  return {
    categories: categoriesStore.getCategoriesByRestaurant(restaurantId),
    subcategories: subcategoriesStore.getSubcategoriesByRestaurant(restaurantId),
    products: productsStore.getProductsByRestaurant(restaurantId),
  };
};

