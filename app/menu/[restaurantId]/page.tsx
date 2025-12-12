'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { restaurantService } from '@/lib/api/restaurantService';
import type { PublicMenuDto } from '@/lib/api/types';
import { useCartStore } from '@/store/cartStore';
import { useMenuStore } from '@/store/menuStore';
import { CategoryTabs } from '@/components/cardapio/CategoryTabs';
import { SubcategoryList } from '@/components/cardapio/SubcategoryList';
import { ProductList } from '@/components/cardapio/ProductList';
import { MenuHeader } from '@/components/cardapio/MenuHeader';
import { ShoppingCart } from '@/components/cardapio/ShoppingCart';
import { Spinner } from '@/components/ui/Spinner';
import { getServiceTypeLabel } from '@/lib/utils/serviceType';

// Tipos locais para compatibilidade com componentes
type Category = {
  id: number;
  restaurantId: number;
  title: string;
  active: boolean;
  order: number;
};

type Subcategory = {
  id: number;
  restaurantId: number;
  categoryId: number;
  title: string;
  active: boolean;
  order: number;
};

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

export default function CardapioPublicoPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.restaurantId as string;
  const tableNumberFromUrl = params.tableNumber as string | undefined;

  const [menu, setMenu] = useState<PublicMenuDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [allowOrders, setAllowOrders] = useState(false);
  const [tableNumber, setTableNumber] = useState(tableNumberFromUrl || null);
  const [productsWithAddons, setProductsWithAddons] = useState<Product[]>([]);

  const setTableNumberInCart = useCartStore((state) => state.setTableNumber);
  const setTableIdInCart = useCartStore((state) => state.setTableId);
  const setMenuInStore = useMenuStore((state) => state.setMenu);
  const getMenuFromStore = useMenuStore((state) => state.getMenu);

  // Definir número da mesa e tableId no carrinho se fornecido (apenas para pedidos de mesa)
  useEffect(() => {
    if (tableNumber) {
      setTableNumberInCart(tableNumber);
    } else {
      // Limpar tableNumber do store se não for pedido de mesa
      setTableNumberInCart(null);
    }
  }, [tableNumber, setTableNumberInCart]);

  // Converter dados da API para formato local
  const categories: Category[] = menu?.categories?.map(cat => ({
    id: cat.category.id,
    restaurantId: cat.category.restaurantId,
    title: cat.category.title || '',
    active: cat.category.active,
    order: cat.category.order,
  })) || [];

  const subcategories: Subcategory[] = menu?.categories?.flatMap(cat =>
    cat.subcategories?.map(sub => ({
      id: sub.subcategory.id,
      restaurantId: sub.subcategory.restaurantId,
      categoryId: sub.subcategory.categoryId,
      title: sub.subcategory.title || '',
      active: sub.subcategory.active,
      order: sub.subcategory.order,
    })) || []
  ) || [];

  // Converter produtos do menu
  const productsFromMenu: Product[] = menu?.categories?.flatMap(cat => {
    // Produtos das subcategorias
    const subcategoryProducts = cat.subcategories?.flatMap(sub =>
      (sub.products || []).map(prod => ({
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
        availableAddons: prod.availableAddons || [],
      })) || []
    ) || [];

    // Produtos diretamente na categoria (sem subcategoria)
    const categoryProducts = (cat.products || []).map(prod => ({
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
      availableAddons: prod.availableAddons || [],
    }));

    // Combinar produtos de subcategorias e da categoria
    return [...subcategoryProducts, ...categoryProducts];
  }) || [];

  // Usar produtos com adicionais carregados ou produtos do menu
  const products = productsWithAddons.length > 0 ? productsWithAddons : productsFromMenu;

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
  };

  // Função auxiliar para buscar adicionais dos produtos
  const loadAddonsForProducts = async (menuData: PublicMenuDto): Promise<Product[]> => {
    const productsToLoadAddons: Product[] = menuData.categories?.flatMap(cat => {
      const subcategoryProducts = cat.subcategories?.flatMap(sub =>
        (sub.products || []).map(prod => ({
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
          availableAddons: prod.availableAddons || [],
        })) || []
      ) || [];

      const categoryProducts = (cat.products || []).map(prod => ({
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
        availableAddons: prod.availableAddons || [],
      }));

      return [...subcategoryProducts, ...categoryProducts];
    }) || [];

    // Separar produtos que já têm adicionais dos que precisam buscar
    const productsWithAddons = productsToLoadAddons.filter(p => 
      p.availableAddons && p.availableAddons.length > 0
    );
    const productsWithoutAddons = productsToLoadAddons.filter(p => 
      !p.availableAddons || p.availableAddons.length === 0
    );

    // Se todos os produtos já têm adicionais, retornar direto
    if (productsWithoutAddons.length === 0) {
      return productsToLoadAddons;
    }

    // Buscar adicionais apenas para produtos que não têm, em lotes para não sobrecarregar
    const BATCH_SIZE = 10; // Processar 10 produtos por vez
    const { addonsService } = await import('@/lib/api/addonsService');
    
    const productsWithAddonsLoaded: Product[] = [...productsWithAddons];
    
    // Processar em lotes
    for (let i = 0; i < productsWithoutAddons.length; i += BATCH_SIZE) {
      const batch = productsWithoutAddons.slice(i, i + BATCH_SIZE);
      
      const batchResults = await Promise.all(
        batch.map(async (product) => {
          try {
            const productAddons = await addonsService.getByProduct(product.id);
            if (productAddons && productAddons.length > 0) {
              return {
                ...product,
                availableAddons: productAddons,
              };
            }
            return product;
          } catch (addonError) {
            console.error(`Erro ao buscar adicionais do produto ${product.id}:`, addonError);
            return product;
          }
        })
      );
      
      productsWithAddonsLoaded.push(...batchResults);
    }

    console.log(`Adicionais carregados: ${productsWithAddonsLoaded.filter(p => p.availableAddons && p.availableAddons.length > 0).length} de ${productsToLoadAddons.length} produtos`);
    return productsWithAddonsLoaded;
  };

  // Carregar menu público
  useEffect(() => {
    const loadMenu = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let currentMenuData: PublicMenuDto;

        // Verificar se já existe menu no store
        const cachedMenu = getMenuFromStore(slug);
        if (cachedMenu && !tableNumberFromUrl) {
          // Usar menu do cache se não houver tableNumber (menu de mesa pode ser diferente)
          currentMenuData = cachedMenu;
          setMenu(currentMenuData);
          // Verificar se pedidos via WhatsApp estão habilitados
          setAllowOrders(currentMenuData.restaurant.whatsAppOrderEnabled || false);
          // Limpar tableNumber do store quando não for pedido de mesa
          setTableNumber(null);
          setTableNumberInCart(null);
          
          // Buscar adicionais para produtos
          const productsWithAddons = await loadAddonsForProducts(currentMenuData);
          setProductsWithAddons(productsWithAddons);
          
          setIsLoading(false);
          
          // Continuar com a lógica de seleção de categoria
          const categoriaParam = searchParams.get('categoria');
          if (categoriaParam) {
            const categoriaId = Number(categoriaParam);
            const categoryExists = currentMenuData.categories?.some(
              (cat) => cat.category.id === categoriaId && cat.category.active
            );
            if (categoryExists) {
              setSelectedCategoryId(categoriaId);
            } else {
              const firstActiveCategory = currentMenuData.categories?.find(
                (cat) => cat.category.active
              );
              if (firstActiveCategory) {
                setSelectedCategoryId(firstActiveCategory.category.id);
              }
            }
          } else {
            const firstActiveCategory = currentMenuData.categories?.find(
              (cat) => cat.category.active
            );
            if (firstActiveCategory) {
              setSelectedCategoryId(firstActiveCategory.category.id);
            }
          }
          return;
        }

        // Se há tableNumber na URL, tentar carregar menu da mesa
        if (tableNumberFromUrl) {
          try {
            const tableMenuData = await restaurantService.getTableMenu(slug, tableNumberFromUrl);
            currentMenuData = tableMenuData.menu;
            setMenu(currentMenuData);
            setAllowOrders(true);
            setTableNumber(tableNumberFromUrl);
            // Salvar tableId no store quando o cardápio é carregado
            if (tableMenuData.tableId) {
              setTableIdInCart(tableMenuData.tableId);
            }
            // Não salvar menu de mesa no store (pode ser diferente do menu público)
            // Mas verificar se já existe menu público no store, se não, carregar e salvar
            if (!getMenuFromStore(slug)) {
              const publicMenu = await restaurantService.getPublicMenu(slug);
              setMenuInStore(slug, publicMenu);
            }
            // Buscar adicionais para produtos do menu da mesa
            const productsWithAddons = await loadAddonsForProducts(currentMenuData);
            setProductsWithAddons(productsWithAddons);
          } catch (tableError) {
            // Se falhar, carregar menu normal
            console.warn('Erro ao carregar menu da mesa, carregando menu normal:', tableError);
            currentMenuData = await restaurantService.getPublicMenu(slug);
            setMenu(currentMenuData);
            // Verificar se pedidos via WhatsApp estão habilitados
            setAllowOrders(currentMenuData.restaurant.whatsAppOrderEnabled || false);
            // Limpar tableNumber do store quando não for pedido de mesa
            setTableNumber(null);
            setTableNumberInCart(null);
            // Salvar menu no store para reutilização
            setMenuInStore(slug, currentMenuData);
            // Buscar adicionais para produtos
            const productsWithAddons = await loadAddonsForProducts(currentMenuData);
            setProductsWithAddons(productsWithAddons);
          }
        } else {
          // Carregar menu normal
          currentMenuData = await restaurantService.getPublicMenu(slug);
          setMenu(currentMenuData);
          // Verificar se pedidos via WhatsApp estão habilitados
          setAllowOrders(currentMenuData.restaurant.whatsAppOrderEnabled || false);
          // Limpar tableNumber do store quando não for pedido de mesa
          setTableNumber(null);
          setTableNumberInCart(null);
          // Salvar menu no store para reutilização
          setMenuInStore(slug, currentMenuData);
        }

        // Buscar adicionais para produtos
        const productsWithAddons = await loadAddonsForProducts(currentMenuData);
        setProductsWithAddons(productsWithAddons);

        // Verificar se há categoria na URL (query parameter)
        const categoriaParam = searchParams.get('categoria');
        if (categoriaParam) {
          const categoriaId = Number(categoriaParam);
          const categoryExists = currentMenuData.categories?.some(
            (cat) => cat.category.id === categoriaId && cat.category.active
          );
          if (categoryExists) {
            setSelectedCategoryId(categoriaId);
          } else {
            // Se a categoria não existe ou não está ativa, selecionar primeira categoria ativa
            const firstActiveCategory = currentMenuData.categories?.find(
              (cat) => cat.category.active
            );
            if (firstActiveCategory) {
              setSelectedCategoryId(firstActiveCategory.category.id);
            }
          }
        } else {
          // Selecionar primeira categoria ativa por padrão
          const firstActiveCategory = currentMenuData.categories?.find(
            (cat) => cat.category.active
          );
          if (firstActiveCategory) {
            setSelectedCategoryId(firstActiveCategory.category.id);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar menu:', error);
        setError('Restaurante não encontrado');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      loadMenu();
    }
  }, [slug, searchParams, tableNumberFromUrl, setTableIdInCart, setMenuInStore, getMenuFromStore]);

  // Resetar subcategoria selecionada quando categoria mudar
  useEffect(() => {
    setSelectedSubcategoryId(null);
  }, [selectedCategoryId]);

  // Detectar scroll para mostrar/ocultar botão de voltar ao topo
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setShowScrollTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Função para voltar ao topo
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Loading ou erro
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" color="#3b82f6" />
        </div>
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Restaurante não encontrado
          </h1>
          <p className="text-gray-600">
            O cardápio solicitado não está disponível.
          </p>
        </div>
      </div>
    );
  }

  const handleSelectCategory = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
  };

  const handleSelectSubcategory = (subcategoryId: number) => {
    setSelectedSubcategoryId(subcategoryId);
  };

  // Filtrar subcategorias da categoria selecionada
  const filteredSubcategories = selectedCategoryId
    ? subcategories
      .filter((sub) => sub.categoryId === selectedCategoryId && sub.active)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  // Filtrar produtos da categoria selecionada
  // Sempre mostrar todos os produtos da categoria (a subcategoria selecionada é apenas para scroll)
  const filteredProducts = selectedCategoryId
    ? products.filter((prod) => prod.categoryId === selectedCategoryId)
    : [];

  // Filtrar categorias ativas e ordenar
  const activeCategories = categories
    .filter((cat) => cat.active)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const formatPrice = (product: Product) => {
    if (product.priceType === 'unique' && product.price) {
      return `R$ ${product.price.toFixed(2).replace('.', ',')}`;
    }
    if (product.priceType === 'variable' && product.variations) {
      const minPrice = Math.min(...product.variations.map((v) => v.price));
      const maxPrice = Math.max(...product.variations.map((v) => v.price));
      if (minPrice === maxPrice) {
        return `R$ ${minPrice.toFixed(2).replace('.', ',')}`;
      }
      return `R$ ${minPrice.toFixed(2).replace('.', ',')} - R$ ${maxPrice.toFixed(2).replace('.', ',')}`;
    }
    return 'Preço sob consulta';
  };

  return (
    <div
      className={`min-h-screen ${config.darkMode ? 'bg-[#1F1F1F] text-white' : 'bg-white text-gray-900'}`}
      data-dark-mode={config.darkMode ? 'true' : 'false'}
    >
      {/* Cabeçalho */}
      <MenuHeader
        darkMode={config.darkMode}
        restaurantName={config.restaurantName}
        mainColor={config.mainColor}
        logo={config.logo}
        zIndex={10}
        paymentMethods={config.paymentMethods}
        backgroundImage={config.backgroundImage}
        address={config.address}
        about={config.about}
        openingHours={config.openingHours}
        mapUrl={config.mapUrl}
        serviceType={config.serviceType}
      />

      {/* Conteúdo */}
      <main className="max-w-6xl mx-auto py-8">
        {activeCategories.length === 0 ? (
          <div className="text-center py-12 px-4 sm:px-6 lg:px-8">
            <p className={`text-lg ${config.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Nenhum item disponível no momento.
            </p>
          </div>
        ) : (
          <>
            {/* Categorias - Row Horizontal Scrollável */}
            <div className="mb-2 sm:mb-6">
              <CategoryTabs
                darkMode={config.darkMode}
                categories={activeCategories}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={handleSelectCategory}
                mainColor={config.mainColor}
              />
            </div>

            {/* Subcategorias */}
            {selectedCategoryId && filteredSubcategories.length > 0 && (
              <div className="mb-2 sm:mb-6">
                <SubcategoryList
                  darkMode={config.darkMode}
                  subcategories={filteredSubcategories}
                  selectedSubcategoryId={selectedSubcategoryId}
                  onSelectSubcategory={handleSelectSubcategory}
                  mainColor={config.mainColor}
                />
              </div>
            )}

            {/* Produtos Agrupados por Subcategoria */}
            {selectedCategoryId && filteredProducts.length > 0 && (
              <ProductList
                darkMode={config.darkMode}
                products={filteredProducts}
                subcategories={filteredSubcategories}
                selectedSubcategoryId={selectedSubcategoryId}
                selectedCategoryId={selectedCategoryId}
                mainColor={config.mainColor}
                formatPrice={formatPrice}
                allowOrders={allowOrders}
              />
            )}

            {/* Mensagem quando não há produtos */}
            {selectedCategoryId && filteredProducts.length === 0 && (
              <div className="text-center py-12 px-4 sm:px-6 lg:px-8">
                <p className={`text-lg ${config.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Nenhum produto disponível nesta categoria.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Rodapé */}
      <footer className={`py-6 text-center ${config.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
        />
      )}

      {/* Botão flutuante para voltar ao topo */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
          style={{ backgroundColor: config.mainColor }}
          aria-label="Voltar ao topo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

