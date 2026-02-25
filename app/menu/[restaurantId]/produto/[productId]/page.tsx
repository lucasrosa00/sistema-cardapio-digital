'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { restaurantService } from '@/lib/api/restaurantService';
import type { PublicMenuDto } from '@/lib/api/types';
import { useCartStore } from '@/store/cartStore';
import { useMenuStore } from '@/store/menuStore';
import { ProductImageCarousel } from '@/components/cardapio/ProductImageCarousel';
import { MenuHeader } from '@/components/cardapio/MenuHeader';
import { ShoppingCart } from '@/components/cardapio/ShoppingCart';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { ProductAddons } from '@/components/ui/ProductAddons';
import { getServiceTypeLabel } from '@/lib/utils/serviceType';
import type { CartItemAddon } from '@/store/cartStore';

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
  availableAddons?: Array<{
    id: number;
    productAddonId: number;
    name: string | null;
    description: string | null;
    extraPrice: number;
    active: boolean;
  }>;
};

export default function ProdutoDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.restaurantId as string;
  const productId = Number(params.productId);
  const tableNumberFromParams = params.tableNumber as string | undefined;
  const tableNumberFromQuery = searchParams.get('mesa');
  // Prioridade: URL params > Query param (apenas da URL, não do carrinho)
  const tableNumber = tableNumberFromParams || tableNumberFromQuery || null;

  const [menu, setMenu] = useState<PublicMenuDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);
  const [allowOrders, setAllowOrders] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<CartItemAddon[]>([]);

  const addItem = useCartStore((state) => state.addItem);
  const getMenuFromStore = useMenuStore((state) => state.getMenu);
  const setMenuInStore = useMenuStore((state) => state.setMenu);

  // Carregar menu e encontrar produto
  useEffect(() => {
    const loadMenu = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Verificar se já existe menu no store
        let menuData: PublicMenuDto | null = getMenuFromStore(slug);
        let canOrder = false;

        // Se não há menu no store ou há tableNumber (menu de mesa pode ser diferente), carregar
        if (!menuData || tableNumber) {
          if (tableNumber) {
            try {
              // Tentar carregar menu da mesa - se funcionar, a mesa está ativa
              const tableMenuData = await restaurantService.getTableMenu(slug, tableNumber);
              menuData = tableMenuData.menu;
              canOrder = true; // Se conseguiu carregar, a mesa está ativa e permite pedidos
              // Salvar tableId no store quando o cardápio é carregado
              if (tableMenuData.tableId) {
                const { setTableId } = useCartStore.getState();
                setTableId(tableMenuData.tableId);
              }
              // Não salvar menu de mesa no store (pode ser diferente do menu público)
            } catch {
              // Se falhar, mesa não está ativa ou não existe - tentar usar menu do store ou carregar
              menuData = getMenuFromStore(slug);
              if (!menuData) {
                menuData = await restaurantService.getPublicMenu(slug);
                setMenuInStore(slug, menuData);
              }
              // Verificar se pedidos via WhatsApp estão habilitados
              canOrder = menuData?.restaurant.whatsAppOrderEnabled || false;
            }
          } else {
            // Sem mesa - carregar menu normal
            menuData = await restaurantService.getPublicMenu(slug);
            // Verificar se pedidos via WhatsApp estão habilitados
            canOrder = menuData.restaurant.whatsAppOrderEnabled || false;
            // Salvar menu no store para reutilização
            setMenuInStore(slug, menuData);
          }
        }

        if (!menuData) {
          setError('Menu não encontrado');
          setIsLoading(false);
          return;
        }

        setMenu(menuData);
        // Verificar se pedidos via WhatsApp estão habilitados ou se é pedido de mesa
        setAllowOrders(canOrder || (menuData.restaurant.whatsAppOrderEnabled || false));

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
                  availableAddons: prod.availableAddons?.filter(addon => addon.active).map(addon => ({
                    id: addon.id,
                    productAddonId: addon.productAddonId,
                    name: addon.name,
                    description: addon.description,
                    extraPrice: addon.extraPrice,
                    active: addon.active,
                  })) || [],
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
                availableAddons: prod.availableAddons?.map(addon => ({
                  id: addon.id,
                  productAddonId: addon.productAddonId,
                  name: addon.name,
                  description: addon.description,
                  extraPrice: addon.extraPrice,
                  active: addon.active,
                })) || [],
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
  }, [slug, productId, tableNumber, getMenuFromStore, setMenuInStore]);

  const defaultServiceLabel = getServiceTypeLabel(menu?.restaurant?.serviceType);
  const config = menu?.restaurant ? {
    restaurantName: menu.restaurant.restaurantName || defaultServiceLabel,
    mainColor: menu.restaurant.mainColor || '#ff0000',
    logo: menu.restaurant.logo || null,
    backgroundImage: menu.restaurant.backgroundImage || null,
    darkMode: menu.restaurant.darkMode || false,
    serviceType: menu.restaurant.serviceType,
    paymentMethods: menu.restaurant.paymentMethods || null,
    address: menu.restaurant.address || null,
    about: menu.restaurant.about || null,
    openingHours: menu.restaurant.openingHours || null,
    mapUrl: menu.restaurant.mapUrl || null,
    whatsAppOrderEnabled: menu.restaurant.whatsAppOrderEnabled || false,
    whatsAppNumber: menu.restaurant.whatsAppNumber || null,
    deliveryFee: menu.restaurant.deliveryFee ?? 0,
    calculateDeliveryFee: (menu.restaurant as { calculateDeliveryFee?: boolean }).calculateDeliveryFee ?? false,
  } : {
    restaurantName: defaultServiceLabel,
    mainColor: '#ff0000',
    logo: null,
    backgroundImage: null,
    darkMode: false,
    serviceType: null,
    paymentMethods: null,
    address: null,
    about: null,
    openingHours: null,
    mapUrl: null,
    whatsAppOrderEnabled: false,
    whatsAppNumber: null,
    deliveryFee: 0,
    calculateDeliveryFee: false,
  };

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  // Loading
  if (isLoading) {
    return (
      <div
        className={`min-h-screen ${config.darkMode ? '' : 'bg-white'} flex items-center justify-center`}
        style={config.darkMode ? { backgroundColor: '#1F1F1F' } : {}}
      >
        <div className="text-center">
          <Spinner size="lg" color="#3b82f6" />
        </div>
      </div>
    );
  }

  // Erro ou produto não encontrado
  if (error || !product) {
    return (
      <div
        className={`min-h-screen ${config.darkMode ? '' : 'bg-white'} flex items-center justify-center`}
        style={config.darkMode ? { backgroundColor: '#1F1F1F' } : {}}
      >
        <div className="text-center px-4">
          <h1 className={`text-2xl font-bold mb-2 ${config.darkMode ? 'text-white' : 'text-gray-900'}`}>
            Produto não encontrado
          </h1>
          <p className={`mb-6 ${config.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            O produto que você está procurando não está disponível.
          </p>
          <button
            onClick={() => {
              const categoriaParam = searchParams.get('categoria');
              let baseUrl = tableNumber ? `/menu/${slug}/${tableNumber}` : `/menu/${slug}`;
              const url = categoriaParam
                ? `${baseUrl}?categoria=${categoriaParam}`
                : baseUrl;
              router.push(url);
            }}
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
    <div
      className={`min-h-screen ${config.darkMode ? 'text-white' : 'bg-white text-gray-900'}`}
      style={config.darkMode ? { backgroundColor: '#1F1F1F' } : {}}
      data-dark-mode={config.darkMode ? 'true' : 'false'}
    >
      {/* Cabeçalho */}
      <MenuHeader
        darkMode={config.darkMode}
        restaurantName={config.restaurantName}
        mainColor={config.mainColor}
        logo={config.logo}
        showBackButton={true}
        backUrl={(() => {
          const categoriaParam = searchParams.get('categoria');
          let baseUrl = tableNumber ? `/menu/${slug}/${tableNumber}` : `/menu/${slug}`;
          return categoriaParam
            ? `${baseUrl}?categoria=${categoriaParam}`
            : baseUrl;
        })()}
        zIndex={30}
        paymentMethods={config.paymentMethods}
        backgroundImage={config.backgroundImage}
        address={config.address}
        about={config.about}
        openingHours={config.openingHours}
        mapUrl={config.mapUrl}
        serviceType={config.serviceType}
      />

      {/* Conteúdo */}
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className={`${config.darkMode ? 'bg-[#1F1F1F]' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}>
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
                <h2 className={`text-xl md:text-2xl font-bold mb-3 ${config.darkMode ? 'text-white' : ''}`}>
                  {product.title}
                </h2>
                <p className={`text-sm md:text-base mb-6 ${config.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {product.description}
                </p>
              </div>

              {/* Preço ou Variações */}
              <div className={`border-t pt-4 ${config.darkMode ? 'border-[#2F2F2F]' : 'border-gray-200'}`}>
                {product.priceType === 'unique' ? (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <span className="text-xl md:text-2xl font-bold" style={{ color: config.mainColor }}>
                        {formatPrice(product.price || 0)}
                      </span>
                    </div>

                    {/* Adicionais */}
                    {product.availableAddons && product.availableAddons.length > 0 && (
                      <div className="mt-4">
                        <ProductAddons
                          addons={product.availableAddons}
                          allowSelection={allowOrders}
                          mainColor={config.mainColor}
                          darkMode={config.darkMode}
                          selectedAddons={selectedAddons}
                          onAddonsChange={(addons) => {
                            setSelectedAddons(addons);
                          }}
                        />
                      </div>
                    )}

                    {allowOrders && (
                      <Button
                        onClick={() => {
                          addItem({
                            productId: product.id,
                            productTitle: product.title,
                            price: product.price!,
                            image: product.images?.[0],
                            addons: selectedAddons.length > 0 ? selectedAddons : undefined,
                          });
                          setSelectedAddons([]);
                        }}
                        variant="primary"
                        className="w-full py-3 mt-4"
                        style={{ backgroundColor: config.mainColor }}
                      >
                        Adicionar
                      </Button>
                    )}
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
                          onClick={() => allowOrders ? setSelectedVariation(variation.label) : undefined}
                          className={`flex justify-between items-center p-3 rounded-lg border transition-colors cursor-pointer ${selectedVariation === variation.label
                            ? 'border-blue-500 bg-blue-50'
                            : config.darkMode
                              ? 'border-[#2F2F2F] hover:border-[#2F2F2F]'
                              : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <span className={`text-sm md:text-base font-medium ${config.darkMode ? 'text-white' : 'text-gray-900'}`}>
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

                    {/* Adicionais */}
                    {product.availableAddons && product.availableAddons.length > 0 && (
                      <div className="mt-4">
                        <ProductAddons
                          addons={product.availableAddons}
                          allowSelection={allowOrders}
                          mainColor={config.mainColor}
                          darkMode={config.darkMode}
                          selectedAddons={selectedAddons}
                          onAddonsChange={(addons) => {
                            setSelectedAddons(addons);
                          }}
                        />
                      </div>
                    )}

                    {allowOrders && (
                      <Button
                        onClick={() => {
                          if (!selectedVariation) {
                            alert('Por favor, selecione uma opção antes de adicionar o item ao pedido.');
                            return;
                          }
                          const variation = product.variations?.find(v => v.label === selectedVariation);
                          if (variation) {
                            addItem({
                              productId: product.id,
                              productTitle: product.title,
                              price: variation.price,
                              variationLabel: variation.label,
                              image: product.images?.[0],
                              addons: selectedAddons.length > 0 ? selectedAddons : undefined,
                            });
                            setSelectedVariation(null);
                            setSelectedAddons([]);
                          }
                        }}
                        variant="primary"
                        disabled={!selectedVariation}
                        className="w-full py-3 mt-4"
                        style={{ backgroundColor: config.mainColor }}
                      >
                        {selectedVariation ? 'Adicionar' : 'Selecione uma opção'}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Rodapé */}
      <footer className={`py-6 text-center ${config.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        <p className="text-sm">
          © {new Date().getFullYear()} {config.restaurantName || getServiceTypeLabel(config.serviceType)}
        </p>
      </footer>

      {/* Carrinho flutuante (apenas se pedidos estiverem habilitados) */}
      {allowOrders && (
        <ShoppingCart 
          mainColor={config.mainColor}
          whatsAppOrderEnabled={config.whatsAppOrderEnabled}
          whatsAppNumber={config.whatsAppNumber}
          restaurantName={config.restaurantName}
          serviceType={config.serviceType}
          deliveryFee={config.deliveryFee}
          calculateDeliveryFee={config.calculateDeliveryFee}
        />
      )}
    </div>
  );
}

