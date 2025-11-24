'use client';

import React from 'react';

interface PaymentMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethods: string | null;
}

export function PaymentMethodsModal({
  isOpen,
  onClose,
  paymentMethods,
}: PaymentMethodsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Métodos de Pagamento</h2>
          <button
            onClick={onClose}
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
        <div className="text-gray-700 whitespace-pre-line">
          {paymentMethods || 'Nenhuma informação de pagamento disponível.'}
        </div>
      </div>
    </div>
  );
}

