'use client';

import { useAuthStore } from '@/store/authStore';
import { useRestaurantConfigStore } from '@/store/restaurantConfigStore';
import { useEffect, useState } from 'react';

interface SpinnerProps {
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  color, 
  size = 'md',
  className = '' 
}) => {
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const getConfig = useRestaurantConfigStore((state) => state.getConfig);
  const [spinnerColor, setSpinnerColor] = useState<string>(color || '#3b82f6');

  useEffect(() => {
    if (color) {
      setSpinnerColor(color);
    } else if (restaurantId) {
      const config = getConfig(restaurantId);
      if (config?.mainColor) {
        setSpinnerColor(config.mainColor);
      }
    }
  }, [color, restaurantId, getConfig]);

  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`inline-block ${className}`}>
      <div
        className={`${sizeClasses[size]} border-t-transparent border-r-transparent rounded-full animate-spin`}
        style={{
          borderColor: spinnerColor,
          borderTopColor: 'transparent',
          borderRightColor: 'transparent',
        }}
      />
    </div>
  );
};

