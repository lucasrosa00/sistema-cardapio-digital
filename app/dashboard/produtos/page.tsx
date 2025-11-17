'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProductsStore } from '@/store/productsStore';
import { useCategoriesStore } from '@/store/categoriesStore';
import { useSubcategoriesStore } from '@/store/subcategoriesStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Product } from '@/lib/mockData';

export default function ProdutosPage() {
  const router = useRouter();
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const {
    getProductsByRestaurant,
    deleteProduct,
  } = useProductsStore();
  const { getCategoriesByRestaurant } = useCategoriesStore();
  const { getSubcategoriesByRestaurant } = useSubcategoriesStore();

  const products = restaurantId ? getProductsByRestaurant(restaurantId) : [];
  const categories = restaurantId ? getCategoriesByRestaurant(restaurantId) : [];
  const subcategories = restaurantId ? getSubcategoriesByRestaurant(restaurantId) : [];

  const [deletingId, setDeletingId] = useState<number | null>(null);

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
    await new Promise((resolve) => setTimeout(resolve, 300));
    deleteProduct(id);
    setDeletingId(null);
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
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
              <Button
                variant="primary"
                onClick={() => router.push('/dashboard/produtos/cadastrar')}
              >
                Cadastrar
              </Button>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
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
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      Nenhum produto encontrado
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
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
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {product.description}
                      </td>
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
        </div>
      </div>
    </div>
  );
}

