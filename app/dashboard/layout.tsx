'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useRestaurantConfigStore } from '@/store/restaurantConfigStore';
import { Button } from '@/components/ui/Button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const restaurantName = useAuthStore((state) => state.restaurantName);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const getConfig = useRestaurantConfigStore((state) => state.getConfig);
  const initializeConfig = useRestaurantConfigStore((state) => state.initializeConfig);

  // Inicializar config se necessário
  useEffect(() => {
    if (restaurantId && restaurantName) {
      initializeConfig(restaurantId, restaurantName);
    }
  }, [restaurantId, restaurantName, initializeConfig]);

  const config = restaurantId ? getConfig(restaurantId) : null;
  const displayName = config?.restaurantName || restaurantName || 'Restaurante';
  const logo = config?.logo;

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Fixo */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm h-16">
        <div className="h-full max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-full">
            {/* Esquerda: Logo e Nome do Restaurante */}
            <div className="flex items-center gap-3 flex-shrink-0 min-w-0">
              {logo && (
                <img
                  src={logo}
                  alt={displayName}
                  className="h-10 w-10 object-contain rounded flex-shrink-0"
                />
              )}
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
                  {displayName}
                </h2>
              </div>
            </div>

            {/* Direita: Usuário Logado */}
            <div className="flex items-center gap-3 flex-shrink-0 min-w-0">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                  {restaurantName || 'Usuário'}
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={handleLogout}
                className="text-sm whitespace-nowrap"
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal com padding para header e footer */}
      <main className="flex-1 pt-16 pb-20 overflow-y-auto">
        {children}
      </main>

      {/* Footer Fixo */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-sm h-16">
        <div className="h-full max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-full">
            <p className="text-xs sm:text-sm text-gray-600 text-center">
              © {new Date().getFullYear()} {displayName} - Sistema de Gerenciamento de Cardápio Digital
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

