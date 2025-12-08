import { create } from 'zustand';
import { restaurantService } from '@/lib/api/restaurantService';
import type { RestaurantConfigDto } from '@/lib/api/types';

export interface RestaurantConfig {
  restaurantName: string;
  serviceType: 'Menu' | 'Catalog';
  mainColor: string;
  logo: string | null;
  backgroundImage: string | null;
  darkMode: boolean;
  tableOrderEnabled: boolean;
  whatsAppOrderEnabled: boolean;
  whatsAppNumber: string | null;
  paymentMethods: string | null;
  address: string | null;
  about: string | null;
  openingHours: string | null;
  mapUrl: string | null;
  deliveryFee: number;
}

// Função helper para converter RestaurantConfigDto para RestaurantConfig
const dtoToConfig = (dto: RestaurantConfigDto): RestaurantConfig => ({
  restaurantName: dto.restaurantName && dto.restaurantName.trim() !== '' ? dto.restaurantName : '',
  serviceType: dto.serviceType === 'Catalog' ? 'Catalog' : 'Menu',
  mainColor: dto.mainColor && dto.mainColor.trim() !== '' ? dto.mainColor : '#ff0000',
  logo: dto.logo && dto.logo.trim() !== '' ? dto.logo : null,
  backgroundImage: dto.backgroundImage && dto.backgroundImage.trim() !== '' ? dto.backgroundImage : null,
  darkMode: dto.darkMode ?? false,
  tableOrderEnabled: dto.tableOrderEnabled ?? false,
  whatsAppOrderEnabled: dto.whatsAppOrderEnabled ?? false,
  whatsAppNumber: dto.whatsAppNumber && dto.whatsAppNumber.trim() !== '' ? dto.whatsAppNumber : null,
  paymentMethods: dto.paymentMethods && dto.paymentMethods.trim() !== '' ? dto.paymentMethods : null,
  address: dto.address && dto.address.trim() !== '' ? dto.address : null,
  about: dto.about && dto.about.trim() !== '' ? dto.about : null,
  openingHours: dto.openingHours && dto.openingHours.trim() !== '' ? dto.openingHours : null,
  mapUrl: dto.mapUrl && dto.mapUrl.trim() !== '' ? dto.mapUrl : null,
  deliveryFee: dto.deliveryFee ?? 0,
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
    console.log('getConfig', restaurantId);
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
        serviceType: updates.serviceType !== undefined ? updates.serviceType : undefined,
        mainColor: updates.mainColor !== undefined ? updates.mainColor : undefined,
        logo: updates.logo !== undefined ? updates.logo : undefined,
        backgroundImage: updates.backgroundImage !== undefined ? updates.backgroundImage : undefined,
        darkMode: updates.darkMode !== undefined ? updates.darkMode : undefined,
        tableOrderEnabled: updates.tableOrderEnabled !== undefined ? updates.tableOrderEnabled : undefined,
        whatsAppOrderEnabled: updates.whatsAppOrderEnabled !== undefined ? updates.whatsAppOrderEnabled : undefined,
        whatsAppNumber: updates.whatsAppNumber !== undefined ? updates.whatsAppNumber : undefined,
        paymentMethods: updates.paymentMethods !== undefined ? updates.paymentMethods : undefined,
        address: updates.address !== undefined ? updates.address : undefined,
        about: updates.about !== undefined ? updates.about : undefined,
        openingHours: updates.openingHours !== undefined ? updates.openingHours : undefined,
        mapUrl: updates.mapUrl !== undefined ? updates.mapUrl : undefined,
        deliveryFee: updates.deliveryFee !== undefined ? updates.deliveryFee : undefined,
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

