import { create } from 'zustand';
import { restaurantService } from '@/lib/api/restaurantService';
import type { RestaurantConfigDto } from '@/lib/api/types';

export interface RestaurantConfig {
  restaurantName: string;
  mainColor: string;
  logo: string | null;
}

// Função helper para converter RestaurantConfigDto para RestaurantConfig
const dtoToConfig = (dto: RestaurantConfigDto): RestaurantConfig => ({
  restaurantName: dto.restaurantName && dto.restaurantName.trim() !== '' ? dto.restaurantName : '',
  mainColor: dto.mainColor && dto.mainColor.trim() !== '' ? dto.mainColor : '#ff0000',
  logo: dto.logo && dto.logo.trim() !== '' ? dto.logo : null,
});

interface RestaurantConfigState {
  configs: Record<number, RestaurantConfig>;
  isLoading: boolean;
  getConfig: (restaurantId: number) => RestaurantConfig | null;
  loadConfig: (restaurantId: number) => Promise<void>;
  updateConfig: (restaurantId: number, updates: Partial<RestaurantConfig>) => Promise<void>;
  resetConfig: (restaurantId: number) => void;
}

export const useRestaurantConfigStore = create<RestaurantConfigState>()((set, get) => ({
  configs: {},
  isLoading: false,
  getConfig: (restaurantId: number) => {
    const configs = get().configs;
    // Retorna null se não existir - deve chamar loadConfig primeiro
    return configs[restaurantId] || null;
  },
  loadConfig: async (restaurantId: number) => {
    set({ isLoading: true });
    try {
      // Busca configurações da API
      const configDto = await restaurantService.getConfig();
      const config = dtoToConfig(configDto);
      set((state) => ({
        configs: {
          ...state.configs,
          [restaurantId]: config,
        },
        isLoading: false,
      }));
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  updateConfig: async (restaurantId: number, updates: Partial<RestaurantConfig>) => {
    try {
      // Atualiza na API
      const updatedConfigDto = await restaurantService.updateConfig({
        restaurantName: updates.restaurantName !== undefined ? updates.restaurantName : undefined,
        mainColor: updates.mainColor !== undefined ? updates.mainColor : undefined,
        logo: updates.logo !== undefined ? updates.logo : undefined,
      });
      const updatedConfig = dtoToConfig(updatedConfigDto);
      // Atualiza no store
      set((state) => ({
        configs: {
          ...state.configs,
          [restaurantId]: updatedConfig,
        },
      }));
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      throw error;
    }
  },
  resetConfig: (restaurantId: number) => {
    // Remove a configuração do store (forçará recarregar da API)
    set((state) => {
      const newConfigs = { ...state.configs };
      delete newConfigs[restaurantId];
      return { configs: newConfigs };
    });
  },
}));

