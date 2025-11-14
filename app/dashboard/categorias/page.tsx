'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCategoriesStore } from '@/store/categoriesStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function CategoriasPage() {
  const router = useRouter();
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const {
    getFilteredCategories,
    filterActive,
    setFilterActive,
    deleteCategory,
  } = useCategoriesStore();

  const categories = restaurantId ? getFilteredCategories(restaurantId) : [];
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) {
      return;
    }
    setDeletingId(id);
    // Simula delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    deleteCategory(id);
    setDeletingId(null);
  };

  const handleEdit = (id: number) => {
    router.push(`/dashboard/categorias/editar/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="mb-4">
              <Button
                variant="secondary"
                onClick={() => router.push('/dashboard')}
                className="mb-4"
              >
                ← Voltar
              </Button>
            </div>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
              <Button
                variant="primary"
                onClick={() => router.push('/dashboard/categorias/cadastrar')}
              >
                Cadastrar
              </Button>
            </div>

            {/* Filtro */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterActive(null)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${filterActive === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterActive(true)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${filterActive === true
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                Ativos
              </button>
              <button
                onClick={() => setFilterActive(false)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${filterActive === false
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }
                `}
              >
                Inativos
              </button>
            </div>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto -mx-6 px-6" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '640px' }}>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ordem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Nenhuma categoria encontrada
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {category.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {category.order || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {category.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge active={category.active} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            onClick={() => handleEdit(category.id)}
                            className="px-3 py-1 text-xs"
                          >
                            Editar
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => handleDelete(category.id)}
                            disabled={deletingId === category.id}
                            isLoading={deletingId === category.id}
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200"
                          >
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

