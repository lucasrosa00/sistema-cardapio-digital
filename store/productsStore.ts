import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/lib/mockData';
import { mockProducts } from '@/lib/mockData';

interface ProductsState {
  products: Product[];
  filterActive: boolean | null;
  setFilterActive: (value: boolean | null) => void;
  addProduct: (product: Omit<Product, 'id'>, restaurantId: number) => void;
  updateProduct: (id: number, product: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  getFilteredProducts: (restaurantId: number) => Product[];
  getProductsByRestaurant: (restaurantId: number) => Product[];
}

export const useProductsStore = create<ProductsState>()(
  persist(
    (set, get) => ({
      products: mockProducts,
      filterActive: null,
      setFilterActive: (value) => set({ filterActive: value }),
      addProduct: (product, restaurantId) => {
        const newId = Math.max(...get().products.map(p => p.id), 0) + 1;
        // Se não tiver order definido, pega o maior order da subcategoria + 1
        const subcategoryProducts = get().products.filter(
          p => p.restaurantId === restaurantId && p.subcategoryId === product.subcategoryId
        );
        const maxOrder = subcategoryProducts.length > 0 
          ? Math.max(...subcategoryProducts.map(p => p.order || 0))
          : 0;
        set({
          products: [...get().products, { 
            ...product, 
            id: newId,
            restaurantId,
            images: product.images || [],
            active: product.active !== undefined ? product.active : true,
            order: product.order !== undefined ? product.order : maxOrder + 1,
          }],
        });
      },
      updateProduct: (id, updates) => {
        set({
          products: get().products.map((prod) =>
            prod.id === id ? { ...prod, ...updates } : prod
          ),
        });
      },
      deleteProduct: (id) => {
        set({
          products: get().products.filter((prod) => prod.id !== id),
        });
      },
      getProductsByRestaurant: (restaurantId) => {
        const products = get().products.filter((prod) => prod.restaurantId === restaurantId);
        // Ordenar por order
        return products.sort((a, b) => (a.order || 0) - (b.order || 0));
      },
      getFilteredProducts: (restaurantId) => {
        const { products } = get();
        const filtered = products.filter((prod) => prod.restaurantId === restaurantId);
        // Ordenar por order
        return filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
      },
    }),
    {
      name: 'products-storage',
      migrate: (persistedState: any, version: number) => {
        // Migração: adiciona restaurantId e order aos dados antigos ou reseta para mocks
        if (persistedState?.products) {
          const hasRestaurantId = persistedState.products.every((prod: any) => 'restaurantId' in prod);
          const hasOrder = persistedState.products.every((prod: any) => 'order' in prod);
          
          if (!hasRestaurantId) {
            return {
              ...persistedState,
              products: mockProducts,
            };
          }
          
          if (!hasOrder) {
            // Adiciona order aos dados existentes
            return {
              ...persistedState,
              products: persistedState.products.map((prod: any, index: number) => ({
                ...prod,
                order: prod.order !== undefined ? prod.order : index + 1,
              })),
            };
          }
        }
        return persistedState;
      },
    }
  )
);

