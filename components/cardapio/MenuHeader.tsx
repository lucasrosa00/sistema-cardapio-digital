'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { PaymentMethodsModal } from './PaymentMethodsModal';
import { getServiceTypeLabel } from '@/lib/utils/serviceType';

interface MenuHeaderProps {
  restaurantName: string;
  mainColor: string;
  logo: string | null;
  showBackButton?: boolean;
  backUrl?: string;
  zIndex?: number;
  paymentMethods?: string | null;
  backgroundImage?: string | null;
  address?: string | null;
  about?: string | null;
  openingHours?: string | null;
  mapUrl?: string | null;
  darkMode?: boolean;
  serviceType?: 'Menu' | 'Catalog' | null;
}

export function MenuHeader({
  restaurantName,
  mainColor,
  logo,
  showBackButton = false,
  backUrl,
  zIndex = 10,
  paymentMethods,
  backgroundImage,
  address,
  about,
  openingHours,
  mapUrl,
  darkMode = false,
  serviceType = null,
}: MenuHeaderProps) {
  const router = useRouter();
  const params = useParams();
  const slug = params?.restaurantId as string;
  const tableNumberFromParams = params?.tableNumber as string | undefined;
  const tableNumberFromCart = useCartStore((state) => state.tableNumber);
  const tableNumber = tableNumberFromParams || tableNumberFromCart || null;
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  
  const getSobreUrl = () => {
    return tableNumber ? `/menu/${slug}/sobre?mesa=${tableNumber}` : `/menu/${slug}/sobre`;
  };

  const handleCopyLink = async () => {
    const url = `https://pinktech.com.br/menu/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setShowCopiedMessage(true);
        setTimeout(() => setShowCopiedMessage(false), 2000);
      } catch (err) {
        console.error('Erro ao copiar link (fallback):', err);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <header
      className={`sticky top-0 shadow-lg ${darkMode ? 'bg-[#1F1F1F]' : 'bg-white'}`}
      style={{ zIndex }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {logo && (
              <img
                src={logo}
                alt={restaurantName}
                className="w-22 h-22 object-contain rounded-lg flex-shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <h1
                className="text-2xl md:text-3xl font-bold truncate"
                style={{ color: mainColor }}
              >
                {restaurantName || getServiceTypeLabel(serviceType)}
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {getServiceTypeLabel(serviceType)}
              </p>
              <div className="flex items-center gap-2 mt-1 relative">
                <button
                  onClick={handleCopyLink}
                  className={`mr-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-[#2F2F2F] hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900 active:bg-gray-200'}`}
                  title="Copiar link do cardápio"
                  aria-label="Copiar link do cardápio"
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
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                </button>
                {paymentMethods && (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className={`rounded-lg transition-colors ${darkMode ? 'hover:bg-[#2F2F2F] hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900 active:bg-gray-200'}`}
                    title="Métodos de Pagamento"
                    aria-label="Ver métodos de pagamento"
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
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </button>
                )}
                {(address || about || openingHours || mapUrl) && (
                  <button
                    onClick={() => router.push(getSobreUrl())}
                    className={`ml-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-[#2F2F2F] hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900 active:bg-gray-200'}`}
                    title="Informações do Restaurante"
                    aria-label="Ver informações do restaurante"
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
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>
                )}
                {showCopiedMessage && (
                  <div className="absolute left-0 top-full mt-2 px-3 py-2 bg-green-500 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-50 animate-fade-in">
                    ✓ Link copiado com sucesso!
                  </div>
                )}
              </div>
            </div>
          </div>
          {showBackButton && backUrl && (
            <button
              onClick={() => router.push(backUrl)}
              className="px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-80 active:opacity-90 flex-shrink-0"
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

      <PaymentMethodsModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        paymentMethods={paymentMethods || null}
      />
    </header>
  );
}

