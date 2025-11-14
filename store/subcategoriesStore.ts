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
        const newId = Math.max(...get().subcategories.map(s => s.id), 0) + 1;
        // Se não tiver order definido, pega o maior order da categoria + 1
        const categorySubcategories = get().subcategories.filter(
          s => s.restaurantId === restaurantId && s.categoryId === subcategory.categoryId
        );
        const maxOrder = categorySubcategories.length > 0 
          ? Math.max(...categorySubcategories.map(s => s.order || 0))
          : 0;
        set({
          subcategories: [...get().subcategories, { 
            ...subcategory, 
            id: newId, 
            restaurantId,
            order: subcategory.order !== undefined ? subcategory.order : maxOrder + 1
          }],
        });
      },
      updateSubcategory: (id, updates) => {
        set({
          subcategories: get().subcategories.map((sub) =>
            sub.id === id ? { ...sub, ...updates } : sub
          ),
        });
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

