'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { restaurantService } from '@/lib/api/restaurantService';
import type { PublicMenuDto, CategoryWithProductsDto, SubcategoryWithProductsDto, ProductDto } from '@/lib/api/types';
import { CategoryTabs } from '@/components/cardapio/CategoryTabs';
import { SubcategoryList } from '@/components/cardapio/SubcategoryList';
import { ProductList } from '@/components/cardapio/ProductList';
import { MenuHeader } from '@/components/cardapio/MenuHeader';
import { Spinner } from '@/components/ui/Spinner';

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
};

export default function CardapioPublicoPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.restaurantId as string;

  const [menu, setMenu] = useState<PublicMenuDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  const products: Product[] = menu?.categories?.flatMap(cat => {
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
    }));

    // Combinar produtos de subcategorias e da categoria
    return [...subcategoryProducts, ...categoryProducts];
  }) || [];

  const config = menu?.restaurant ? {
    restaurantName: menu.restaurant.restaurantName || 'Cardápio Digital',
    mainColor: menu.restaurant.mainColor || '#ff0000',
    logo: menu.restaurant.logo || null,
    backgroundImage: menu.restaurant.backgroundImage || null,
    paymentMethods: menu.restaurant.paymentMethods || null,
    address: menu.restaurant.address || null,
    about: menu.restaurant.about || null,
    openingHours: menu.restaurant.openingHours || null,
    mapUrl: menu.restaurant.mapUrl || null,
  } : {
    restaurantName: 'Cardápio Digital',
    mainColor: '#ff0000',
    logo: null,
    backgroundImage: null,
    paymentMethods: null,
    address: null,
    about: null,
    openingHours: null,
    mapUrl: null,
  };

  // Carregar menu público
  useEffect(() => {
    const loadMenu = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const menuData = await restaurantService.getPublicMenu(slug);
        console.log("menuData: ", menuData)
        setMenu(menuData);

        // Verificar se há categoria na URL (query parameter)
        const categoriaParam = searchParams.get('categoria');
        if (categoriaParam) {
          const categoriaId = Number(categoriaParam);
          const categoryExists = menuData.categories?.some(cat => cat.category.id === categoriaId && cat.category.active);
          if (categoryExists) {
            setSelectedCategoryId(categoriaId);
          } else {
            // Se a categoria não existe ou não está ativa, selecionar primeira categoria ativa
            const firstActiveCategory = menuData.categories?.find(cat => cat.category.active);
            if (firstActiveCategory) {
              setSelectedCategoryId(firstActiveCategory.category.id);
            }
          }
        } else {
          // Selecionar primeira categoria ativa por padrão
          const firstActiveCategory = menuData.categories?.find(cat => cat.category.active);
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
  }, [slug, searchParams]);


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
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Cabeçalho */}
      <MenuHeader
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
      />

      {/* Conteúdo */}
      <main className="max-w-6xl mx-auto py-8">
        {activeCategories.length === 0 ? (
          <div className="text-center py-12 px-4 sm:px-6 lg:px-8">
            <p className="text-lg text-gray-600">
              Nenhum item disponível no momento.
            </p>
          </div>
        ) : (
          <>
            {/* Categorias - Row Horizontal Scrollável */}
            <div className="mb-2 sm:mb-6">
              <CategoryTabs
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
                products={filteredProducts}
                subcategories={filteredSubcategories}
                selectedSubcategoryId={selectedSubcategoryId}
                selectedCategoryId={selectedCategoryId}
                mainColor={config.mainColor}
                formatPrice={formatPrice}
              />
            )}

            {/* Mensagem quando não há produtos */}
            {selectedCategoryId && filteredProducts.length === 0 && (
              <div className="text-center py-12 px-4 sm:px-6 lg:px-8">
                <p className="text-lg text-gray-600">
                  Nenhum produto disponível nesta categoria.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Rodapé */}
      <footer className="py-6 text-center text-gray-600">
        <p className="text-sm">
          © {new Date().getFullYear()} {config.restaurantName || 'Cardápio Digital'}
        </p>
      </footer>

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

