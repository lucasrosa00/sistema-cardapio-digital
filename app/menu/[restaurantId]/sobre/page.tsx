'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { restaurantService } from '@/lib/api/restaurantService';
import type { PublicMenuDto } from '@/lib/api/types';
import { useCartStore } from '@/store/cartStore';
import { getImageUrl } from '@/lib/utils/imageUrl';
import { Spinner } from '@/components/ui/Spinner';
import { getServiceTypeLabel } from '@/lib/utils/serviceType';

export default function SobreRestaurantePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.restaurantId as string;
  const tableNumberFromParams = params.tableNumber as string | undefined;
  const tableNumberFromQuery = searchParams.get('mesa');
  const tableNumberFromCart = useCartStore((state) => state.tableNumber);
  const tableNumber = tableNumberFromParams || tableNumberFromQuery || tableNumberFromCart || null;
  
  const getBackUrl = () => {
    return tableNumber ? `/menu/${slug}/${tableNumber}` : `/menu/${slug}`;
  };

  const [menu, setMenu] = useState<PublicMenuDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMenu = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const menuData = await restaurantService.getPublicMenu(slug);
        setMenu(menuData);
      } catch (error) {
        console.error('Erro ao carregar informações do restaurante:', error);
        setError('Restaurante não encontrado');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      loadMenu();
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !menu?.restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Restaurante não encontrado
          </h1>
          <button
            onClick={() => router.push(getBackUrl())}
            className="px-6 py-2 rounded-lg font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600"
          >
            Voltar ao Cardápio
          </button>
        </div>
      </div>
    );
  }

  const restaurant = menu.restaurant;
  const defaultServiceLabel = getServiceTypeLabel(restaurant.serviceType);
  const config = {
    restaurantName: restaurant.restaurantName || defaultServiceLabel,
    mainColor: restaurant.mainColor || '#ff0000',
    logo: restaurant.logo || null,
    backgroundImage: restaurant.backgroundImage || null,
    serviceType: restaurant.serviceType,
    address: restaurant.address || null,
    about: restaurant.about || null,
    openingHours: restaurant.openingHours || null,
    mapUrl: restaurant.mapUrl || null,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com imagem de fundo */}
      <div
        className="relative h-64 bg-gray-200 overflow-hidden"
        style={{
          backgroundImage: config.backgroundImage
            ? `url(${getImageUrl(config.backgroundImage)})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="relative h-full flex items-center justify-center p-6">
          {config.logo && (
            <img
              src={getImageUrl(config.logo)}
              alt={config.restaurantName}
              className="max-w-40 max-h-40 object-contain rounded-lg bg-white p-3 shadow-lg"
            />
          )}
        </div>
        <button
          onClick={() => router.push(getBackUrl())}
          className="absolute top-4 left-4 text-white hover:text-gray-200 transition-colors bg-black bg-opacity-50 rounded-full p-2"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
      </div>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div>
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: config.mainColor }}
            >
              {config.restaurantName}
            </h1>
          </div>

          {config.address && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
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
              </h2>
              <p className="text-gray-700 text-lg">{config.address}</p>
            </div>
          )}

          {config.openingHours && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Horário de Funcionamento
              </h2>
              <p className="text-gray-700 whitespace-pre-line text-lg">
                {config.openingHours}
              </p>
            </div>
          )}

          {config.about && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Sobre
              </h2>
              <p className="text-gray-700 whitespace-pre-line text-lg leading-relaxed">
                {config.about}
              </p>
            </div>
          )}

          {config.mapUrl && (() => {
            // Garantir que a URL seja usada exatamente como está, sem processamento
            // Decodificar entidades HTML que podem ter sido codificadas ao salvar
            let mapUrl = config.mapUrl.trim();
            
            // Decodificar entidades HTML comuns
            mapUrl = mapUrl
              .replace(/&#39;/g, "'")
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>');
            
            return (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
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
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  Como Chegar
                </h2>
                <div className="mt-2 rounded-lg overflow-hidden shadow-md">
                  <iframe
                    src={mapUrl}
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

