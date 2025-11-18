'use client';

import { useState } from 'react';

interface ProductImageCarouselProps {
  images: string[];
  productTitle: string;
}

export function ProductImageCarousel({
  images,
  productTitle,
}: ProductImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full mb-4">
      <div className="relative overflow-hidden rounded-lg" style={{ aspectRatio: '16/16' }}>
        <img
          src={images[currentIndex]}
          alt={`${productTitle} - Imagem ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
        
        {images.length > 1 && (
          <>
            {/* Botões de navegação */}
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
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
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
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
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
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

