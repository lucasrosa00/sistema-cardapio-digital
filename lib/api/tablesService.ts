// Serviço de mesas
import { api } from './client';
import type {
  TableDto,
  CreateTableDto,
  UpdateTableDto,
} from './types';

export const tablesService = {
  /**
   * Lista todas as mesas
   */
  async getAll(): Promise<TableDto[]> {
    const response = await api.get<TableDto[]>('/api/Tables');
    return response.data || [];
  },

  /**
   * Obtém uma mesa por ID
   */
  async getById(id: number): Promise<TableDto> {
    const response = await api.get<TableDto>(`/api/Tables/${id}`);
    return response.data;
  },

  /**
   * Cria uma nova mesa
   */
  async create(data: CreateTableDto): Promise<TableDto> {
    const response = await api.post<TableDto>('/api/Tables', data);
    return response.data;
  },

  /**
   * Atualiza uma mesa
   */
  async update(id: number, data: UpdateTableDto): Promise<TableDto> {
    const response = await api.put<TableDto>(`/api/Tables/${id}`, data);
    return response.data;
  },

  /**
   * Deleta uma mesa
   */
  async delete(id: number): Promise<boolean> {
    const response = await api.delete<boolean>(`/api/Tables/${id}`);
    return response.data;
  },
};

