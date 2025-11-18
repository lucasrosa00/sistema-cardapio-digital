// Serviço de restaurante
import { api } from './client';
import type {
  RestaurantConfigDto,
  UpdateRestaurantConfigDto,
  PublicMenuDto,
} from './types';

export const restaurantService = {
  /**
   * Obtém a configuração do restaurante
   */
  async getConfig(): Promise<RestaurantConfigDto> {
    const response = await api.get<RestaurantConfigDto>('/api/Restaurant/config');
    return response.data;
  },

  /**
   * Atualiza a configuração do restaurante
   */
  async updateConfig(
    data: UpdateRestaurantConfigDto
  ): Promise<RestaurantConfigDto> {
    const response = await api.put<RestaurantConfigDto>(
      '/api/Restaurant/config',
      data
    );
    return response.data;
  },

  /**
   * Obtém o menu público por slug
   */
  async getPublicMenu(slug: string): Promise<PublicMenuDto> {
    const response = await api.get<PublicMenuDto>(`/api/public/menu/${slug}`);
    return response.data;
  },
};

