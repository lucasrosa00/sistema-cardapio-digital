import { create } from 'zustand';
import type { PublicMenuDto } from '@/lib/api/types';

interface MenuState {
  menus: Record<string, PublicMenuDto>; // slug -> menu
  setMenu: (slug: string, menu: PublicMenuDto) => void;
  getMenu: (slug: string) => PublicMenuDto | null;
  clearMenu: (slug: string) => void;
  clearAllMenus: () => void;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  menus: {},

  setMenu: (slug, menu) => {
    set((state) => ({
      menus: {
        ...state.menus,
        [slug]: menu,
      },
    }));
  },

  getMenu: (slug) => {
    return get().menus[slug] || null;
  },

  clearMenu: (slug) => {
    set((state) => {
      const { [slug]: _, ...rest } = state.menus;
      return { menus: rest };
    });
  },

  clearAllMenus: () => {
    set({ menus: {} });
  },
}));

