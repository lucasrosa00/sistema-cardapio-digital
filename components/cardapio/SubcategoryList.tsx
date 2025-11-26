'use client';

import { Subcategory } from '@/lib/mockData';

interface SubcategoryListProps {
  subcategories: Subcategory[];
  selectedSubcategoryId: number | null;
  onSelectSubcategory: (subcategoryId: number) => void;
  mainColor: string;
  darkMode: boolean;
}

export function SubcategoryList({
  subcategories,
  selectedSubcategoryId,
  onSelectSubcategory,
  mainColor,
  darkMode,
}: SubcategoryListProps) {
  if (subcategories.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="flex gap-3 px-4 sm:px-6 lg:px-8 py-0 sm:py-4" style={{ minWidth: 'max-content' }}>
        {subcategories.map((subcategory) => {
          const isSelected = selectedSubcategoryId === subcategory.id;
          return (
            <button
              key={subcategory.id}
              onClick={() => onSelectSubcategory(subcategory.id)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm md:text-base
                transition-all duration-200 whitespace-nowrap
                ${isSelected
                  ? 'shadow-lg transform scale-105'
                  : 'hover:opacity-80'
                }
              `}
              style={{
                backgroundColor: isSelected ? mainColor : darkMode ? '#2F2F2F' : '#e5e7eb',
                color: isSelected ? '#ffffff' : darkMode ? '#ffffff' : '#4b5563',
                border: isSelected ? `2px solid ${mainColor}` : '2px solid transparent',
              }}
            >
              {subcategory.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}

