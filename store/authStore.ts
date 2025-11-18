import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/lib/api/authService';
import type { LoginResponseDto } from '@/lib/api/types';

interface AuthState {
  restaurantId: number | null;
  restaurantName: string | null;
  userLogin: string | null;
  token: string | null;
  login: (id: number, name: string, token: string) => void;
  loginWithApi: (login: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
  initializeUserLogin: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      restaurantId: null,
      restaurantName: null,
      userLogin: null,
      token: null,
      login: (id: number, name: string, token: string) => {
        set({ restaurantId: id, restaurantName: name, token });
      },
      loginWithApi: async (login: string, password: string) => {
        const response = await authService.login(login, password);
        
        // Extrair nome do usuário do token JWT como fallback
        let userNameFromToken: string | null = null;
        if (response.token) {
          try {
            // JWT tem formato: header.payload.signature
            const payload = response.token.split('.')[1];
            const decoded = JSON.parse(atob(payload));
            // O nome está em: http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name
            userNameFromToken = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || null;
          } catch (error) {
            console.error('Erro ao decodificar token:', error);
          }
        }
        
        const userLoginValue = response.user?.login || response.user?.email || userNameFromToken || login;
        
        set({
          restaurantId: response.user.restaurantId,
          restaurantName: response.restaurant && response.restaurant.restaurantName || null,
          userLogin: userLoginValue,
          token: response.token || null,
        });
      },
      logout: () => {
        set({ restaurantId: null, restaurantName: null, userLogin: null, token: null });
      },
      isAuthenticated: () => {
        return get().restaurantId !== null && get().token !== null;
      },
      initializeUserLogin: () => {
        const state = get();
        // Se já tem userLogin, não precisa fazer nada
        if (state.userLogin) {
          return;
        }
        
        // Se tem token mas não tem userLogin, extrai do token
        if (state.token) {
          try {
            const payload = state.token.split('.')[1];
            const decoded = JSON.parse(atob(payload));
            const userNameFromToken = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || null;
            if (userNameFromToken) {
              set({ userLogin: userNameFromToken });
            }
          } catch (error) {
            console.error('Erro ao decodificar token:', error);
          }
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

