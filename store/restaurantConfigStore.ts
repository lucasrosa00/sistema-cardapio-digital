import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RestaurantConfig {
  restaurantName: string;
  mainColor: string;
  logo: string | null;
  darkMode: boolean;
}

interface RestaurantConfigState {
  configs: Record<number, RestaurantConfig>;
  getConfig: (restaurantId: number) => RestaurantConfig;
  updateConfig: (restaurantId: number, updates: Partial<RestaurantConfig>) => void;
  resetConfig: (restaurantId: number) => void;
  initializeConfig: (restaurantId: number, restaurantName: string) => void;
}

const defaultConfig: RestaurantConfig = {
  restaurantName: "Exemplo Restaurante",
  mainColor: "#ff0000",
  logo: null,
  darkMode: false,
};

export const useRestaurantConfigStore = create<RestaurantConfigState>()(
  persist(
    (set, get) => ({
      configs: {},
      getConfig: (restaurantId: number) => {
        const configs = get().configs;
        if (!configs[restaurantId]) {
          // Retorna config padrão se não existir
          return defaultConfig;
        }
        return configs[restaurantId];
      },
      updateConfig: (restaurantId: number, updates: Partial<RestaurantConfig>) => {
        set((state) => {
          const currentConfig = state.configs[restaurantId] || defaultConfig;
          return {
            configs: {
              ...state.configs,
              [restaurantId]: { ...currentConfig, ...updates },
            },
          };
        });
      },
      resetConfig: (restaurantId: number) => {
        set((state) => ({
          configs: {
            ...state.configs,
            [restaurantId]: defaultConfig,
          },
        }));
      },
      initializeConfig: (restaurantId: number, restaurantName: string) => {
        const configs = get().configs;
        if (!configs[restaurantId]) {
          set((state) => ({
            configs: {
              ...state.configs,
              [restaurantId]: {
                ...defaultConfig,
                restaurantName,
              },
            },
          }));
        }
      },
    }),
    {
      name: 'restaurant-config-storage',
    }
  )
);

