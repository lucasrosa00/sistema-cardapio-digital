'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { ordersService } from '@/lib/api/ordersService';
import { restaurantService } from '@/lib/api/restaurantService';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface ShoppingCartProps {
  mainColor: string;
  whatsAppOrderEnabled?: boolean;
  whatsAppNumber?: string | null;
  restaurantName?: string;
  serviceType?: 'Menu' | 'Catalog' | null;
  deliveryFee?: number;
}

export function ShoppingCart({ 
  mainColor, 
  whatsAppOrderEnabled = false, 
  whatsAppNumber = null,
  restaurantName = 'Restaurante',
  serviceType = 'Menu',
  deliveryFee = 0
}: ShoppingCartProps) {
  const params = useParams();
  const slug = params.restaurantId as string;
  const [isOpen, setIsOpen] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [observations, setObservations] = useState('');
  const [deliveryType, setDeliveryType] = useState<'Entrega' | 'Retirada'>('Retirada');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Pix' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Dinheiro'>('Pix');
  const [needChange, setNeedChange] = useState(false);
  const [changeFor, setChangeFor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerNameError, setCustomerNameError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [changeForError, setChangeForError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { items, removeItem, updateQuantity, getTotal, getItemCount, clearCart, tableNumber, tableId } = useCartStore();

  const itemCount = getItemCount();
  const subtotal = getTotal();
  const total = deliveryType === 'Entrega' ? subtotal + deliveryFee : subtotal;

  // Função para formatar mensagem do WhatsApp
  const formatWhatsAppMessage = (customerName: string, observations: string) => {
    let message = `*Pedido - ${restaurantName}*\n\n`;
    message += `*Cliente:* ${customerName}\n\n`;
    message += `*Tipo de Entrega:* ${deliveryType}\n`;
    if (deliveryType === 'Entrega' && address.trim()) {
      message += `*Endereço:* ${address.trim()}\n`;
    }
    if (deliveryType === 'Entrega') {
      message += `*Método de Pagamento:* ${paymentMethod}\n`;
      if (paymentMethod === 'Dinheiro' && needChange && changeFor.trim()) {
        message += `*Troco para:* R$ ${changeFor.trim().replace('.', ',')}\n`;
      } else if (paymentMethod === 'Dinheiro' && !needChange) {
        message += `*Troco:* Não precisa\n`;
      }
    }
    message += `\n*Itens do Pedido:*\n`;
    
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.productTitle}`;
      if (item.variationLabel) {
        message += ` (${item.variationLabel})`;
      }
      message += `\n   Quantidade: ${item.quantity}x\n`;
      
      // Adicionais
      if (item.addons && item.addons.length > 0) {
        message += `   Adicionais:\n`;
        item.addons.forEach((addon) => {
          message += `     - ${addon.name} (x${addon.quantity}) - R$ ${(addon.extraPrice * addon.quantity).toFixed(2).replace('.', ',')}\n`;
        });
      }
      
      const itemSubtotal = item.price * item.quantity + (item.addons?.reduce((sum, addon) => sum + (addon.extraPrice * addon.quantity * item.quantity), 0) || 0);
      message += `   Valor unitário: R$ ${item.price.toFixed(2).replace('.', ',')}\n`;
      message += `   Subtotal: R$ ${itemSubtotal.toFixed(2).replace('.', ',')}\n\n`;
    });
    
    message += `*Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}*\n`;
    if (deliveryType === 'Entrega') {
      if (deliveryFee === 0) {
        message += `*Taxa de Entrega: Grátis*\n`;
      } else {
        message += `*Taxa de Entrega: R$ ${deliveryFee.toFixed(2).replace('.', ',')}*\n`;
      }
    }
    message += `*Total: R$ ${total.toFixed(2).replace('.', ',')}*\n\n`;
    
    if (observations.trim()) {
      message += `*Observações:*\n${observations.trim()}\n\n`;
    }
    
    const serviceTypeText = serviceType === 'Catalog' ? 'catálogo' : 'cardápio';
    message += `_Pedido realizado através do ${serviceTypeText} digital_`;
    
    return encodeURIComponent(message);
  };

  // Função para enviar pedido via WhatsApp
  const handleSubmitWhatsAppOrder = () => {
    if (items.length === 0) {
      alert('Selecione ao menos um item ao pedido.');
      return;
    }

    if (!customerName.trim()) {
      setCustomerNameError('Por favor, informe o nome do cliente.');
      return;
    }

    if (deliveryType === 'Entrega' && !address.trim()) {
      setAddressError('Por favor, informe o endereço de entrega.');
      return;
    }

    if (deliveryType === 'Entrega' && paymentMethod === 'Dinheiro' && needChange && !changeFor.trim()) {
      setChangeForError('Por favor, informe o valor para troco.');
      return;
    }

    if (!whatsAppNumber) {
      alert('Número do WhatsApp não configurado. Entre em contato com o estabelecimento.');
      return;
    }

    // Limpar erros
    setCustomerNameError('');
    setAddressError('');
    setChangeForError('');

    // Formatar número do WhatsApp (remover caracteres não numéricos, exceto +)
    const cleanNumber = whatsAppNumber.replace(/[^\d+]/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${formatWhatsAppMessage(customerName.trim(), observations.trim())}`;
    
    // Abrir WhatsApp em nova aba
    window.open(whatsappUrl, '_blank');
    
    // Limpar carrinho e fechar modal
    clearCart();
    setShowCheckoutForm(false);
    setIsOpen(false);
    setCustomerName('');
    setObservations('');
    setDeliveryType('Retirada');
    setAddress('');
    setPaymentMethod('Pix');
    setNeedChange(false);
    setChangeFor('');
    setShowSuccessModal(true);
  };

  const handleCheckout = () => {
    setShowCheckoutForm(true);
  };

  const handleSubmitOrder = async () => {
    // Se for pedido via WhatsApp (sem mesa na URL), usar função específica
    // Não usar tableNumber do store para pedidos via WhatsApp
    if (whatsAppOrderEnabled) {
      handleSubmitWhatsAppOrder();
      return;
    }

    if (items.length === 0) {
      alert('Selecione ao menos um item ao pedido.');
      return;
    }

    if (!tableNumber) {
      alert('Erro: Mesa não identificada. Por favor, recarregue a página.');
      return;
    }

    if (!customerName.trim()) {
      setCustomerNameError('Por favor, informe o nome do cliente.');
      return;
    }

    if (deliveryType === 'Entrega' && !address.trim()) {
      setAddressError('Por favor, informe o endereço de entrega.');
      return;
    }

    if (deliveryType === 'Entrega' && paymentMethod === 'Dinheiro' && needChange && !changeFor.trim()) {
      setChangeForError('Por favor, informe o valor para troco.');
      return;
    }
    
    // Limpar erros
    setCustomerNameError('');
    setAddressError('');
    setChangeForError('');

    setIsSubmitting(true);
    try {
      // Buscar tableId se ainda não estiver disponível
      // A mesa já foi validada quando o cardápio foi carregado (se não estivesse ativa, não seria possível adicionar itens)
      let finalTableId = tableId;
      if (!finalTableId && tableNumber && slug) {
        try {
          // Obter o tableId através do endpoint público (sem autenticação)
          const tableMenuData = await restaurantService.getTableMenu(slug, tableNumber);
          if (tableMenuData.tableId) {
            finalTableId = tableMenuData.tableId;
            const { setTableId } = useCartStore.getState();
            setTableId(tableMenuData.tableId);
          } else {
            throw new Error('TableId não retornado pela API');
          }
        } catch (error: any) {
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
          addons: item.addons && item.addons.length > 0 ? item.addons.map(addon => ({
            productAddonId: addon.productAddonId,
            quantity: addon.quantity,
          })) : undefined,
        })),
      });

      // Limpar carrinho e fechar modal
      clearCart();
      setShowCheckoutForm(false);
      setIsOpen(false);
      setCustomerName('');
      setObservations('');
      setDeliveryType('Retirada');
      setAddress('');
      setPaymentMethod('Pix');
      setNeedChange(false);
      setChangeFor('');
      setShowSuccessModal(true);
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
          {serviceType === 'Catalog' ? (
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
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          ) : (
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
          )}
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
                  {tableNumber && !whatsAppOrderEnabled ? `Pedido - Mesa ${tableNumber}` : whatsAppOrderEnabled ? 'Pedido via WhatsApp' : 'Pedido'}
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
                          {item.addons && item.addons.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {item.addons.map((addon, addonIndex) => (
                                <p key={addonIndex} className="text-xs text-gray-500">
                                  + {addon.name} (x{addon.quantity}) - R$ {(addon.extraPrice * addon.quantity).toFixed(2).replace('.', ',')}
                                </p>
                              ))}
                            </div>
                          )}
                          <div className="mt-1">
                            <p className="text-sm font-medium" style={{ color: mainColor }}>
                              R$ {item.price.toFixed(2).replace('.', ',')}
                            </p>
                            {item.addons && item.addons.length > 0 && (
                              <p className="text-xs text-gray-500">
                                + R$ {item.addons.reduce((sum, addon) => sum + (addon.extraPrice * addon.quantity), 0).toFixed(2).replace('.', ',')} em adicionais
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variationLabel, item.addons)}
                            className="text-gray-700 w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="text-gray-700 w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variationLabel, item.addons)}
                            className="text-gray-700 w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeItem(item.productId, item.variationLabel, item.addons)}
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
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Subtotal:</span>
                      <span className="text-sm text-gray-600">
                        R$ {subtotal.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    {deliveryType === 'Entrega' && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Taxa de Entrega:</span>
                        {deliveryFee === 0 ? (
                          <span className="text-sm font-semibold text-green-600">
                            Grátis
                          </span>
                        ) : (
                          <span className="text-sm text-gray-600">
                            R$ {deliveryFee.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-lg font-semibold text-gray-900">Total:</span>
                      <span className="text-xl font-bold" style={{ color: mainColor }}>
                        R$ {total.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
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
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        // Limpar erro quando o usuário começar a digitar
                        if (customerNameError) {
                          setCustomerNameError('');
                        }
                      }}
                      placeholder="Seu nome"
                      required
                    />
                    {customerNameError && (
                      <p className="mt-1 text-sm text-red-600">{customerNameError}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Entrega <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="deliveryType"
                      value={deliveryType}
                      onChange={(e) => {
                        setDeliveryType(e.target.value as 'Entrega' | 'Retirada');
                        // Limpar endereço, pagamento e erros quando mudar para retirada
                        if (e.target.value === 'Retirada') {
                          setAddress('');
                          setAddressError('');
                          setPaymentMethod('Pix');
                          setNeedChange(false);
                          setChangeFor('');
                          setChangeForError('');
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Retirada">Retirada</option>
                      <option value="Entrega">Entrega</option>
                    </select>
                  </div>
                  {deliveryType === 'Entrega' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Endereço de Entrega <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="address"
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value);
                          // Limpar erro quando o usuário começar a digitar
                          if (addressError) {
                            setAddressError('');
                          }
                        }}
                        placeholder="Rua, número, bairro, complemento..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      {addressError && (
                        <p className="mt-1 text-sm text-red-600">{addressError}</p>
                      )}
                    </div>
                  )}
                  {deliveryType === 'Entrega' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Método de Pagamento <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="paymentMethod"
                          value={paymentMethod}
                          onChange={(e) => {
                            setPaymentMethod(e.target.value as 'Pix' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Dinheiro');
                            if (e.target.value !== 'Dinheiro') {
                              setNeedChange(false);
                              setChangeFor('');
                              setChangeForError('');
                            }
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Pix">Pix</option>
                          <option value="Cartão de Crédito">Cartão de Crédito</option>
                          <option value="Cartão de Débito">Cartão de Débito</option>
                          <option value="Dinheiro">Dinheiro</option>
                        </select>
                      </div>
                      {paymentMethod === 'Dinheiro' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Precisa de troco?
                            </label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="needChange"
                                  checked={!needChange}
                                  onChange={() => {
                                    setNeedChange(false);
                                    setChangeFor('');
                                    setChangeForError('');
                                  }}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm text-gray-700">Não</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="needChange"
                                  checked={needChange}
                                  onChange={() => setNeedChange(true)}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm text-gray-700">Sim</span>
                              </label>
                            </div>
                          </div>
                          {needChange && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Troco para quantos? <span className="text-red-500">*</span>
                              </label>
                              <Input
                                name="changeFor"
                                type="text"
                                value={changeFor}
                                onChange={(e) => {
                                  setChangeFor(e.target.value);
                                  if (changeForError) setChangeForError('');
                                }}
                                placeholder="Ex: 50,00 ou 100"
                              />
                              {changeForError && (
                                <p className="mt-1 text-sm text-red-600">{changeForError}</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
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
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Subtotal:</span>
                      <span className="text-sm text-gray-600">
                        R$ {subtotal.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    {deliveryType === 'Entrega' && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Taxa de Entrega:</span>
                        {deliveryFee === 0 ? (
                          <span className="text-sm font-semibold text-green-600">
                            Grátis
                          </span>
                        ) : (
                          <span className="text-sm text-gray-600">
                            R$ {deliveryFee.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-lg font-semibold text-gray-900">Total:</span>
                      <span className="text-xl font-bold" style={{ color: mainColor }}>
                        R$ {total.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
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
                      {whatsAppOrderEnabled ? 'Enviar via WhatsApp' : 'Confirmar Pedido'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de sucesso */}
      {showSuccessModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50"
          onClick={() => setShowSuccessModal(false)}
        >
          <div
            className="min-h-screen px-4 py-8 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
              {/* Ícone de sucesso */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4" style={{ backgroundColor: `${mainColor}20` }}>
                <svg
                  className="h-10 w-10"
                  style={{ color: mainColor }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              {/* Título */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Pedido Enviado!
              </h2>

              {/* Mensagem */}
              <p className="text-gray-600 mb-6">
                {whatsAppOrderEnabled 
                  ? 'Seu pedido foi enviado via WhatsApp com sucesso! Aguarde o retorno do estabelecimento.'
                  : 'Seu pedido foi recebido com sucesso. Nossa equipe já está preparando e em breve será servido na sua mesa.'}
              </p>

              {/* Botão de fechar */}
              <Button
                variant="primary"
                onClick={() => setShowSuccessModal(false)}
                className="w-full"
                style={{ backgroundColor: mainColor }}
              >
                Entendi
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

