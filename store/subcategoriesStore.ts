import { create } from 'zustand';
import { Subcategory } from '@/lib/mockData';
import { subcategoriesService } from '@/lib/api/subcategoriesService';
import type { SubcategoryDto } from '@/lib/api/types';

// Função helper para converter SubcategoryDto para Subcategory
const dtoToSubcategory = (dto: SubcategoryDto): Subcategory => ({
  id: dto.id,
  restaurantId: dto.restaurantId,
  categoryId: dto.categoryId,
  title: dto.title || '',
  active: dto.active,
  order: dto.order,
});

interface SubcategoriesState {
  subcategories: Subcategory[];
  filterActive: boolean | null;
  isLoading: boolean;
  setFilterActive: (value: boolean | null) => void;
  loadSubcategories: () => Promise<void>;
  addSubcategory: (subcategory: Omit<Subcategory, 'id'>, restaurantId: number) => Promise<void>;
  updateSubcategory: (id: number, subcategory: Partial<Subcategory>) => Promise<void>;
  deleteSubcategory: (id: number) => Promise<void>;
  getFilteredSubcategories: (restaurantId: number) => Subcategory[];
  getSubcategoriesByRestaurant: (restaurantId: number) => Subcategory[];
}

export const useSubcategoriesStore = create<SubcategoriesState>()((set, get) => ({
  subcategories: [],
  filterActive: null,
  isLoading: false,
  setFilterActive: (value) => set({ filterActive: value }),
  loadSubcategories: async () => {
    set({ isLoading: true });
    try {
      const subcategoriesDto = await subcategoriesService.getAll();
      const subcategories = subcategoriesDto.map(dtoToSubcategory);
      set({ subcategories, isLoading: false });
    } catch (error) {
      console.error('Erro ao carregar subcategorias:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  addSubcategory: async (subcategory, restaurantId) => {
    try {
      // Se a ordem está sendo usada, precisa reordenar outras subcategorias
      const restaurantSubcategories = get().subcategories
        .filter(s => s.restaurantId === restaurantId)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      
      const newOrder = subcategory.order;
      const subcategoriesToUpdate: Array<{ id: number; newOrder: number }> = [];
      
      // Subcategorias com ordem >= newOrder precisam descer
      restaurantSubcategories.forEach(sub => {
        if (sub.order >= newOrder) {
          subcategoriesToUpdate.push({ id: sub.id, newOrder: sub.order + 1 });
        }
      });
      
      // Atualizar todas as subcategorias afetadas
      const updatePromises = subcategoriesToUpdate.map(({ id: subId, newOrder: order }) =>
        subcategoriesService.update(subId, { order })
      );
      
      // Criar a nova subcategoria
      const createPromise = subcategoriesService.create({
        categoryId: subcategory.categoryId,
        title: subcategory.title,
        active: subcategory.active,
        order: newOrder,
      });
      
      // Executar todas as operações
      const [newSubcategoryDto, ...updatedSubcategories] = await Promise.all([
        createPromise,
        ...updatePromises,
      ]);
      
      const newSubcategory = dtoToSubcategory(newSubcategoryDto);
      
      // Atualizar o store
      set((state) => {
        const updatedMap = new Map(updatedSubcategories.map(dto => [dto.id, dtoToSubcategory(dto)]));
        return {
          subcategories: [
            ...state.subcategories.map((sub) => {
              const updated = updatedMap.get(sub.id);
              return updated || sub;
            }),
            newSubcategory,
          ],
        };
      });
    } catch (error) {
      console.error('Erro ao criar subcategoria:', error);
      throw error;
    }
  },
  updateSubcategory: async (id, updates) => {
    try {
      const subcategoryToUpdate = get().subcategories.find(s => s.id === id);
      if (!subcategoryToUpdate) return;

      // Se a ordem está sendo alterada, precisa reordenar outras subcategorias
      if (updates.order !== undefined && updates.order !== subcategoryToUpdate.order) {
        const restaurantId = subcategoryToUpdate.restaurantId;
        const restaurantSubcategories = get().subcategories
          .filter(s => s.restaurantId === restaurantId && s.id !== id)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        
        const oldOrder = subcategoryToUpdate.order;
        const newOrder = updates.order;
        
        // Calcular novas ordens para todas as subcategorias
        const subcategoriesToUpdate: Array<{ id: number; newOrder: number }> = [];
        
        if (newOrder < oldOrder) {
          // Movendo para cima: subcategorias entre newOrder e oldOrder-1 precisam descer
          restaurantSubcategories.forEach(sub => {
            if (sub.order >= newOrder && sub.order < oldOrder) {
              subcategoriesToUpdate.push({ id: sub.id, newOrder: sub.order + 1 });
            }
          });
        } else {
          // Movendo para baixo: subcategorias entre oldOrder+1 e newOrder precisam subir
          restaurantSubcategories.forEach(sub => {
            if (sub.order > oldOrder && sub.order <= newOrder) {
              subcategoriesToUpdate.push({ id: sub.id, newOrder: sub.order - 1 });
            }
          });
        }
        
        // Atualizar todas as subcategorias afetadas
        const updatePromises = subcategoriesToUpdate.map(({ id: subId, newOrder: order }) =>
          subcategoriesService.update(subId, { order })
        );
        
        // Atualizar a subcategoria principal
        updatePromises.push(
          subcategoriesService.update(id, {
            categoryId: updates.categoryId !== undefined ? updates.categoryId : undefined,
            title: updates.title !== undefined ? updates.title : undefined,
            active: updates.active !== undefined ? updates.active : undefined,
            order: newOrder,
          })
        );
        
        // Executar todas as atualizações
        const updatedSubcategories = await Promise.all(updatePromises);
        
        // Atualizar o store com todas as subcategorias atualizadas
        set((state) => {
          const updatedMap = new Map(updatedSubcategories.map(dto => [dto.id, dtoToSubcategory(dto)]));
          return {
            subcategories: state.subcategories.map((sub) => {
              const updated = updatedMap.get(sub.id);
              return updated || sub;
            }),
          };
        });
      } else {
        // Se não está alterando a ordem, atualizar normalmente
        const updatedSubcategoryDto = await subcategoriesService.update(id, {
          categoryId: updates.categoryId !== undefined ? updates.categoryId : undefined,
          title: updates.title !== undefined ? updates.title : undefined,
          active: updates.active !== undefined ? updates.active : undefined,
          order: updates.order !== undefined ? updates.order : undefined,
        });
        const updatedSubcategory = dtoToSubcategory(updatedSubcategoryDto);

        set((state) => ({
          subcategories: state.subcategories.map((sub) =>
            sub.id === id ? updatedSubcategory : sub
          ),
        }));
      }
    } catch (error) {
      console.error('Erro ao atualizar subcategoria:', error);
      throw error;
    }
  },
  deleteSubcategory: async (id) => {
    try {
      await subcategoriesService.delete(id);
      set((state) => ({
        subcategories: state.subcategories.filter((sub) => sub.id !== id),
      }));
    } catch (error) {
      console.error('Erro ao deletar subcategoria:', error);
      throw error;
    }
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
}));

