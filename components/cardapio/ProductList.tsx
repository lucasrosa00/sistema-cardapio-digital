'use client';

import { useRef, useEffect } from 'react';
import { Product, Subcategory } from '@/lib/mockData';
import { ProductImageCarousel } from './ProductImageCarousel';

interface ProductListProps {
  products: Product[];
  subcategories: Subcategory[];
  selectedSubcategoryId: number | null;
  mainColor: string;
  formatPrice: (product: Product) => string;
}

export function ProductList({
  products,
  subcategories,
  selectedSubcategoryId,
  mainColor,
  formatPrice,
}: ProductListProps) {
  const subcategoryRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Scroll para subcategoria selecionada
  useEffect(() => {
    if (selectedSubcategoryId && subcategoryRefs.current[selectedSubcategoryId]) {
      subcategoryRefs.current[selectedSubcategoryId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [selectedSubcategoryId]);

  // Agrupar produtos por subcategoria
  // Produtos sem subcategoria (subcategoryId === 0 ou null) vão para a chave 0
  const productsBySubcategory = products.reduce((acc, product) => {
    const subcategoryId = product.subcategoryId || 0;
    if (!acc[subcategoryId]) {
      acc[subcategoryId] = [];
    }
    acc[subcategoryId].push(product);
    return acc;
  }, {} as Record<number, Product[]>);

  // Ordenar subcategorias por ordem
  // Produtos sem subcategoria (id === 0) aparecem primeiro
  const sortedSubcategoryIds = Object.keys(productsBySubcategory)
    .map(Number)
    .sort((a, b) => {
      // Produtos sem subcategoria (0) sempre aparecem primeiro
      if (a === 0) return -1;
      if (b === 0) return 1;
      
      const subA = subcategories.find((s) => s.id === a);
      const subB = subcategories.find((s) => s.id === b);
      return (subA?.order || 0) - (subB?.order || 0);
    });

  if (sortedSubcategoryIds.length === 0) {
    return (
      <div className="text-center py-12 px-4 sm:px-6 lg:px-8">
        <p className="text-gray-600">
          Nenhum produto disponível.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {sortedSubcategoryIds.map((subcategoryId) => {
        const subcategory = subcategories.find((s) => s.id === subcategoryId);
        const subcategoryProducts = productsBySubcategory[subcategoryId];
        const isSelected = selectedSubcategoryId === subcategoryId;

        return (
          <div
            key={subcategoryId}
            ref={(el) => {
              subcategoryRefs.current[subcategoryId] = el;
            }}
            className="scroll-mt-24"
          >
            {/* Título da Subcategoria */}
            {subcategoryId !== 0 && (
              <h3
                className="text-xl md:text-2xl font-bold mb-4 pb-2 border-b-2"
                style={{
                  color: mainColor,
                  borderColor: isSelected ? mainColor : '#e5e7eb',
                }}
              >
                {subcategory?.title || 'Sem subcategoria'}
              </h3>
            )}

            {/* Produtos da Subcategoria */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subcategoryProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-lg overflow-hidden transition-all bg-white border border-gray-200"
                >
                  {/* Imagens do Produto */}
                  {product.images && product.images.length > 0 && (
                    <ProductImageCarousel
                      images={product.images}
                      productTitle={product.title}
                    />
                  )}

                  {/* Informações do Produto */}
                  <div className="p-4">
                    <h4 className="text-lg font-semibold mb-2">
                      {product.title}
                    </h4>
                    <p className="text-sm mb-3 text-gray-600">
                      {product.description}
                    </p>

                    {/* Preço ou Variações */}
                    {product.priceType === 'unique' ? (
                      <div
                        className="text-xl font-bold"
                        style={{ color: mainColor }}
                      >
                        {formatPrice(product)}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p
                          className="text-sm font-medium"
                          style={{ color: mainColor }}
                        >
                          Opções disponíveis:
                        </p>
                        <div className="space-y-1">
                          {product.variations?.map((variation, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center"
                            >
                              <span className="text-sm text-gray-700">
                                {variation.label}
                              </span>
                              <span
                                className="font-semibold"
                                style={{ color: mainColor }}
                              >
                                R${' '}
                                {variation.price
                                  .toFixed(2)
                                  .replace('.', ',')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

