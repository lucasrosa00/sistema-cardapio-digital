import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Subcategory } from '@/lib/mockData';
import { mockSubcategories } from '@/lib/mockData';

interface SubcategoriesState {
  subcategories: Subcategory[];
  filterActive: boolean | null;
  setFilterActive: (value: boolean | null) => void;
  addSubcategory: (subcategory: Omit<Subcategory, 'id'>, restaurantId: number) => void;
  updateSubcategory: (id: number, subcategory: Partial<Subcategory>) => void;
  deleteSubcategory: (id: number) => void;
  getFilteredSubcategories: (restaurantId: number) => Subcategory[];
  getSubcategoriesByRestaurant: (restaurantId: number) => Subcategory[];
}

export const useSubcategoriesStore = create<SubcategoriesState>()(
  persist(
    (set, get) => ({
      subcategories: mockSubcategories,
      filterActive: null,
      setFilterActive: (value) => set({ filterActive: value }),
      addSubcategory: (subcategory, restaurantId) => {
        const state = get();
        const newId = Math.max(...state.subcategories.map(s => s.id), 0) + 1;
        const restaurantSubcategories = state.subcategories.filter(
          s => s.restaurantId === restaurantId
        );
        const newOrder = subcategory.order !== undefined ? subcategory.order : 
          (restaurantSubcategories.length > 0 
            ? Math.max(...restaurantSubcategories.map(s => s.order || 0)) + 1
            : 1);

        // Reordenação automática: shift para cima os itens que ocupem a ordem selecionada ou acima
        const reorderedSubcategories = restaurantSubcategories.map((sub) => {
          if (sub.order >= newOrder) {
            return { ...sub, order: sub.order + 1 };
          }
          return sub;
        });

        // Adiciona a nova subcategoria
        const newSubcategory = {
          ...subcategory,
          id: newId,
          restaurantId,
          order: newOrder,
        };

        // Atualiza todas as subcategorias: mantém as de outros restaurantes e atualiza as do restaurante atual
        const otherRestaurantSubcategories = state.subcategories.filter(
          s => s.restaurantId !== restaurantId
        );
        set({
          subcategories: [...otherRestaurantSubcategories, ...reorderedSubcategories, newSubcategory],
        });
      },
      updateSubcategory: (id, updates) => {
        const state = get();
        const subcategoryToUpdate = state.subcategories.find(s => s.id === id);
        
        if (!subcategoryToUpdate) return;

        const restaurantId = subcategoryToUpdate.restaurantId;
        const categoryId = updates.categoryId !== undefined ? updates.categoryId : subcategoryToUpdate.categoryId;
        const oldOrder = subcategoryToUpdate.order;
        const newOrder = updates.order !== undefined ? updates.order : oldOrder;
        const oldCategoryId = subcategoryToUpdate.categoryId;

        // Se a ordem mudou, precisa reordenar (ordenação global, não por categoria)
        if (oldOrder !== newOrder) {
          // Pega todas as subcategorias do restaurante exceto a que está sendo editada
          const restaurantSubcategories = state.subcategories.filter(
            s => s.restaurantId === restaurantId && s.id !== id
          );
          
          // Reordena as subcategorias afetadas
          const reorderedSubcategories = restaurantSubcategories.map((sub) => {
            if (newOrder < oldOrder) {
              // Movendo para cima: shift para baixo os itens entre newOrder e oldOrder (exclusive)
              if (sub.order >= newOrder && sub.order < oldOrder) {
                return { ...sub, order: sub.order + 1 };
              }
            } else {
              // Movendo para baixo: shift para cima os itens entre oldOrder e newOrder (exclusive)
              if (sub.order > oldOrder && sub.order <= newOrder) {
                return { ...sub, order: sub.order - 1 };
              }
            }
            return sub;
          });

          // Atualiza a subcategoria sendo editada com a nova ordem
          const updatedSubcategory = { ...subcategoryToUpdate, ...updates };

          // Atualiza todas as subcategorias: mantém as de outros restaurantes e atualiza as do restaurante atual
          const otherRestaurantSubcategories = state.subcategories.filter(
            s => s.restaurantId !== restaurantId
          );
          set({
            subcategories: [
              ...otherRestaurantSubcategories,
              ...reorderedSubcategories,
              updatedSubcategory
            ],
          });
        } else {
          // Ordem não mudou, apenas atualiza a subcategoria
          set({
            subcategories: state.subcategories.map((sub) =>
              sub.id === id ? { ...sub, ...updates } : sub
            ),
          });
        }
      },
      deleteSubcategory: (id) => {
        set({
          subcategories: get().subcategories.filter((sub) => sub.id !== id),
        });
      },
      getSubcategoriesByRestaurant: (restaurantId) => {
        const subcategories = get().subcategories.filter((sub) => sub.restaurantId === restaurantId);
        // Ordenar por order
        return subcategories.sort((a, b) => (a.order || 0) - (b.order || 0));
      },
      getFilteredSubcategories: (restaurantId) => {
        const { subcategories, filterActive } = get();
        const restaurantSubcategories = subcategories.filter((sub) => sub.restaurantId === restaurantId);
        const filtered = filterActive === null 
          ? restaurantSubcategories 
          : restaurantSubcategories.filter((sub) => sub.active === filterActive);
        // Ordenar por order
        return filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
      },
    }),
    {
      name: 'subcategories-storage',
      migrate: (persistedState: any, version: number) => {
        // Migração: adiciona restaurantId e order aos dados antigos ou reseta para mocks
        if (persistedState?.subcategories) {
          const hasRestaurantId = persistedState.subcategories.every((sub: any) => 'restaurantId' in sub);
          const hasOrder = persistedState.subcategories.every((sub: any) => 'order' in sub);
          
          if (!hasRestaurantId) {
            return {
              ...persistedState,
              subcategories: mockSubcategories,
            };
          }
          
          if (!hasOrder) {
            // Adiciona order aos dados existentes
            return {
              ...persistedState,
              subcategories: persistedState.subcategories.map((sub: any, index: number) => ({
                ...sub,
                order: sub.order !== undefined ? sub.order : index + 1,
              })),
            };
          }
        }
        return persistedState;
      },
    }
  )
);

