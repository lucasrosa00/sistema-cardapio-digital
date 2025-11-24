'use client';

import React from 'react';
import { getImageUrl } from '@/lib/utils/imageUrl';

interface RestaurantInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantName: string;
  logo: string | null;
  backgroundImage: string | null;
  address: string | null;
  about: string | null;
  openingHours: string | null;
  mapUrl: string | null;
}

export function RestaurantInfoModal({
  isOpen,
  onClose,
  restaurantName,
  logo,
  backgroundImage,
  address,
  about,
  openingHours,
  mapUrl,
}: RestaurantInfoModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="min-h-screen px-4 py-8 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header com imagem de fundo */}
          <div
            className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden"
            style={{
              backgroundImage: backgroundImage
                ? `url(${getImageUrl(backgroundImage)})`
                : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40" />
            <div className="relative h-full flex items-center justify-center p-6">
              {logo && (
                <img
                  src={getImageUrl(logo)}
                  alt={restaurantName}
                  className="max-w-32 max-h-32 object-contain rounded-lg bg-white p-2"
                />
              )}
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors bg-black bg-opacity-50 rounded-full p-2"
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

          {/* Conteúdo */}
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {restaurantName || 'Restaurante'}
              </h2>
            </div>

            {address && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Endereço
                </h3>
                <p className="text-gray-700">{address}</p>
              </div>
            )}

            {openingHours && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Horário de Funcionamento
                </h3>
                <p className="text-gray-700 whitespace-pre-line">{openingHours}</p>
              </div>
            )}

            {about && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
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
                  Sobre
                </h3>
                <p className="text-gray-700 whitespace-pre-line">{about}</p>
              </div>
            )}

            {mapUrl && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
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
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  Como Chegar
                </h3>
                <div className="mt-2 rounded-lg overflow-hidden">
                  <iframe
                    src={mapUrl}
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

