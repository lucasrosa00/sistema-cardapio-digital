'use client';

import { useRef, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Product, Subcategory } from '@/lib/mockData';
import { ProductImageCarousel } from './ProductImageCarousel';
import { VariationSelectionModal } from './VariationSelectionModal';
import { useCartStore } from '@/store/cartStore';

interface ProductListProps {
  products: Product[];
  subcategories: Subcategory[];
  selectedSubcategoryId: number | null;
  selectedCategoryId: number | null;
  mainColor: string;
  formatPrice: (product: Product) => string;
  allowOrders?: boolean;
  darkMode?: boolean;
}

export function ProductList({
  products,
  subcategories,
  selectedSubcategoryId,
  selectedCategoryId,
  mainColor,
  formatPrice,
  allowOrders = false,
  darkMode = false,
}: ProductListProps) {
  const params = useParams();
  const restaurantId = params.restaurantId as string;
  const tableNumberFromUrl = params.tableNumber as string | undefined;
  const tableNumber = tableNumberFromUrl || null;
  const subcategoryRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const addItem = useCartStore((state) => state.addItem);
  const [selectedProductForVariation, setSelectedProductForVariation] = useState<Product | null>(null);

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
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Nenhum produto disponível.
        </p>
      </div>
    );
  }

  return (
    <>
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
                    borderColor: isSelected ? mainColor : darkMode ? '#2F2F2F' : '#e5e7eb',
                  }}
                >
                  {subcategory?.title || 'Sem subcategoria'}
                </h3>
              )}

              {/* Produtos da Subcategoria */}
              <div className="space-y-6">
                {subcategoryProducts.map((product) => {
                  // Construir URL do produto
                  const url = `/menu/${restaurantId}/produto/${product.id}`;
                  const params = new URLSearchParams();
                  if (selectedCategoryId) {
                    params.set('categoria', selectedCategoryId.toString());
                  }
                  // Incluir mesa na URL se existir
                  if (tableNumber) {
                    params.set('mesa', tableNumber);
                  }
                  const productUrl = `${url}${params.toString() ? `?${params.toString()}` : ''}`;

                  return (
                    <Link
                      key={product.id}
                      href={productUrl}
                      className={`block rounded-lg overflow-hidden transition-all ${darkMode ? 'bg-[#1F1F1F] border border-[#2F2F2F]' : 'bg-white border border-gray-200 hover:border-gray-300'} cursor-pointer hover:shadow-lg touch-manipulation`}
                      style={{ touchAction: 'manipulation' }}
                    >
                    {/* Conteúdo superior: Título/Descrição e Imagem */}
                    <div className="flex flex-row">
                      {/* Informações do Produto */}
                      <div className="p-4 flex-1 flex flex-col">
                        <h4 className="text-lg font-semibold mb-2">
                          {product.title}
                        </h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {product.description}
                        </p>
                      </div>

                      {/* Imagens do Produto */}
                      {product.images && product.images.length > 0 && (
                        <div className="py-4 pr-4 w-32 sm:w-40 md:w-64 flex-shrink-0">
                          <ProductImageCarousel
                            images={product.images}
                            productTitle={product.title}
                          />
                        </div>
                      )}
                    </div>

                    {/* Preço ou Variações - Ocupa 100% da largura */}
                    <div className={`px-4 pb-4 w-full ${darkMode ? 'border-t border-[#2F2F2F]' : 'border-t border-gray-100'}`}>
                      {product.priceType === 'unique' ? (
                        <div className="flex justify-between items-center pt-4">
                          <div
                            className="text-xl font-bold"
                            style={{ color: mainColor }}
                          >
                            {formatPrice(product)}
                          </div>
                          {allowOrders && product.price && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addItem({
                                  productId: product.id,
                                  productTitle: product.title,
                                  price: product.price!,
                                  image: product.images?.[0],
                                });
                              }}
                              className="px-4 py-2 rounded-lg font-semibold text-white transition-colors hover:opacity-90"
                              style={{ backgroundColor: mainColor }}
                            >
                              Adicionar
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="pt-4">
                          <div className="space-y-2 mb-4">
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
                                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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
                          {allowOrders && (
                            <div className="flex justify-end">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setSelectedProductForVariation(product);
                                }}
                                className="px-4 py-2 rounded-lg font-semibold text-white transition-colors hover:opacity-90"
                                style={{ backgroundColor: mainColor }}
                              >
                                Adicionar
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {/* Modal de seleção de variação */}
      {selectedProductForVariation && selectedProductForVariation.variations && (
        <VariationSelectionModal
          isOpen={!!selectedProductForVariation}
          onClose={() => setSelectedProductForVariation(null)}
          productTitle={selectedProductForVariation.title}
          variations={selectedProductForVariation.variations}
          mainColor={mainColor}
          onSelectVariation={(variation) => {
            addItem({
              productId: selectedProductForVariation.id,
              productTitle: selectedProductForVariation.title,
              price: variation.price,
              variationLabel: variation.label,
              image: selectedProductForVariation.images?.[0],
            });
            setSelectedProductForVariation(null);
          }}
        />
      )}
    </>
  );
}

