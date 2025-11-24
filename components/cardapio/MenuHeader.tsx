'use client';

import { useRouter } from 'next/navigation';

interface MenuHeaderProps {
  restaurantName: string;
  mainColor: string;
  logo: string | null;
  showBackButton?: boolean;
  backUrl?: string;
  zIndex?: number;
}

export function MenuHeader({
  restaurantName,
  mainColor,
  logo,
  showBackButton = false,
  backUrl,
  zIndex = 10,
}: MenuHeaderProps) {
  const router = useRouter();

  return (
    <header
      className="sticky top-0 shadow-lg bg-white"
      style={{ zIndex }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4">
          {logo && (
            <img
              src={logo}
              alt={restaurantName}
              className="w-16 h-16 object-contain rounded-lg"
            />
          )}
          <div className={showBackButton ? 'flex-1' : ''}>
            <h1
              className="text-2xl md:text-3xl font-bold"
              style={{ color: mainColor }}
            >
              {restaurantName || 'Cardápio Digital'}
            </h1>
            <p className="text-sm mt-1 text-gray-600">
              Cardápio Digital
            </p>
          </div>
          {showBackButton && backUrl && (
            <button
              onClick={() => router.push(backUrl)}
              className="px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-80"
              style={{ 
                backgroundColor: mainColor,
                color: '#ffffff'
              }}
            >
              Voltar
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

