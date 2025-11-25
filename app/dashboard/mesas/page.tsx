'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { tablesService } from '@/lib/api/tablesService';
import type { TableDto } from '@/lib/api/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

const ITEMS_PER_PAGE = 12;

export default function MesasPage() {
  const router = useRouter();
  const restaurantId = useAuthStore((state) => state.restaurantId);
  
  const [tables, setTables] = useState<TableDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<TableDto | null>(null);

  // Carregar mesas ao montar o componente
  useEffect(() => {
    if (restaurantId) {
      loadTables();
    }
  }, [restaurantId]);

  const loadTables = async () => {
    setIsLoading(true);
    try {
      const data = await tablesService.getAll();
      setTables(data);
    } catch (error) {
      console.error('Erro ao carregar mesas:', error);
      alert('Erro ao carregar mesas. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar mesas
  const filteredTables = filterActive === null
    ? tables
    : tables.filter(table => table.active === filterActive);

  // Resetar para página 1 quando o filtro mudar
  useEffect(() => {
    setCurrentPage(1);
  }, [filterActive]);

  // Ajustar página quando o número de itens mudar
  useEffect(() => {
    const totalPages = Math.ceil(filteredTables.length / ITEMS_PER_PAGE);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredTables.length, currentPage]);

  // Calcular paginação
  const totalPages = Math.ceil(filteredTables.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTables = filteredTables.slice(startIndex, endIndex);

  const handleDeleteClick = (table: TableDto) => {
    setTableToDelete(table);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tableToDelete) return;
    
    setDeletingId(tableToDelete.id);
    try {
      await tablesService.delete(tableToDelete.id);
      await loadTables();
      setShowDeleteModal(false);
      setTableToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir mesa:', error);
      alert('Erro ao excluir mesa. Tente novamente.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/dashboard/mesas/editar/${id}`);
  };

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
              <h1 className="text-2xl font-bold text-gray-900">Mesas</h1>
              <Button
                variant="primary"
                onClick={() => router.push('/dashboard/mesas/cadastrar')}
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
                Todas
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
                Ativas
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
                Inativas
              </button>
            </div>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
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
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <Spinner size="md" color="#3b82f6" />
                      </div>
                    </td>
                  </tr>
                ) : filteredTables.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      Nenhuma mesa encontrada
                    </td>
                  </tr>
                ) : (
                  paginatedTables.map((table) => (
                    <tr key={table.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {table.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {table.number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge active={table.active} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            onClick={() => handleEdit(table.id)}
                            className="px-3 py-1 text-xs"
                          >
                            Editar
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => handleDeleteClick(table)}
                            disabled={deletingId === table.id}
                            isLoading={deletingId === table.id}
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

          {/* Controles de Paginação */}
          {filteredTables.length > ITEMS_PER_PAGE && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700 text-center sm:text-left">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, filteredTables.length)} de {filteredTables.length} mesas
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm"
                  >
                    Anterior
                  </Button>
                  <div className="text-sm text-gray-700 whitespace-nowrap">
                    Página {currentPage} de {totalPages}
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm"
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmação */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setTableToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir a mesa "${tableToDelete?.number}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deletingId !== null}
      />
    </div>
  );
}

