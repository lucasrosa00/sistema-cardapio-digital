'use client';

import { useState, FormEvent, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProductsStore } from '@/store/productsStore';
import { useCategoriesStore } from '@/store/categoriesStore';
import { useSubcategoriesStore } from '@/store/subcategoriesStore';
import { useAuthStore } from '@/store/authStore';
import { ProductVariation } from '@/lib/mockData';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { ProductVariations } from '@/components/ui/ProductVariations';

export default function EditarProdutoPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const { getProductsByRestaurant, loadProducts } = useProductsStore();
  const updateProduct = useProductsStore((state) => state.updateProduct);
  const { getCategoriesByRestaurant } = useCategoriesStore();
  const { getSubcategoriesByRestaurant } = useSubcategoriesStore();
  
  const products = restaurantId ? getProductsByRestaurant(restaurantId) : [];
  const categories = restaurantId ? getCategoriesByRestaurant(restaurantId) : [];
  const subcategories = restaurantId ? getSubcategoriesByRestaurant(restaurantId) : [];
  const product = products.find((prod) => prod.id === id);

  // Calcula a maior ordem atual (global, todos os produtos do restaurante)
  const maxOrder = products.length === 0 
    ? 1 
    : Math.max(...products.map(prod => prod.order || 0));

  const [formData, setFormData] = useState({
    categoryId: '',
    subcategoryId: '',
    title: '',
    description: '',
    priceType: 'unique' as 'unique' | 'variable',
    price: '',
    variations: [] as ProductVariation[],
    images: [] as string[],
    active: true,
    order: '1',
  });

  const [errors, setErrors] = useState<{
    categoryId?: string;
    subcategoryId?: string;
    title?: string;
    description?: string;
    price?: string;
    variations?: string;
    order?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrar subcategorias baseado na categoria selecionada
  const availableSubcategories = subcategories.filter(
    (sub) => sub.categoryId === Number(formData.categoryId)
  );

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.title,
  }));

  const subcategoryOptions = availableSubcategories.map((sub) => ({
    value: sub.id,
    label: sub.title,
  }));

  // Gera as opções do select de ordem: de 1 até maxOrder
  const orderOptions = useMemo(() => {
    const options = [];
    for (let i = 1; i <= maxOrder; i++) {
      options.push({
        value: String(i),
        label: String(i),
      });
    }
    return options;
  }, [maxOrder]);

  useEffect(() => {
    if (product) {
      setFormData({
        categoryId: String(product.categoryId),
        subcategoryId: String(product.subcategoryId),
        title: product.title,
        description: product.description,
        priceType: product.priceType,
        price: product.price ? String(product.price) : '',
        variations: product.variations || [],
        images: product.images || [],
        active: product.active,
        order: String(product.order || 1),
      });
    }
  }, [product]);

  // Reset subcategoria quando categoria mudar (mas não no primeiro carregamento)
  useEffect(() => {
    if (formData.categoryId && product) {
      const currentSubcategory = subcategories.find(
        (sub) => sub.id === Number(formData.subcategoryId)
      );
      // Se a subcategoria atual não pertence à nova categoria, resetar
      if (currentSubcategory && currentSubcategory.categoryId !== Number(formData.categoryId)) {
        setFormData((prev) => ({ ...prev, subcategoryId: '' }));
      }
    }
  }, [formData.categoryId, product, subcategories]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    // Validação
    const newErrors: typeof errors = {};

    if (!formData.categoryId) {
      newErrors.categoryId = 'Selecione uma categoria';
    }
    if (!formData.subcategoryId) {
      newErrors.subcategoryId = 'Selecione uma subcategoria';
    }
    if (!formData.title.trim()) {
      newErrors.title = 'O título é obrigatório';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'A descrição é obrigatória';
    }

    if (formData.priceType === 'unique') {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        newErrors.price = 'Informe um preço válido';
      }
    } else {
      if (formData.variations.length === 0) {
        newErrors.variations = 'Adicione pelo menos uma variação';
      } else {
        const hasInvalidVariation = formData.variations.some(
          (v) => !v.label.trim() || v.price <= 0
        );
        if (hasInvalidVariation) {
          newErrors.variations = 'Todas as variações devem ter label e preço válidos';
        }
      }
    }

    const selectedOrder = Number(formData.order);
    if (!selectedOrder || selectedOrder < 1) {
      newErrors.order = 'Selecione uma ordem válida';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!product) {
      alert('Produto não encontrado');
      router.push('/dashboard/produtos');
      return;
    }

    setIsSubmitting(true);

    try {
      const productData: any = {
        categoryId: Number(formData.categoryId),
        subcategoryId: Number(formData.subcategoryId),
        title: formData.title.trim(),
        description: formData.description.trim(),
        priceType: formData.priceType,
        active: formData.active,
        images: formData.images,
        order: selectedOrder,
      };

      if (formData.priceType === 'unique') {
        productData.price = parseFloat(formData.price);
        productData.variations = undefined;
      } else {
        productData.variations = formData.variations;
        productData.price = undefined;
      }

      await updateProduct(id, productData);

      // Recarregar produtos para garantir sincronização
      await loadProducts();

      router.push('/dashboard/produtos');
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      alert('Erro ao atualizar produto. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? checked 
        : type === 'radio' 
          ? value
          : type === 'number'
            ? value === '' ? '' : Number(value) || ''
            : value,
    }));

    // Limpa erro quando o usuário começa a digitar/selecionar
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (!product) {
    return (
      <div className="bg-gray-50 min-h-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Produto não encontrado
            </h1>
            <p className="text-gray-600 mb-6">
              O produto que você está tentando editar não existe.
            </p>
            <Button variant="secondary" onClick={() => router.push('/dashboard/produtos')}>
              Voltar para Listagem
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <Button
              variant="secondary"
              onClick={() => router.push('/dashboard/produtos')}
              className="mb-4"
            >
              ← Voltar
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              Editar Produto
            </h1>
            <p className="text-sm text-gray-500 mt-1">ID: {id}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Categoria *"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                options={[
                  { value: '', label: 'Selecione uma categoria' },
                  ...categoryOptions,
                ]}
                error={errors.categoryId}
                required
              />

              <Select
                label="Subcategoria *"
                name="subcategoryId"
                value={formData.subcategoryId}
                onChange={handleChange}
                options={[
                  { value: '', label: 'Selecione uma subcategoria' },
                  ...subcategoryOptions,
                ]}
                error={errors.subcategoryId}
                disabled={!formData.categoryId}
                required
              />
            </div>

            <Input
              label="Título *"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Batata Frita, Bife Ancho"
              error={errors.title}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descreva o produto..."
                rows={4}
                className={`
                  w-full px-4 py-2 border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  transition-colors
                  ${errors.description ? 'border-red-500' : 'border-gray-300'}
                `}
                required
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo de Preço *
              </label>
              <div className="flex gap-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="priceType"
                    value="unique"
                    checked={formData.priceType === 'unique'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Preço Único</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="priceType"
                    value="variable"
                    checked={formData.priceType === 'variable'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Preço Variável</span>
                </label>
              </div>
            </div>

            {formData.priceType === 'unique' ? (
              <Input
                label="Preço (R$) *"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                error={errors.price}
                required
              />
            ) : (
              <div>
                <ProductVariations
                  variations={formData.variations}
                  onChange={(variations) =>
                    setFormData((prev) => ({ ...prev, variations }))
                  }
                />
                {errors.variations && (
                  <p className="mt-1 text-sm text-red-500">{errors.variations}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Imagens do Produto
              </label>
              <ImageUpload
                images={formData.images}
                onImagesChange={(images) =>
                  setFormData((prev) => ({ ...prev, images }))
                }
                maxImages={5}
              />
            </div>

            <Select
              label="Ordem *"
              name="order"
              value={formData.order}
              onChange={handleChange}
              options={orderOptions}
              error={errors.order}
              required
            />

            <Checkbox
              label="Produto ativo"
              name="active"
              checked={formData.active}
              onChange={handleChange}
            />

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="flex-1"
              >
                Salvar Alterações
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/dashboard/produtos')}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
