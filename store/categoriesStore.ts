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
        const newId = Math.max(...get().categories.map(c => c.id), 0) + 1;
        // Se não tiver order definido, pega o maior order do restaurante + 1
        const restaurantCategories = get().categories.filter(c => c.restaurantId === restaurantId);
        const maxOrder = restaurantCategories.length > 0 
          ? Math.max(...restaurantCategories.map(c => c.order || 0))
          : 0;
        set({
          categories: [...get().categories, { 
            ...category, 
            id: newId, 
            restaurantId,
            order: category.order !== undefined ? category.order : maxOrder + 1
          }],
        });
      },
      updateCategory: (id, updates) => {
        set({
          categories: get().categories.map((cat) =>
            cat.id === id ? { ...cat, ...updates } : cat
          ),
        });
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

