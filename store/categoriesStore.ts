import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Category } from '@/lib/mockData';
import { mockCategories } from '@/lib/mockData';

interface CategoriesState {
  categories: Category[];
  filterActive: boolean | null;
  setFilterActive: (value: boolean | null) => void;
  addCategory: (category: Omit<Category, 'id'>, restaurantId: number) => void;
  updateCategory: (id: number, category: Partial<Category>) => void;
  deleteCategory: (id: number) => void;
  getFilteredCategories: (restaurantId: number) => Category[];
  getCategoriesByRestaurant: (restaurantId: number) => Category[];
}

export const useCategoriesStore = create<CategoriesState>()(
  persist(
    (set, get) => ({
      categories: mockCategories,
      filterActive: null,
      setFilterActive: (value) => set({ filterActive: value }),
      addCategory: (category, restaurantId) => {
        const state = get();
        const newId = Math.max(...state.categories.map(c => c.id), 0) + 1;
        const restaurantCategories = state.categories.filter(c => c.restaurantId === restaurantId);
        const newOrder = category.order !== undefined ? category.order : 
          (restaurantCategories.length > 0 
            ? Math.max(...restaurantCategories.map(c => c.order || 0)) + 1
            : 1);

        // Reordenação automática: shift para cima os itens que ocupem a ordem selecionada ou acima
        const reorderedCategories = restaurantCategories.map((cat) => {
          if (cat.order >= newOrder) {
            return { ...cat, order: cat.order + 1 };
          }
          return cat;
        });

        // Adiciona a nova categoria
        const newCategory = {
          ...category,
          id: newId,
          restaurantId,
          order: newOrder,
        };

        // Atualiza todas as categorias: mantém as de outros restaurantes e atualiza as do restaurante atual
        const otherRestaurantCategories = state.categories.filter(c => c.restaurantId !== restaurantId);
        set({
          categories: [...otherRestaurantCategories, ...reorderedCategories, newCategory],
        });
      },
      updateCategory: (id, updates) => {
        const state = get();
        const categoryToUpdate = state.categories.find(c => c.id === id);
        
        if (!categoryToUpdate) return;

        const restaurantId = categoryToUpdate.restaurantId;
        const oldOrder = categoryToUpdate.order;
        const newOrder = updates.order !== undefined ? updates.order : oldOrder;

        // Se a ordem mudou, precisa reordenar
        if (oldOrder !== newOrder) {
          // Pega todas as categorias do restaurante exceto a que está sendo editada
          const restaurantCategories = state.categories.filter(c => c.restaurantId === restaurantId && c.id !== id);
          
          // Reordena as categorias afetadas
          const reorderedCategories = restaurantCategories.map((cat) => {
            if (newOrder < oldOrder) {
              // Movendo para cima: shift para baixo os itens entre newOrder e oldOrder (exclusive)
              if (cat.order >= newOrder && cat.order < oldOrder) {
                return { ...cat, order: cat.order + 1 };
              }
            } else {
              // Movendo para baixo: shift para cima os itens entre oldOrder e newOrder (exclusive)
              if (cat.order > oldOrder && cat.order <= newOrder) {
                return { ...cat, order: cat.order - 1 };
              }
            }
            return cat;
          });

          // Atualiza a categoria sendo editada com a nova ordem
          const updatedCategory = { ...categoryToUpdate, ...updates };

          // Atualiza todas as categorias: mantém as de outros restaurantes e atualiza as do restaurante atual
          const otherRestaurantCategories = state.categories.filter(c => c.restaurantId !== restaurantId);
          set({
            categories: [
              ...otherRestaurantCategories,
              ...reorderedCategories,
              updatedCategory
            ],
          });
        } else {
          // Ordem não mudou, apenas atualiza a categoria
          set({
            categories: state.categories.map((cat) =>
              cat.id === id ? { ...cat, ...updates } : cat
            ),
          });
        }
      },
      deleteCategory: (id) => {
        set({
          categories: get().categories.filter((cat) => cat.id !== id),
        });
      },
      getCategoriesByRestaurant: (restaurantId) => {
        const categories = get().categories.filter((cat) => cat.restaurantId === restaurantId);
        // Ordenar por order
        return categories.sort((a, b) => (a.order || 0) - (b.order || 0));
      },
      getFilteredCategories: (restaurantId) => {
        const { categories, filterActive } = get();
        const restaurantCategories = categories.filter((cat) => cat.restaurantId === restaurantId);
        const filtered = filterActive === null 
          ? restaurantCategories 
          : restaurantCategories.filter((cat) => cat.active === filterActive);
        // Ordenar por order
        return filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
      },
    }),
    {
      name: 'categories-storage',
      migrate: (persistedState: any, version: number) => {
        // Migração: adiciona restaurantId e order aos dados antigos ou reseta para mocks
        if (persistedState?.categories) {
          const hasRestaurantId = persistedState.categories.every((cat: any) => 'restaurantId' in cat);
          const hasOrder = persistedState.categories.every((cat: any) => 'order' in cat);
          
          if (!hasRestaurantId) {
            // Se não tem restaurantId, reseta para os mocks que já têm
            return {
              ...persistedState,
              categories: mockCategories,
            };
          }
          
          if (!hasOrder) {
            // Adiciona order aos dados existentes
            return {
              ...persistedState,
              categories: persistedState.categories.map((cat: any, index: number) => ({
                ...cat,
                order: cat.order !== undefined ? cat.order : index + 1,
              })),
            };
          }
        }
        return persistedState;
      },
    }
  )
);

