'use client';

import { Category } from '@/lib/mockData';

interface CategoryTabsProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number) => void;
  mainColor: string;
}

export function CategoryTabs({
  categories,
  selectedCategoryId,
  onSelectCategory,
  mainColor,
}: CategoryTabsProps) {
  return (
    <div className="w-full overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="flex gap-3 px-4 sm:px-6 lg:px-8" style={{ minWidth: 'max-content' }}>
        {categories.map((category) => {
          const isSelected = selectedCategoryId === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`
                flex-shrink-0 px-6 py-3 rounded-lg font-semibold text-sm md:text-base
                transition-all duration-200 whitespace-nowrap
                ${isSelected
                  ? 'shadow-lg transform scale-105'
                  : 'hover:opacity-80'
                }
              `}
              style={{
                backgroundColor: isSelected ? mainColor : '#f3f4f6',
                color: isSelected ? '#ffffff' : '#374151',
              }}
            >
              {category.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}

