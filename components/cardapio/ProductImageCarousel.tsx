'use client';

import { useState, useEffect } from 'react';
import { getImageUrl } from '@/lib/utils/imageUrl';

interface ProductImageCarouselProps {
  images: string[];
  productTitle: string;
  disableAutoPlay?: boolean;
  alwaysShowControls?: boolean;
}

export function ProductImageCarousel({
  images,
  productTitle,
  disableAutoPlay = false,
  alwaysShowControls = false,
}: ProductImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(true);

  // Detectar se é mobile ou desktop
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isMounted = true;

    const checkMobile = () => {
      if (isMounted && typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768); // md breakpoint do Tailwind
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', checkMobile);
      }
    };
  }, []);

  // Auto-play: troca de imagem a cada 3 segundos apenas no mobile (se não estiver desabilitado)
  useEffect(() => {
    if (images.length <= 1 || !isMobile || disableAutoPlay) return;

    let isMounted = true;

    const interval = setInterval(() => {
      if (isMounted) {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [images.length, isMobile, disableAutoPlay]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full">
      <div className="relative overflow-hidden rounded-lg w-full bg-gray-100 flex items-center justify-center">
        <img
          src={getImageUrl(images[currentIndex])}
          alt={`${productTitle} - Imagem ${currentIndex + 1}`}
          className="max-w-full max-h-full w-auto h-auto object-contain"
          onError={(e) => {
            console.error('Erro ao carregar imagem:', images[currentIndex]);
          }}
        />

        {images.length > 1 && (
          <>
            {/* Botões de navegação */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goToPrevious();
              }}
              className={`${alwaysShowControls ? 'block' : 'hidden md:block'} absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10`}
              aria-label="Imagem anterior"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goToNext();
              }}
              className={`${alwaysShowControls ? 'block' : 'hidden md:block'} absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10`}
              aria-label="Próxima imagem"
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Indicadores de slide */}
            <div className={`${alwaysShowControls ? 'flex' : 'hidden md:flex'} absolute bottom-2 left-1/2 -translate-x-1/2 gap-2`}>
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    goToSlide(index);
                  }}
                  className={`
                    w-2 h-2 rounded-full transition-all
                    ${currentIndex === index
                      ? 'bg-white w-6'
                      : 'bg-white/50 hover:bg-white/75'
                    }
                  `}
                  aria-label={`Ir para imagem ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

