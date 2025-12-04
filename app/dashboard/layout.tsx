'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useRestaurantConfigStore } from '@/store/restaurantConfigStore';
import { Button } from '@/components/ui/Button';
import { getServiceTypeLabel } from '@/lib/utils/serviceType';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const restaurantName = useAuthStore((state) => state.restaurantName);
  const userLogin = useAuthStore((state) => state.userLogin);
  const initializeUserLogin = useAuthStore((state) => state.initializeUserLogin);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  // Inicializar userLogin do token se não existir (para usuários que já estavam logados)
  useEffect(() => {
    if (!userLogin) {
      initializeUserLogin();
    }
  }, [userLogin, initializeUserLogin]);
  const getConfig = useRestaurantConfigStore((state) => state.getConfig);
  const loadConfig = useRestaurantConfigStore((state) => state.loadConfig);
  // Reage às mudanças no store
  const configs = useRestaurantConfigStore((state) => state.configs);
  
  // Carregar configurações da API ao montar
  useEffect(() => {
    if (restaurantId) {
      loadConfig(restaurantId).catch((error) => {
        console.error('Erro ao carregar configuração:', error);
      });
    }
  }, [restaurantId, loadConfig]);

  // Atualiza displayName e logo quando config mudar (reage às mudanças no store)
  const config = restaurantId ? getConfig(restaurantId) : null;
  
  // Debug: verificar o que está vindo
  useEffect(() => {
    if (config) {
      console.log('Config carregada:', {
        restaurantName: config.restaurantName,
        mainColor: config.mainColor,
        logo: config.logo ? 'existe' : 'null',
      });
    }
  }, [config]);
  
  const displayName = config?.restaurantName && config.restaurantName.trim() !== ''
    ? config.restaurantName
    : (restaurantName || 'Restaurante');
  const logo = config?.logo || null;

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
                  {userLogin || 'Usuário'}
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
              © {new Date().getFullYear()} {displayName} - Sistema de Gerenciamento de {getServiceTypeLabel(config?.serviceType)}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

