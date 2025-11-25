'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useRestaurantConfigStore } from '@/store/restaurantConfigStore';

export default function DashboardPage() {
  const router = useRouter();
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const restaurantNameFromAuth = useAuthStore((state) => state.restaurantName);
  const getConfig = useRestaurantConfigStore((state) => state.getConfig);
  const loadConfig = useRestaurantConfigStore((state) => state.loadConfig);
  
  const [restaurantName, setRestaurantName] = useState<string | null>(restaurantNameFromAuth);
  const [tableOrderEnabled, setTableOrderEnabled] = useState(false);

  // Carregar nome do restaurante e configurações da API ao montar
  useEffect(() => {
    if (restaurantId) {
      loadConfig(restaurantId)
        .then(() => {
          const config = getConfig(restaurantId);
          // Prioriza o nome da API, se não tiver usa o do authStore
          if (config) {
            setRestaurantName(config.restaurantName || restaurantNameFromAuth || 'Restaurante');
            setTableOrderEnabled(config.tableOrderEnabled);
          } else {
            setRestaurantName(restaurantNameFromAuth || 'Restaurante');
            setTableOrderEnabled(false);
          }
        })
        .catch((error) => {
          console.error('Erro ao carregar configuração:', error);
          // Em caso de erro, usa o nome do authStore
          setRestaurantName(restaurantNameFromAuth || 'Restaurante');
          setTableOrderEnabled(false);
        });
    }
  }, [restaurantId, restaurantNameFromAuth, loadConfig, getConfig]);

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Bem-vindo, {restaurantName || 'Restaurante'}!
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">ID do Restaurante</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{restaurantId}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Nome</p>
                <p className="text-lg font-semibold text-green-900 mt-1">{restaurantName}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-medium">Status</p>
                <p className="text-lg font-semibold text-purple-900 mt-1">Ativo</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Gerenciamento do Cardápio
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => router.push('/dashboard/categorias')}
                className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Categorias
                </h3>
                <p className="text-sm text-gray-600">
                  Gerencie as categorias do seu cardápio
                </p>
              </button>
              <button
                onClick={() => router.push('/dashboard/subcategorias')}
                className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Subcategorias
                </h3>
                <p className="text-sm text-gray-600">
                  Organize produtos em subcategorias
                </p>
              </button>
              <button
                onClick={() => router.push('/dashboard/produtos')}
                className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Produtos
                </h3>
                <p className="text-sm text-gray-600">
                  Cadastre e gerencie os produtos do cardápio
                </p>
              </button>
            </div>
          </div>

          {tableOrderEnabled && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Gerenciamento de Mesas e Pedidos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => router.push('/dashboard/mesas')}
                  className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all text-left"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Mesas
                  </h3>
                  <p className="text-sm text-gray-600">
                    Gerencie as mesas do restaurante
                  </p>
                </button>
                <button
                  onClick={() => router.push('/dashboard/pedidos')}
                  className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all text-left"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Pedidos
                  </h3>
                  <p className="text-sm text-gray-600">
                    Visualize e gerencie os pedidos recebidos
                  </p>
                </button>
              </div>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Configurações
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => router.push('/dashboard/configuracoes')}
                className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Identidade Visual
                </h3>
                <p className="text-sm text-gray-600">
                  Configure o nome, logo, cores e tema do seu cardápio
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

