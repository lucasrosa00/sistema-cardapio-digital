'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProductsStore } from '@/store/productsStore';
import { useCategoriesStore } from '@/store/categoriesStore';
import { useSubcategoriesStore } from '@/store/subcategoriesStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Select } from '@/components/ui/Select';
import { Product } from '@/lib/mockData';

const ITEMS_PER_PAGE = 12;

export default function ProdutosPage() {
  const router = useRouter();
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const {
    getProductsByRestaurant,
    deleteProduct,
    loadProducts,
    isLoading,
  } = useProductsStore();
  const { getCategoriesByRestaurant, loadCategories } = useCategoriesStore();
  const { getSubcategoriesByRestaurant, loadSubcategories } = useSubcategoriesStore();

  // Carregar dados ao montar o componente
  useEffect(() => {
    if (restaurantId) {
      loadProducts();
      loadCategories();
      loadSubcategories();
    }
  }, [restaurantId, loadProducts, loadCategories, loadSubcategories]);

  const products = restaurantId ? getProductsByRestaurant(restaurantId) : [];
  const categories = restaurantId ? getCategoriesByRestaurant(restaurantId) : [];
  const subcategories = restaurantId ? getSubcategoriesByRestaurant(restaurantId) : [];

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCategoryId, setFilterCategoryId] = useState<number | null>(null);
  const [filterSubcategoryId, setFilterSubcategoryId] = useState<number | null>(null);

  // Resetar subcategoria quando categoria mudar
  useEffect(() => {
    setFilterSubcategoryId(null);
  }, [filterCategoryId]);

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategoryId, filterSubcategoryId]);

  // Filtrar produtos baseado nos filtros
  const filteredProducts = products.filter((product) => {
    if (filterCategoryId && product.categoryId !== filterCategoryId) {
      return false;
    }
    if (filterSubcategoryId && product.subcategoryId !== filterSubcategoryId) {
      return false;
    }
    return true;
  });

  // Filtrar subcategorias baseado na categoria selecionada
  const filteredSubcategories = filterCategoryId
    ? subcategories.filter((sub) => sub.categoryId === filterCategoryId)
    : [];

  // Ajustar página quando o número de itens mudar (ex: após deletar)
  useEffect(() => {
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredProducts.length, currentPage]);

  // Calcular paginação
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.title || 'N/A';
  };

  const getSubcategoryName = (subcategoryId: number) => {
    const subcategory = subcategories.find((s) => s.id === subcategoryId);
    return subcategory?.title || 'N/A';
  };

  const formatPrice = (product: Product) => {
    if (product.priceType === 'unique' && product.price) {
      return `R$ ${product.price.toFixed(2)}`;
    }
    if (product.priceType === 'variable' && product.variations) {
      const minPrice = Math.min(...product.variations.map(v => v.price));
      const maxPrice = Math.max(...product.variations.map(v => v.price));
      if (minPrice === maxPrice) {
        return `R$ ${minPrice.toFixed(2)}`;
      }
      return `R$ ${minPrice.toFixed(2)} - R$ ${maxPrice.toFixed(2)}`;
    }
    return 'N/A';
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteProduct(id);
    } catch (error) {
      alert('Erro ao excluir produto. Tente novamente.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/dashboard/produtos/editar/${id}`);
  };

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="mb-4">
              <Button
                variant="secondary"
                onClick={() => router.push('/dashboard')}
                className="mb-4"
              >
                ← Voltar
              </Button>
            </div>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
              <Button
                variant="primary"
                onClick={() => router.push('/dashboard/produtos/cadastrar')}
              >
                Cadastrar
              </Button>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Filtrar por Categoria"
                value={filterCategoryId ? String(filterCategoryId) : ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilterCategoryId(value ? Number(value) : null);
                }}
                options={[
                  { value: '', label: 'Todas as categorias' },
                  ...categories.map((cat) => ({
                    value: String(cat.id),
                    label: cat.title || `Categoria ${cat.id}`,
                  })),
                ]}
                className="w-full"
              />
              <Select
                label="Filtrar por Subcategoria"
                value={filterSubcategoryId ? String(filterSubcategoryId) : ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilterSubcategoryId(value ? Number(value) : null);
                }}
                disabled={!filterCategoryId}
                options={[
                  { value: '', label: 'Todas as subcategorias' },
                  ...filteredSubcategories.map((sub) => ({
                    value: String(sub.id),
                    label: sub.title || `Subcategoria ${sub.id}`,
                  })),
                ]}
                className="w-full"
              />
              {(filterCategoryId || filterSubcategoryId) && (
                <div className="flex items-end">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setFilterCategoryId(null);
                      setFilterSubcategoryId(null);
                    }}
                    className="w-full"
                  >
                    Limpar Filtros
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ordem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subcategoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <Spinner size="md" color="#3b82f6" />
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      {products.length === 0
                        ? 'Nenhum produto encontrado'
                        : 'Nenhum produto encontrado com os filtros selecionados'}
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.order || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.title}
                      </td>
                      {/* <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {product.description}
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getCategoryName(product.categoryId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getSubcategoryName(product.subcategoryId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatPrice(product)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            onClick={() => handleEdit(product.id)}
                            className="px-3 py-1 text-xs"
                          >
                            Editar
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                            isLoading={deletingId === product.id}
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200"
                          >
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Controles de Paginação */}
          {filteredProducts.length > ITEMS_PER_PAGE && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700 text-center sm:text-left">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, filteredProducts.length)} de {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''}
                  {filterCategoryId || filterSubcategoryId ? ' (filtrados)' : ''}
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm"
                  >
                    Anterior
                  </Button>
                  <div className="text-sm text-gray-700 whitespace-nowrap">
                    Página {currentPage} de {totalPages}
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm"
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

