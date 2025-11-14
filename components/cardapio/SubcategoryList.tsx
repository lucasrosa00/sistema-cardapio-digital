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
    <div className="flex flex-wrap gap-3 px-4 sm:px-6 lg:px-8 py-4">
      {subcategories.map((subcategory) => {
        const isSelected = selectedSubcategoryId === subcategory.id;
        return (
          <button
            key={subcategory.id}
            onClick={() => onSelectSubcategory(subcategory.id)}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm
              transition-all duration-200
              ${isSelected
                ? 'shadow-md'
                : 'hover:opacity-80'
              }
            `}
            style={{
              backgroundColor: isSelected ? mainColor : darkMode ? '#4b5563' : '#e5e7eb',
              color: isSelected ? '#ffffff' : darkMode ? '#d1d5db' : '#4b5563',
              border: isSelected ? `2px solid ${mainColor}` : '2px solid transparent',
            }}
          >
            {subcategory.title}
          </button>
        );
      })}
    </div>
  );
}

