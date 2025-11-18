// Serviço de categorias
import { api } from './client';
import type {
  CategoryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './types';

export const categoriesService = {
  /**
   * Lista todas as categorias
   */
  async getAll(): Promise<CategoryDto[]> {
    const response = await api.get<CategoryDto[]>('/api/Categories');
    return response.data || [];
  },

  /**
   * Obtém uma categoria por ID
   */
  async getById(id: number): Promise<CategoryDto> {
    const response = await api.get<CategoryDto>(`/api/Categories/${id}`);
    return response.data;
  },

  /**
   * Cria uma nova categoria
   */
  async create(data: CreateCategoryDto): Promise<CategoryDto> {
    const response = await api.post<CategoryDto>('/api/Categories', data);
    return response.data;
  },

  /**
   * Atualiza uma categoria
   */
  async update(id: number, data: UpdateCategoryDto): Promise<CategoryDto> {
    const response = await api.put<CategoryDto>(`/api/Categories/${id}`, data);
    return response.data;
  },

  /**
   * Deleta uma categoria
   */
  async delete(id: number): Promise<boolean> {
    try {
      const response = await api.delete<boolean>(`/api/Categories/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

