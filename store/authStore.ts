import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  restaurantId: number | null;
  restaurantName: string | null;
  login: (id: number, name: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      restaurantId: null,
      restaurantName: null,
      login: (id: number, name: string) => {
        set({ restaurantId: id, restaurantName: name });
      },
      logout: () => {
        set({ restaurantId: null, restaurantName: null });
      },
      isAuthenticated: () => {
        return get().restaurantId !== null;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

