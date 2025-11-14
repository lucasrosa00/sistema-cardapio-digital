'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useRestaurantConfigStore } from '@/store/restaurantConfigStore';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const router = useRouter();
  const restaurantName = useAuthStore((state) => state.restaurantName);
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

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

  const getConfig = useRestaurantConfigStore((state) => state.getConfig);
  const config = restaurantId ? getConfig(restaurantId) : null;
  const darkMode = config?.darkMode || false;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Bem-vindo, {restaurantName}!
              </p>
            </div>
            <Button variant="secondary" onClick={handleLogout}>
              Sair
            </Button>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">ID do Restaurante</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">{restaurantId}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Nome</p>
                <p className="text-lg font-semibold text-green-900 dark:text-green-100 mt-1">{restaurantName}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Status</p>
                <p className="text-lg font-semibold text-purple-900 dark:text-purple-100 mt-1">Ativo</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Gerenciamento
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => router.push('/dashboard/categorias')}
                className="bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Categorias
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gerencie as categorias do seu cardápio
                </p>
              </button>
              <button
                onClick={() => router.push('/dashboard/subcategorias')}
                className="bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Subcategorias
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Organize produtos em subcategorias
                </p>
              </button>
              <button
                onClick={() => router.push('/dashboard/produtos')}
                className="bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Produtos
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cadastre e gerencie os produtos do cardápio
                </p>
              </button>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Configurações
            </h2>
            <button
              onClick={() => router.push('/dashboard/configuracoes')}
              className="bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all text-left w-full"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Identidade Visual
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure o nome, logo, cores e tema do seu cardápio
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

