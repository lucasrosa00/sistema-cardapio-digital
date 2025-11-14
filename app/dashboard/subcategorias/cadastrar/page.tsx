'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSubcategoriesStore } from '@/store/subcategoriesStore';
import { useCategoriesStore } from '@/store/categoriesStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';

export default function CadastrarSubcategoriaPage() {
  const router = useRouter();
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const addSubcategory = useSubcategoriesStore((state) => state.addSubcategory);
  const { getCategoriesByRestaurant } = useCategoriesStore();
  
  const categories = restaurantId ? getCategoriesByRestaurant(restaurantId) : [];
  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    active: true,
    order: 1,
  });
  const [errors, setErrors] = useState<{ categoryId?: string; title?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.title,
  }));

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

    setIsSubmitting(true);

    // Simula delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!restaurantId) {
      alert('Erro: Restaurante não identificado. Faça login novamente.');
      router.push('/login');
      return;
    }

    try {
      addSubcategory(
        {
          categoryId: Number(formData.categoryId),
          title: formData.title.trim(),
          active: formData.active,
          restaurantId,
          order: Number(formData.order) || 1,
        },
        restaurantId
      );

      router.push('/dashboard/subcategorias');
    } catch (error) {
      console.error('Erro ao cadastrar subcategoria:', error);
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
      [name]: type === 'number' ? Number(value) || 1 : value,
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
              Cadastrar Subcategoria
            </h1>
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
              min="1"
              value={formData.order}
              onChange={handleChange}
              placeholder="1"
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
                Salvar
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
