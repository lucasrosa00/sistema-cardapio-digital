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
        const state = get();
        const newId = Math.max(...state.products.map(p => p.id), 0) + 1;
        const restaurantProducts = state.products.filter(
          p => p.restaurantId === restaurantId
        );
        const newOrder = product.order !== undefined ? product.order : 
          (restaurantProducts.length > 0 
            ? Math.max(...restaurantProducts.map(p => p.order || 0)) + 1
            : 1);

        // Reordenação automática: shift para cima os itens que ocupem a ordem selecionada ou acima
        const reorderedProducts = restaurantProducts.map((prod) => {
          if (prod.order >= newOrder) {
            return { ...prod, order: prod.order + 1 };
          }
          return prod;
        });

        // Adiciona o novo produto
        const newProduct = {
          ...product,
          id: newId,
          restaurantId,
          images: product.images || [],
          active: product.active !== undefined ? product.active : true,
          order: newOrder,
        };

        // Atualiza todos os produtos: mantém os de outros restaurantes e atualiza os do restaurante atual
        const otherRestaurantProducts = state.products.filter(
          p => p.restaurantId !== restaurantId
        );
        set({
          products: [...otherRestaurantProducts, ...reorderedProducts, newProduct],
        });
      },
      updateProduct: (id, updates) => {
        const state = get();
        const productToUpdate = state.products.find(p => p.id === id);
        
        if (!productToUpdate) return;

        const restaurantId = productToUpdate.restaurantId;
        const oldOrder = productToUpdate.order;
        const newOrder = updates.order !== undefined ? updates.order : oldOrder;

        // Se a ordem mudou, precisa reordenar (ordenação global)
        if (oldOrder !== newOrder) {
          // Pega todos os produtos do restaurante exceto o que está sendo editado
          const restaurantProducts = state.products.filter(
            p => p.restaurantId === restaurantId && p.id !== id
          );
          
          // Reordena os produtos afetados
          const reorderedProducts = restaurantProducts.map((prod) => {
            if (newOrder < oldOrder) {
              // Movendo para cima: shift para baixo os itens entre newOrder e oldOrder (exclusive)
              if (prod.order >= newOrder && prod.order < oldOrder) {
                return { ...prod, order: prod.order + 1 };
              }
            } else {
              // Movendo para baixo: shift para cima os itens entre oldOrder e newOrder (exclusive)
              if (prod.order > oldOrder && prod.order <= newOrder) {
                return { ...prod, order: prod.order - 1 };
              }
            }
            return prod;
          });

          // Atualiza o produto sendo editado com a nova ordem
          const updatedProduct = { ...productToUpdate, ...updates };

          // Atualiza todos os produtos: mantém os de outros restaurantes e atualiza os do restaurante atual
          const otherRestaurantProducts = state.products.filter(
            p => p.restaurantId !== restaurantId
          );
          set({
            products: [
              ...otherRestaurantProducts,
              ...reorderedProducts,
              updatedProduct
            ],
          });
        } else {
          // Ordem não mudou, apenas atualiza o produto
          set({
            products: state.products.map((prod) =>
              prod.id === id ? { ...prod, ...updates } : prod
            ),
          });
        }
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

