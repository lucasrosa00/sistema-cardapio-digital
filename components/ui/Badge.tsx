import React from 'react';

interface BadgeProps {
  active: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ active, className = '' }) => {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${active 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
        }
        ${className}
      `}
    >
      {active ? 'Ativo' : 'Inativo'}
    </span>
  );
};

