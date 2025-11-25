'use client';

import React from 'react';
import { Button } from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const variantClasses = {
    danger: '!bg-red-600 !text-white hover:!bg-red-700 focus:!ring-red-500 disabled:!bg-red-400',
    warning: '!bg-yellow-600 !text-white hover:!bg-yellow-700 focus:!ring-yellow-500 disabled:!bg-yellow-400',
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="min-h-screen px-4 py-8 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-gray-700 mb-6">{message}</p>
          
          <div className="flex gap-4 justify-end">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              variant="primary"
              onClick={onConfirm}
              isLoading={isLoading}
              className={variantClasses[variant]}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

