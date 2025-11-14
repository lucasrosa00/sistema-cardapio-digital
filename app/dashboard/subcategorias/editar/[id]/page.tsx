'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSubcategoriesStore } from '@/store/subcategoriesStore';
import { useCategoriesStore } from '@/store/categoriesStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';

export default function EditarSubcategoriaPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const { getSubcategoriesByRestaurant } = useSubcategoriesStore();
  const updateSubcategory = useSubcategoriesStore((state) => state.updateSubcategory);
  const { getCategoriesByRestaurant } = useCategoriesStore();
  
  const subcategories = restaurantId ? getSubcategoriesByRestaurant(restaurantId) : [];
  const categories = restaurantId ? getCategoriesByRestaurant(restaurantId) : [];
  const subcategory = subcategories.find((sub) => sub.id === id);

  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    active: true,
    order: 1,
  });
  const [errors, setErrors] = useState<{ categoryId?: string; title?: string; order?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.title,
  }));

  useEffect(() => {
    if (subcategory) {
      setFormData({
        categoryId: String(subcategory.categoryId),
        title: subcategory.title,
        active: subcategory.active,
        order: subcategory.order || 1,
      });
    }
  }, [subcategory]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    // Validação
    if (!formData.categoryId) {
      setErrors((prev) => ({ ...prev, categoryId: 'Selecione uma categoria' }));
    }
    if (!formData.title.trim()) {
      setErrors((prev) => ({ ...prev, title: 'O título é obrigatório' }));
    }

    if (!formData.categoryId || !formData.title.trim()) {
      return;
    }
    if (!formData.order || Number(formData.order) < 1) {
      setErrors((prev) => ({ ...prev, order: 'A ordem deve ser maior ou igual a 1' }));
      return;
    }

    if (!subcategory) {
      alert('Subcategoria não encontrada');
      router.push('/dashboard/subcategorias');
      return;
    }

    setIsSubmitting(true);

    // Simula delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      updateSubcategory(id, {
        categoryId: Number(formData.categoryId),
        title: formData.title.trim(),
        active: formData.active,
        order: Number(formData.order) || 1,
      });

      router.push('/dashboard/subcategorias');
    } catch (error) {
      console.error('Erro ao atualizar subcategoria:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' 
        ? value === '' ? '' : Number(value) || ''
        : value,
    }));
    // Limpa erro quando o usuário começa a digitar
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  if (!subcategory) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Subcategoria não encontrada
            </h1>
            <p className="text-gray-600 mb-6">
              A subcategoria que você está tentando editar não existe.
            </p>
            <Button variant="secondary" onClick={() => router.push('/dashboard/subcategorias')}>
              Voltar para Listagem
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <Button
              variant="secondary"
              onClick={() => router.push('/dashboard/subcategorias')}
              className="mb-4"
            >
              ← Voltar
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              Editar Subcategoria
            </h1>
            <p className="text-sm text-gray-500 mt-1">ID: {id}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <Input
              label="Título *"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Porções, Grelhados, Sobremesas"
              error={errors.title}
              required
            />

            <Input
              label="Ordem *"
              name="order"
              type="number"
              min="0"
              value={formData.order}
              onChange={handleChange}
              placeholder="1"
              error={errors.order}
              required
            />

            <Checkbox
              label="Subcategoria ativa"
              name="active"
              checked={formData.active}
              onChange={handleCheckboxChange}
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
                onClick={() => router.push('/dashboard/subcategorias')}
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
