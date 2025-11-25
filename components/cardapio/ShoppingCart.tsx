'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { ordersService } from '@/lib/api/ordersService';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface ShoppingCartProps {
  mainColor: string;
}

export function ShoppingCart({ mainColor }: ShoppingCartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [observations, setObservations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { items, removeItem, updateQuantity, getTotal, getItemCount, clearCart, tableNumber, tableId } = useCartStore();

  const itemCount = getItemCount();
  const total = getTotal();

  const handleCheckout = () => {
    setShowCheckoutForm(true);
  };

  const handleSubmitOrder = async () => {
    if (items.length === 0) {
      alert('Selecione ao menos um item ao pedido.');
      return;
    }

    if (!tableNumber) {
      alert('Erro: Mesa não identificada. Por favor, recarregue a página.');
      return;
    }

    if (!customerName.trim()) {
      alert('Por favor, informe o nome do cliente.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Buscar tableId se ainda não estiver disponível
      let finalTableId = tableId;
      if (!finalTableId && tableNumber) {
        try {
          const { tablesService } = await import('@/lib/api/tablesService');
          const tables = await tablesService.getAll();
          const table = tables.find(t => t.number === tableNumber);
          if (table) {
            finalTableId = table.id;
            const { setTableId } = useCartStore.getState();
            setTableId(table.id);
          } else {
            throw new Error('Mesa não encontrada');
          }
        } catch (error) {
          console.error('Erro ao buscar ID da mesa:', error);
          alert('Erro ao identificar a mesa. Por favor, recarregue a página e tente novamente.');
          setIsSubmitting(false);
          return;
        }
      }

      if (!finalTableId) {
        alert('Erro: Não foi possível identificar a mesa. Por favor, recarregue a página.');
        setIsSubmitting(false);
        return;
      }

      await ordersService.create({
        tableId: finalTableId,
        customerName: customerName.trim(),
        observations: observations.trim() || undefined,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          observations: undefined,
          selectedVariation: item.variationLabel || undefined,
        })),
      });

      // Limpar carrinho e fechar modal
      clearCart();
      setShowCheckoutForm(false);
      setIsOpen(false);
      setCustomerName('');
      setObservations('');
      alert('Pedido realizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao realizar pedido:', error);
      const errorMessage = error?.message || 'Erro ao realizar pedido. Tente novamente.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Botão do carrinho flutuante */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
        style={{ backgroundColor: mainColor }}
        aria-label="Abrir pedido"
      >
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </div>
      </button>

      {/* Modal do carrinho */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="min-h-screen px-4 py-8 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  Pedido {tableNumber && `- Mesa ${tableNumber}`}
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Itens */}
              <div className="px-6 py-4">
                {items.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhum item selecionado</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div
                        key={`${item.productId}-${item.variationLabel || 'unique'}-${index}`}
                        className="flex items-center gap-4 border-b border-gray-200 pb-4"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.productTitle}</h3>
                          {item.variationLabel && (
                            <p className="text-sm text-gray-500">{item.variationLabel}</p>
                          )}
                          <p className="text-sm font-medium" style={{ color: mainColor }}>
                            R$ {item.price.toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variationLabel)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variationLabel)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeItem(item.productId, item.variationLabel)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer com total e botão de checkout */}
              {items.length > 0 && !showCheckoutForm && (
                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-xl font-bold" style={{ color: mainColor }}>
                      R$ {total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 rounded-lg font-semibold text-white transition-colors"
                    style={{ backgroundColor: mainColor }}
                  >
                    Fazer Pedido
                  </button>
                </div>
              )}

              {/* Formulário de checkout */}
              {items.length > 0 && showCheckoutForm && (
                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 space-y-4">
                  <div>
                    <Input
                      label="Nome do Cliente"
                      name="customerName"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Seu nome"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Observações (opcional)
                    </label>
                    <textarea
                      name="observations"
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      placeholder="Observações sobre o pedido..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-xl font-bold" style={{ color: mainColor }}>
                      R$ {total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setShowCheckoutForm(false)}
                      className="flex-1"
                    >
                      Voltar
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSubmitOrder}
                      isLoading={isSubmitting}
                      className="flex-1"
                      style={{ backgroundColor: mainColor }}
                    >
                      Confirmar Pedido
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

