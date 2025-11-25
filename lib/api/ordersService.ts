// Serviço de pedidos
import { api } from './client';
import type {
  CreateOrderDto,
  OrderDto,
  OrderResponseDto,
  UpdateOrderStatusDto,
} from './types';

export const ordersService = {
  /**
   * Cria um novo pedido
   */
  async create(data: CreateOrderDto): Promise<OrderDto> {
    const response = await api.post<OrderDto>('/api/Orders', data);
    return response.data;
  },

  /**
   * Lista todos os pedidos (opcionalmente filtrado por status)
   */
  async getAll(status?: string): Promise<OrderResponseDto[]> {
    const endpoint = status ? `/api/Orders?status=${status}` : '/api/Orders';
    const response = await api.get<OrderResponseDto[]>(endpoint);
    return response.data || [];
  },

  /**
   * Obtém um pedido por ID
   */
  async getById(id: number): Promise<OrderResponseDto> {
    const response = await api.get<OrderResponseDto>(`/api/Orders/${id}`);
    return response.data;
  },

  /**
   * Atualiza o status de um pedido
   */
  async updateStatus(id: number, status: string): Promise<OrderResponseDto> {
    const response = await api.put<OrderResponseDto>(`/api/Orders/${id}/status`, { status });
    return response.data;
  },

  /**
   * Deleta um pedido
   */
  async delete(id: number): Promise<boolean> {
    const response = await api.delete<boolean>(`/api/Orders/${id}`);
    return response.data;
  },
};

