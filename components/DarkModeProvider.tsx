'use client';

import { useEffect } from 'react';
import { useRestaurantConfigStore } from '@/store/restaurantConfigStore';
import { useAuthStore } from '@/store/authStore';

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const getConfig = useRestaurantConfigStore((state) => state.getConfig);
  
  const config = restaurantId ? getConfig(restaurantId) : null;
  const darkMode = config?.darkMode || false;

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  return <>{children}</>;
}

