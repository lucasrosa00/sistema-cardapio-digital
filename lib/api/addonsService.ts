// Serviço de adicionais
import { api } from './client';
import type {
  AddonDto,
  CreateAddonDto,
  UpdateAddonDto,
  ProductAddonDto,
} from './types';

export const addonsService = {
  /**
   * Lista todos os adicionais
   */
  async getAll(): Promise<AddonDto[]> {
    const response = await api.get<AddonDto[]>('/api/addons');
    return response.data || [];
  },

  /**
   * Obtém um adicional por ID
   */
  async getById(id: number): Promise<AddonDto> {
    const response = await api.get<AddonDto>(`/api/addons/${id}`);
    return response.data;
  },

  /**
   * Lista adicionais por categoria
   */
  async getByCategory(categoryId: number): Promise<AddonDto[]> {
    const response = await api.get<AddonDto[]>(`/api/addons/category/${categoryId}`);
    return response.data || [];
  },

  /**
   * Lista adicionais por produto
   */
  async getByProduct(productId: number): Promise<ProductAddonDto[]> {
    const response = await api.get<ProductAddonDto[]>(`/api/addons/product/${productId}`);
    return response.data || [];
  },

  /**
   * Cria um novo adicional
   */
  async create(data: CreateAddonDto): Promise<AddonDto> {
    const response = await api.post<AddonDto>('/api/addons', data);
    return response.data;
  },

  /**
   * Atualiza um adicional
   */
  async update(id: number, data: UpdateAddonDto): Promise<AddonDto> {
    const response = await api.put<AddonDto>(`/api/addons/${id}`, data);
    return response.data;
  },

  /**
   * Deleta um adicional
   */
  async delete(id: number): Promise<boolean> {
    const response = await api.delete<boolean>(`/api/addons/${id}`);
    return response.data;
  },
};

