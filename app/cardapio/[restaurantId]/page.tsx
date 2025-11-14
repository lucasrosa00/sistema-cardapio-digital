'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRestaurantConfigStore } from '@/store/restaurantConfigStore';
import { useCategoriesStore } from '@/store/categoriesStore';
import { useSubcategoriesStore } from '@/store/subcategoriesStore';
import { useProductsStore } from '@/store/productsStore';
import { getUserByUrl } from '@/lib/mockUsers';
import { Category, Subcategory, Product } from '@/lib/mockData';
import { CategoryTabs } from '@/components/cardapio/CategoryTabs';
import { SubcategoryList } from '@/components/cardapio/SubcategoryList';
import { ProductList } from '@/components/cardapio/ProductList';

export default function CardapioPublicoPage() {
  const params = useParams();
  const restaurantUrl = params.restaurantId as string;

  const [restaurantUser, setRestaurantUser] = useState<ReturnType<typeof getUserByUrl> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<{
    restaurantName: string;
    mainColor: string;
    logo: string | null;
    darkMode: boolean;
  }>({
    restaurantName: "Exemplo Restaurante",
    mainColor: "#ff0000",
    logo: null,
    darkMode: false,
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);

  const getCategoriesByRestaurant = useCategoriesStore((state) => state.getCategoriesByRestaurant);
  const getSubcategoriesByRestaurant = useSubcategoriesStore((state) => state.getSubcategoriesByRestaurant);
  const getProductsByRestaurant = useProductsStore((state) => state.getProductsByRestaurant);
  const getConfig = useRestaurantConfigStore((state) => state.getConfig);
  const initializeConfig = useRestaurantConfigStore((state) => state.initializeConfig);

  // Buscar restaurante pela URL
  useEffect(() => {
    const user = getUserByUrl(restaurantUrl);
    if (user) {
      setRestaurantUser(user);
      // Inicializar config se não existir
      initializeConfig(user.id, user.restaurantName);
      // Carregar configurações do restaurante
      const restaurantConfig = getConfig(user.id);
      setConfig(restaurantConfig);
      // Carregar dados do restaurante diretamente dos stores principais
      const loadedCategories = getCategoriesByRestaurant(user.id);
      const loadedSubcategories = getSubcategoriesByRestaurant(user.id);
      const loadedProducts = getProductsByRestaurant(user.id);
      
      setCategories(loadedCategories);
      setSubcategories(loadedSubcategories);
      setProducts(loadedProducts);

      // Selecionar primeira categoria ativa por padrão
      const firstActiveCategory = loadedCategories.find((cat) => cat.active);
      if (firstActiveCategory) {
        setSelectedCategoryId(firstActiveCategory.id);
      }
    }
  }, [restaurantUrl, getCategoriesByRestaurant, getSubcategoriesByRestaurant, getProductsByRestaurant, getConfig, initializeConfig]);

  // Aplicar dark mode
  useEffect(() => {
    const root = document.documentElement;
    if (config.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [config.darkMode]);

  // Resetar subcategoria selecionada quando categoria mudar
  useEffect(() => {
    setSelectedSubcategoryId(null);
  }, [selectedCategoryId]);

  // Se restaurante não encontrado
  if (!restaurantUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Restaurante não encontrado
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            A URL "{restaurantUrl}" não corresponde a nenhum restaurante cadastrado.
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
      className={`min-h-screen transition-colors ${
        config.darkMode
          ? 'bg-gray-900 text-white'
          : 'bg-gray-50 text-gray-900'
      }`}
    >
      {/* Cabeçalho */}
      <header
        className="sticky top-0 z-10 shadow-lg"
        style={{
          backgroundColor: config.darkMode ? '#1f2937' : '#ffffff',
        }}
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
            <div>
              <h1
                className="text-2xl md:text-3xl font-bold"
                style={{ color: config.mainColor }}
              >
                {config.restaurantName || 'Cardápio Digital'}
              </h1>
              <p
                className={`text-sm mt-1 ${
                  config.darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Cardápio Digital
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-6xl mx-auto py-8">
        {activeCategories.length === 0 ? (
          <div className="text-center py-12 px-4 sm:px-6 lg:px-8">
            <p
              className={`text-lg ${
                config.darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Nenhum item disponível no momento.
            </p>
          </div>
        ) : (
          <>
            {/* Categorias - Row Horizontal Scrollável */}
            <div className="mb-6">
              <CategoryTabs
                categories={activeCategories}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={handleSelectCategory}
                mainColor={config.mainColor}
                darkMode={config.darkMode}
              />
            </div>

            {/* Subcategorias */}
            {selectedCategoryId && filteredSubcategories.length > 0 && (
              <div className="mb-6">
                <SubcategoryList
                  subcategories={filteredSubcategories}
                  selectedSubcategoryId={selectedSubcategoryId}
                  onSelectSubcategory={handleSelectSubcategory}
                  mainColor={config.mainColor}
                  darkMode={config.darkMode}
                />
              </div>
            )}

            {/* Produtos Agrupados por Subcategoria */}
            {selectedCategoryId && filteredProducts.length > 0 && (
              <ProductList
                products={filteredProducts}
                subcategories={filteredSubcategories}
                selectedSubcategoryId={selectedSubcategoryId}
                mainColor={config.mainColor}
                darkMode={config.darkMode}
                formatPrice={formatPrice}
              />
            )}

            {/* Mensagem quando não há produtos */}
            {selectedCategoryId && filteredProducts.length === 0 && (
              <div className="text-center py-12 px-4 sm:px-6 lg:px-8">
                <p
                  className={`text-lg ${
                    config.darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Nenhum produto disponível nesta categoria.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Rodapé */}
      <footer
        className={`mt-12 py-6 text-center ${
          config.darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
        <p className="text-sm">
          © {new Date().getFullYear()} {config.restaurantName || 'Cardápio Digital'}
        </p>
      </footer>
    </div>
  );
}

