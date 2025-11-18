import { create } from 'zustand';
import { Category } from '@/lib/mockData';
import { categoriesService } from '@/lib/api/categoriesService';
import type { CategoryDto } from '@/lib/api/types';

// Função helper para converter CategoryDto para Category
const dtoToCategory = (dto: CategoryDto): Category => ({
  id: dto.id,
  restaurantId: dto.restaurantId,
  title: dto.title || '',
  active: dto.active,
  order: dto.order,
});

interface CategoriesState {
  categories: Category[];
  filterActive: boolean | null;
  isLoading: boolean;
  setFilterActive: (value: boolean | null) => void;
  loadCategories: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>, restaurantId: number) => Promise<void>;
  updateCategory: (id: number, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  getFilteredCategories: (restaurantId: number) => Category[];
  getCategoriesByRestaurant: (restaurantId: number) => Category[];
}

export const useCategoriesStore = create<CategoriesState>()((set, get) => ({
  categories: [],
  filterActive: null,
  isLoading: false,
  setFilterActive: (value) => set({ filterActive: value }),
  loadCategories: async () => {
    set({ isLoading: true });
    try {
      const categoriesDto = await categoriesService.getAll();
      const categories = categoriesDto.map(dtoToCategory);
      set({ categories, isLoading: false });
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  addCategory: async (category, restaurantId) => {
    try {
      // Se a ordem está sendo usada, precisa reordenar outras categorias
      const restaurantCategories = get().categories
        .filter(c => c.restaurantId === restaurantId)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      
      const newOrder = category.order;
      const categoriesToUpdate: Array<{ id: number; newOrder: number }> = [];
      
      // Categorias com ordem >= newOrder precisam descer
      restaurantCategories.forEach(cat => {
        if (cat.order >= newOrder) {
          categoriesToUpdate.push({ id: cat.id, newOrder: cat.order + 1 });
        }
      });
      
      // Atualizar todas as categorias afetadas
      const updatePromises = categoriesToUpdate.map(({ id: catId, newOrder: order }) =>
        categoriesService.update(catId, { order })
      );
      
      // Criar a nova categoria
      const createPromise = categoriesService.create({
        title: category.title,
        active: category.active,
        order: newOrder,
      });
      
      // Executar todas as operações
      const [newCategoryDto, ...updatedCategories] = await Promise.all([
        createPromise,
        ...updatePromises,
      ]);
      
      const newCategory = dtoToCategory(newCategoryDto);
      
      // Atualizar o store
      set((state) => {
        const updatedMap = new Map(updatedCategories.map(dto => [dto.id, dtoToCategory(dto)]));
        return {
          categories: [
            ...state.categories.map((cat) => {
              const updated = updatedMap.get(cat.id);
              return updated || cat;
            }),
            newCategory,
          ],
        };
      });
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw error;
    }
  },
  updateCategory: async (id, updates) => {
    try {
      const categoryToUpdate = get().categories.find(c => c.id === id);
      if (!categoryToUpdate) return;

      // Se a ordem está sendo alterada, precisa reordenar outras categorias
      if (updates.order !== undefined && updates.order !== categoryToUpdate.order) {
        const restaurantId = categoryToUpdate.restaurantId;
        const restaurantCategories = get().categories
          .filter(c => c.restaurantId === restaurantId && c.id !== id)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        
        const oldOrder = categoryToUpdate.order;
        const newOrder = updates.order;
        
        // Calcular novas ordens para todas as categorias
        const categoriesToUpdate: Array<{ id: number; newOrder: number }> = [];
        
        if (newOrder < oldOrder) {
          // Movendo para cima: categorias entre newOrder e oldOrder-1 precisam descer
          restaurantCategories.forEach(cat => {
            if (cat.order >= newOrder && cat.order < oldOrder) {
              categoriesToUpdate.push({ id: cat.id, newOrder: cat.order + 1 });
            }
          });
        } else {
          // Movendo para baixo: categorias entre oldOrder+1 e newOrder precisam subir
          restaurantCategories.forEach(cat => {
            if (cat.order > oldOrder && cat.order <= newOrder) {
              categoriesToUpdate.push({ id: cat.id, newOrder: cat.order - 1 });
            }
          });
        }
        
        // Atualizar todas as categorias afetadas
        const updatePromises = categoriesToUpdate.map(({ id: catId, newOrder: order }) =>
          categoriesService.update(catId, { order })
        );
        
        // Atualizar a categoria principal
        updatePromises.push(
          categoriesService.update(id, {
            title: updates.title !== undefined ? updates.title : undefined,
            active: updates.active !== undefined ? updates.active : undefined,
            order: newOrder,
          })
        );
        
        // Executar todas as atualizações
        const updatedCategories = await Promise.all(updatePromises);
        
        // Atualizar o store com todas as categorias atualizadas
        set((state) => {
          const updatedMap = new Map(updatedCategories.map(dto => [dto.id, dtoToCategory(dto)]));
          return {
            categories: state.categories.map((cat) => {
              const updated = updatedMap.get(cat.id);
              return updated || cat;
            }),
          };
        });
      } else {
        // Se não está alterando a ordem, atualizar normalmente
        const updatedCategoryDto = await categoriesService.update(id, {
          title: updates.title !== undefined ? updates.title : undefined,
          active: updates.active !== undefined ? updates.active : undefined,
          order: updates.order !== undefined ? updates.order : undefined,
        });
        const updatedCategory = dtoToCategory(updatedCategoryDto);
        
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id ? updatedCategory : cat
          ),
        }));
      }
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      throw error;
    }
  },
  deleteCategory: async (id) => {
    try {
      await categoriesService.delete(id);
      set((state) => ({
        categories: state.categories.filter((cat) => cat.id !== id),
      }));
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      throw error;
    }
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
}));

