'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { restaurantService } from '@/lib/api/restaurantService';
import type { PublicMenuDto } from '@/lib/api/types';
import { ProductImageCarousel } from '@/components/cardapio/ProductImageCarousel';
import { Spinner } from '@/components/ui/Spinner';

type Product = {
  id: number;
  restaurantId: number;
  categoryId: number;
  subcategoryId: number;
  title: string;
  description: string;
  priceType: 'unique' | 'variable';
  price?: number;
  variations?: { label: string; price: number }[];
  images?: string[];
  active: boolean;
  order: number;
};

export default function ProdutoDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.restaurantId as string;
  const productId = Number(params.productId);

  const [menu, setMenu] = useState<PublicMenuDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);

  // Carregar menu e encontrar produto
  useEffect(() => {
    const loadMenu = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const menuData = await restaurantService.getPublicMenu(slug);
        setMenu(menuData);

        // Buscar produto em todas as categorias
        let foundProduct: Product | null = null;
        
        menuData.categories?.forEach(cat => {
          // Produtos das subcategorias
          cat.subcategories?.forEach(sub => {
            sub.products?.forEach(prod => {
              if (prod.id === productId) {
                foundProduct = {
                  id: prod.id,
                  restaurantId: prod.restaurantId,
                  categoryId: prod.categoryId,
                  subcategoryId: prod.subcategoryId || sub.subcategory.id,
                  title: prod.title || '',
                  description: prod.description || '',
                  priceType: (prod.priceType as 'unique' | 'variable') || 'unique',
                  price: prod.price || undefined,
                  variations: prod.variations?.map(v => ({ label: v.label || '', price: v.price })),
                  images: prod.images || [],
                  active: prod.active,
                  order: prod.order,
                };
              }
            });
          });

          // Produtos diretamente na categoria
          cat.products?.forEach(prod => {
            if (prod.id === productId) {
              foundProduct = {
                id: prod.id,
                restaurantId: prod.restaurantId,
                categoryId: prod.categoryId,
                subcategoryId: prod.subcategoryId || 0,
                title: prod.title || '',
                description: prod.description || '',
                priceType: (prod.priceType as 'unique' | 'variable') || 'unique',
                price: prod.price || undefined,
                variations: prod.variations?.map(v => ({ label: v.label || '', price: v.price })),
                images: prod.images || [],
                active: prod.active,
                order: prod.order,
              };
            }
          });
        });

        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          setError('Produto não encontrado');
        }
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
        setError('Erro ao carregar produto');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug && productId) {
      loadMenu();
    }
  }, [slug, productId]);

  const config = menu?.restaurant ? {
    restaurantName: menu.restaurant.restaurantName || 'Cardápio Digital',
    mainColor: menu.restaurant.mainColor || '#ff0000',
    logo: menu.restaurant.logo || null,
  } : {
    restaurantName: 'Cardápio Digital',
    mainColor: '#ff0000',
    logo: null,
  };

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" color="#3b82f6" />
        </div>
      </div>
    );
  }

  // Erro ou produto não encontrado
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Produto não encontrado
          </h1>
          <p className="text-gray-600 mb-6">
            O produto que você está procurando não está disponível.
          </p>
          <button
            onClick={() => router.push(`/menu/${slug}`)}
            className="px-6 py-2 rounded-lg font-medium transition-colors"
            style={{ 
              backgroundColor: config.mainColor,
              color: '#ffffff'
            }}
          >
            Voltar ao Cardápio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Cabeçalho */}
      <header
        className="sticky top-0 z-30 shadow-lg bg-white"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            {config.logo && (
              <img
                src={config.logo}
                alt={config.restaurantName}
                className="w-16 h-16 object-contain rounded-lg"
              />
            )}
            <div className="flex-1">
              <h1
                className="text-2xl md:text-3xl font-bold"
                style={{ color: config.mainColor }}
              >
                {config.restaurantName || 'Cardápio Digital'}
              </h1>
              <p className="text-sm mt-1 text-gray-600">
                Cardápio Digital
              </p>
            </div>
            <button
              onClick={() => router.push(`/menu/${slug}`)}
              className="px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-80"
              style={{ 
                backgroundColor: config.mainColor,
                color: '#ffffff'
              }}
            >
              Voltar
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Imagens do Produto */}
            {product.images && product.images.length > 0 && (
              <div className="w-full md:w-1/2 p-6">
                <ProductImageCarousel
                  images={product.images}
                  productTitle={product.title}
                  disableAutoPlay={true}
                  alwaysShowControls={true}
                />
              </div>
            )}

            {/* Informações do Produto */}
            <div className={`w-full ${product.images && product.images.length > 0 ? 'md:w-1/2' : ''} p-6 flex flex-col justify-between`}>
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-3">
                  {product.title}
                </h2>
                <p className="text-sm md:text-base text-gray-600 mb-6">
                  {product.description}
                </p>
              </div>

              {/* Preço ou Variações */}
              <div className="border-t border-gray-200 pt-4">
                {product.priceType === 'unique' ? (
                  <div className="flex items-center gap-4">
                    <span className="text-xl md:text-2xl font-bold" style={{ color: config.mainColor }}>
                      {formatPrice(product.price || 0)}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h3
                      className="text-base md:text-lg font-semibold"
                      style={{ color: config.mainColor }}
                    >
                      Opções disponíveis:
                    </h3>
                    <div className="space-y-2">
                      {product.variations?.map((variation, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          <span className="text-sm md:text-base text-gray-900 font-medium">
                            {variation.label}
                          </span>
                          <span
                            className="text-lg md:text-xl font-bold"
                            style={{ color: config.mainColor }}
                          >
                            {formatPrice(variation.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Rodapé */}
      <footer className="py-6 text-center text-gray-600">
        <p className="text-sm">
          © {new Date().getFullYear()} {config.restaurantName || 'Cardápio Digital'}
        </p>
      </footer>
    </div>
  );
}

