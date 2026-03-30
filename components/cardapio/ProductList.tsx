'use client';

import { useRef, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Product, Subcategory } from '@/lib/mockData';
import { ProductImageCarousel } from './ProductImageCarousel';
import { VariationSelectionModal } from './VariationSelectionModal';
import { ProductAddons } from '@/components/ui/ProductAddons';
import { useCartStore, type CartItemAddon, type CartItemSelectedOption } from '@/store/cartStore';
import {
  ProductOptionGroupsSelector,
  areOptionGroupsComplete,
} from '@/components/cardapio/ProductOptionGroupsSelector';
import { productHasActiveOptionGroups } from '@/lib/utils/productOptionGroups';

interface ProductListProps {
  products: Product[];
  subcategories: Subcategory[];
  selectedSubcategoryId: number | null;
  selectedCategoryId: number | null;
  mainColor: string;
  formatPrice: (product: Product) => string;
  allowOrders?: boolean;
  darkMode?: boolean;
  serviceType?: 'Menu' | 'Catalog' | null;
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
  serviceType = 'Menu',
}: ProductListProps) {
  const params = useParams();
  const restaurantId = params.restaurantId as string;
  const tableNumberFromUrl = params.tableNumber as string | undefined;
  const tableNumber = tableNumberFromUrl || null;
  const subcategoryRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const addItem = useCartStore((state) => state.addItem);
  const [selectedProductForVariation, setSelectedProductForVariation] = useState<Product | null>(null);
  // Estado para gerenciar adicionais selecionados por produto
  const [selectedAddonsByProduct, setSelectedAddonsByProduct] = useState<Record<number, CartItemAddon[]>>({});
  const [selectedOptionsByProduct, setSelectedOptionsByProduct] = useState<
    Record<number, CartItemSelectedOption[]>
  >({});

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
          const subcategoryProducts = [...(productsBySubcategory[subcategoryId] || [])].sort(
            (a, b) => {
              const aUnavail = a.isAvailable === false ? 1 : 0;
              const bUnavail = b.isAvailable === false ? 1 : 0;
              if (aUnavail !== bUnavail) return aUnavail - bUnavail;
              return (a.order || 0) - (b.order || 0);
            }
          );
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

                  const isUnavailable = product.isAvailable === false;
                  const hasOg = productHasActiveOptionGroups(product.optionGroups);
                  const optSel = selectedOptionsByProduct[product.id] || [];
                  const optionsOk = !hasOg || areOptionGroupsComplete(product.optionGroups || [], optSel);
                  return (
                    <div
                      key={product.id}
                      className={`block rounded-lg overflow-hidden transition-all ${darkMode ? 'bg-[#1F1F1F] border border-[#2F2F2F]' : 'bg-white border border-gray-200 hover:border-gray-300'} hover:shadow-lg`}
                    >
                      {/* Conteúdo superior: Título/Descrição e Imagem - Linkável */}
                      <Link
                        href={productUrl}
                        className="flex flex-row cursor-pointer touch-manipulation"
                        style={{ touchAction: 'manipulation' }}
                      >
                        {/* Informações do Produto */}
                        <div className="p-4 flex-1 flex flex-col">
                          <h4 className="text-lg font-semibold mb-2">
                            {product.title}
                          </h4>
                          <p className={`text-sm whitespace-pre-line ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {product.description}
                          </p>
                          {isUnavailable && (
                            <p className="flex items-center gap-1.5 text-sm font-medium text-red-500 mt-2">
                              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                              Indisponível
                            </p>
                          )}
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
                      </Link>

                      {/* Preço ou Variações - Ocupa 100% da largura */}
                      <div className={`px-4 pb-4 w-full ${darkMode ? 'border-t border-[#2F2F2F]' : 'border-t border-gray-100'}`}>
                        {product.priceType === 'unique' ? (
                          <div className="pt-4 space-y-4">
                            <div className="flex justify-between items-center gap-2 flex-wrap">
                              <div
                                className="text-xl font-bold"
                                style={{ color: mainColor }}
                              >
                                {formatPrice(product)}
                              </div>
                              {allowOrders && product.price && !isUnavailable && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (hasOg && !optionsOk) return;
                                    const selectedAddons = selectedAddonsByProduct[product.id] || [];
                                    addItem({
                                      productId: product.id,
                                      productTitle: product.title,
                                      price: product.price!,
                                      image: product.images?.[0],
                                      addons: selectedAddons.length > 0 ? selectedAddons : undefined,
                                      selectedOptions: optSel.length > 0 ? optSel : undefined,
                                    });
                                    setSelectedAddonsByProduct(prev => {
                                      const newState = { ...prev };
                                      delete newState[product.id];
                                      return newState;
                                    });
                                    setSelectedOptionsByProduct(prev => {
                                      const newState = { ...prev };
                                      delete newState[product.id];
                                      return newState;
                                    });
                                  }}
                                  disabled={hasOg && !optionsOk}
                                  className="px-4 py-2 rounded-lg font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                  style={{ backgroundColor: mainColor }}
                                >
                                  {hasOg && !optionsOk ? 'Escolha as opções' : 'Adicionar'}
                                </button>
                              )}
                            </div>

                            {hasOg && !isUnavailable && product.optionGroups && (
                              <div onClick={(e) => e.stopPropagation()} className="mt-2">
                                <ProductOptionGroupsSelector
                                  groups={product.optionGroups}
                                  value={optSel}
                                  onChange={(v) =>
                                    setSelectedOptionsByProduct((prev) => ({
                                      ...prev,
                                      [product.id]: v,
                                    }))
                                  }
                                  mainColor={mainColor}
                                  darkMode={darkMode}
                                  serviceType={serviceType}
                                />
                              </div>
                            )}

                            {/* Adicionais */}
                            {product.availableAddons && product.availableAddons.length > 0 && !isUnavailable && (
                              <div onClick={(e) => e.stopPropagation()}>
                                <ProductAddons
                                  addons={product.availableAddons}
                                  allowSelection={allowOrders}
                                  mainColor={mainColor}
                                  darkMode={darkMode}
                                  selectedAddons={selectedAddonsByProduct[product.id] || []}
                                  onAddonsChange={(addons) => {
                                    setSelectedAddonsByProduct(prev => ({
                                      ...prev,
                                      [product.id]: addons,
                                    }));
                                  }}
                                  collapsible
                                />
                              </div>
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

                            {/* Adicionais */}
                            {product.availableAddons && product.availableAddons.length > 0 && !isUnavailable && (
                              <div className="mb-4" onClick={(e) => e.stopPropagation()}>
                                <ProductAddons
                                  addons={product.availableAddons}
                                  allowSelection={allowOrders}
                                  mainColor={mainColor}
                                  darkMode={darkMode}
                                  selectedAddons={selectedAddonsByProduct[product.id] || []}
                                  onAddonsChange={(addons) => {
                                    setSelectedAddonsByProduct(prev => ({
                                      ...prev,
                                      [product.id]: addons,
                                    }));
                                  }}
                                  collapsible
                                />
                              </div>
                            )}

                            {allowOrders && !isUnavailable && (
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
                                  {productHasActiveOptionGroups(product.optionGroups)
                                    ? 'Escolher opções'
                                    : 'Adicionar'}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
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
          onClose={() => {
            setSelectedProductForVariation(null);
            setSelectedAddonsByProduct(prev => {
              const newState = { ...prev };
              delete newState[selectedProductForVariation.id];
              return newState;
            });
            setSelectedOptionsByProduct(prev => {
              const newState = { ...prev };
              delete newState[selectedProductForVariation.id];
              return newState;
            });
          }}
          productTitle={selectedProductForVariation.title}
          variations={selectedProductForVariation.variations}
          mainColor={mainColor}
          darkMode={darkMode}
          availableAddons={selectedProductForVariation.availableAddons}
          allowSelection={allowOrders}
          optionGroups={selectedProductForVariation.optionGroups}
          serviceType={serviceType}
          onSelectVariation={(variation, addons, selectedOptions) => {
            addItem({
              productId: selectedProductForVariation.id,
              productTitle: selectedProductForVariation.title,
              price: variation.price,
              variationLabel: variation.label,
              image: selectedProductForVariation.images?.[0],
              addons: addons,
              selectedOptions: selectedOptions?.length ? selectedOptions : undefined,
            });
            setSelectedProductForVariation(null);
            setSelectedAddonsByProduct(prev => {
              const newState = { ...prev };
              delete newState[selectedProductForVariation.id];
              return newState;
            });
            setSelectedOptionsByProduct(prev => {
              const newState = { ...prev };
              delete newState[selectedProductForVariation.id];
              return newState;
            });
          }}
        />
      )}
    </>
  );
}

