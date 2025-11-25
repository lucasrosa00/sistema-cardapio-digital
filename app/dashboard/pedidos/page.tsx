'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ordersService } from '@/lib/api/ordersService';
import type { OrderResponseDto } from '@/lib/api/types';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

type OrderStatus = 'Pending' | 'Confirmed' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled';

const STATUS_OPTIONS: OrderStatus[] = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];

const STATUS_COLORS: Record<OrderStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  Confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
  Preparing: 'bg-orange-100 text-orange-800 border-orange-300',
  Ready: 'bg-purple-100 text-purple-800 border-purple-300',
  Delivered: 'bg-green-100 text-green-800 border-green-300',
  Cancelled: 'bg-red-100 text-red-800 border-red-300',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  Pending: 'Pendente',
  Confirmed: 'Confirmado',
  Preparing: 'Preparando',
  Ready: 'Pronto',
  Delivered: 'Entregue',
  Cancelled: 'Cancelado',
};

export default function PedidosPage() {
  const router = useRouter();
  const restaurantId = useAuthStore((state) => state.restaurantId);
  
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [allOrders, setAllOrders] = useState<OrderResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('Pending');
  const [tableFilter, setTableFilter] = useState<string>('');
  const [nameFilter, setNameFilter] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<OrderResponseDto | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('Pending');

  // Carregar pedidos ao montar e quando o filtro de status mudar
  useEffect(() => {
    if (restaurantId) {
      loadOrders();
    }
  }, [restaurantId, statusFilter]);

  // Filtrar pedidos quando filtros de mesa ou nome mudarem
  useEffect(() => {
    if (allOrders.length > 0) {
      filterOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableFilter, nameFilter, allOrders]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await ordersService.getAll(statusFilter);
      // Ordenar pedidos do mais antigo para o mais recente (por data de criação)
      const sortedOrders = [...data].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateA - dateB; // Ordem crescente (mais antigo primeiro)
      });
      setAllOrders(sortedOrders);
      filterOrders(sortedOrders);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      alert('Erro ao carregar pedidos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = (ordersToFilter?: OrderResponseDto[]) => {
    const ordersList = ordersToFilter || allOrders;
    let filtered = [...ordersList];

    // Filtrar por mesa
    if (tableFilter.trim()) {
      filtered = filtered.filter(order =>
        order.tableNumber.toLowerCase().includes(tableFilter.toLowerCase().trim())
      );
    }

    // Filtrar por nome do cliente
    if (nameFilter.trim()) {
      filtered = filtered.filter(order =>
        order.customerName?.toLowerCase().includes(nameFilter.toLowerCase().trim())
      );
    }

    setOrders(filtered);
  };

  const handleStatusChange = (order: OrderResponseDto) => {
    setSelectedOrder(order);
    setNewStatus(order.status as OrderStatus);
    setShowStatusModal(true);
  };

  const handleStatusConfirm = async () => {
    if (!selectedOrder) return;
    
    setUpdatingStatus(true);
    try {
      await ordersService.updateStatus(selectedOrder.id, newStatus);
      await loadOrders();
      setShowStatusModal(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do pedido. Tente novamente.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteClick = (order: OrderResponseDto) => {
    setSelectedOrder(order);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedOrder) return;
    
    try {
      await ordersService.delete(selectedOrder.id);
      await loadOrders();
      setShowDeleteModal(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Erro ao excluir pedido:', error);
      alert('Erro ao excluir pedido. Tente novamente.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Pedidos
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie os pedidos do restaurante
            </p>
          </div>

          {/* Filtros */}
          <div className="mb-6 space-y-4">
            {/* Filtros de Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status:
              </label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      statusFilter === status
                        ? STATUS_COLORS[status] + ' ring-2 ring-offset-2'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtros de Mesa e Nome */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por Mesa:
                </label>
                <input
                  type="text"
                  value={tableFilter}
                  onChange={(e) => setTableFilter(e.target.value)}
                  placeholder="Digite o número da mesa..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por Nome:
                </label>
                <input
                  type="text"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  placeholder="Digite o nome do cliente..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Lista de Pedidos */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" color="#3b82f6" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Nenhum pedido encontrado com status "{STATUS_LABELS[statusFilter]}"
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow flex flex-col h-full"
                >
                  {/* Conteúdo principal (scrollável) */}
                  <div className="flex-1 overflow-y-auto">
                    {/* Header do Card */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Pedido #{order.id}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[order.status as OrderStatus]}`}
                      >
                        {STATUS_LABELS[order.status as OrderStatus]}
                      </span>
                    </div>

                    {/* Informações da Mesa e Cliente */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <span className="text-sm text-gray-600">
                          Mesa {order.tableNumber}
                        </span>
                      </div>
                      {order.customerName && (
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-sm text-gray-600">
                            {order.customerName}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Itens do Pedido */}
                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Itens ({order.items.length}):
                      </p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {order.items.map((item) => (
                          <div key={item.id} className="text-sm text-gray-600">
                            <span className="font-medium">{item.quantity}x</span>{' '}
                            {item.productName}
                            {item.selectedVariation && (
                              <span className="text-gray-400"> ({item.selectedVariation})</span>
                            )}
                            <span className="float-right font-semibold">
                              {formatPrice(item.totalPrice)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Observações */}
                    {order.observations && (
                      <div className="border-t border-gray-200 pt-4 mb-4">
                        <p className="text-xs font-semibold text-gray-700 mb-1">
                          Observações:
                        </p>
                        <p className="text-sm text-gray-600 italic">
                          {order.observations}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer fixo (Total e Ações) */}
                  <div className="mt-auto border-t border-gray-200 pt-4">
                    {/* Total */}
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold text-gray-900">
                        Total:
                      </span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatPrice(order.total)}
                      </span>
                    </div>

                    {/* Ações */}
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        onClick={() => handleStatusChange(order)}
                        className="flex-1"
                      >
                        Alterar Status
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleDeleteClick(order)}
                        className="px-4"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Alteração de Status */}
      {showStatusModal && selectedOrder && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50"
          onClick={() => {
            if (!updatingStatus) {
              setShowStatusModal(false);
              setSelectedOrder(null);
            }
          }}
        >
          <div
            className="min-h-screen px-4 py-8 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Alterar Status do Pedido
              </h2>
              <div className="space-y-4 mb-6">
                <p className="text-gray-700">
                  Pedido #{selectedOrder.id} - Mesa {selectedOrder.tableNumber}
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Novo Status:
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={updatingStatus}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-4 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedOrder(null);
                  }}
                  disabled={updatingStatus}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleStatusConfirm}
                  isLoading={updatingStatus}
                  className="!bg-yellow-600 !text-white hover:!bg-yellow-700 focus:!ring-yellow-500 disabled:!bg-yellow-400"
                >
                  {updatingStatus ? 'Atualizando...' : 'Confirmar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedOrder(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Excluir Pedido"
        message={`Tem certeza que deseja excluir o pedido #${selectedOrder?.id}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}

