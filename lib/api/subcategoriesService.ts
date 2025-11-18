// Serviço de subcategorias
import { api } from './client';
import type {
  SubcategoryDto,
  CreateSubcategoryDto,
  UpdateSubcategoryDto,
} from './types';

export const subcategoriesService = {
  /**
   * Lista todas as subcategorias
   */
  async getAll(): Promise<SubcategoryDto[]> {
    const response = await api.get<SubcategoryDto[]>('/api/Subcategories');
    return response.data || [];
  },

  /**
   * Lista subcategorias por categoria
   */
  async getByCategory(categoryId: number): Promise<SubcategoryDto[]> {
    const response = await api.get<SubcategoryDto[]>(
      `/api/Subcategories/category/${categoryId}`
    );
    return response.data || [];
  },

  /**
   * Obtém uma subcategoria por ID
   */
  async getById(id: number): Promise<SubcategoryDto> {
    const response = await api.get<SubcategoryDto>(`/api/Subcategories/${id}`);
    return response.data;
  },

  /**
   * Cria uma nova subcategoria
   */
  async create(data: CreateSubcategoryDto): Promise<SubcategoryDto> {
    const response = await api.post<SubcategoryDto>('/api/Subcategories', data);
    return response.data;
  },

  /**
   * Atualiza uma subcategoria
   */
  async update(id: number, data: UpdateSubcategoryDto): Promise<SubcategoryDto> {
    const response = await api.put<SubcategoryDto>(
      `/api/Subcategories/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Deleta uma subcategoria
   */
  async delete(id: number): Promise<boolean> {
    const response = await api.delete<boolean>(`/api/Subcategories/${id}`);
    return response.data;
  },
};

