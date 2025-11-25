// Serviço de pedidos
import { api } from './client';
import type {
  CreateOrderDto,
  OrderDto,
} from './types';

export const ordersService = {
  /**
   * Cria um novo pedido
   */
  async create(data: CreateOrderDto): Promise<OrderDto> {
    const response = await api.post<OrderDto>('/api/Orders', data);
    return response.data;
  },
};

