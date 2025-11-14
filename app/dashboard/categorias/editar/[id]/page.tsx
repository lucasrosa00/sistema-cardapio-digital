'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCategoriesStore } from '@/store/categoriesStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';

export default function EditarCategoriaPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const { getCategoriesByRestaurant } = useCategoriesStore();
  const updateCategory = useCategoriesStore((state) => state.updateCategory);
  
  const categories = restaurantId ? getCategoriesByRestaurant(restaurantId) : [];
  const category = categories.find((cat) => cat.id === id);

  const [formData, setFormData] = useState({
    title: '',
    active: true,
    order: 1,
  });
  const [errors, setErrors] = useState<{ title?: string; order?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        title: category.title,
        active: category.active,
        order: category.order || 1,
      });
    }
  }, [category]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    // Validação
    if (!formData.title.trim()) {
      setErrors({ title: 'O título é obrigatório' });
      return;
    }
    if (!formData.order || Number(formData.order) < 1) {
      setErrors({ order: 'A ordem deve ser maior ou igual a 1' });
      return;
    }

    if (!category) {
      alert('Categoria não encontrada');
      router.push('/dashboard/categorias');
      return;
    }

    setIsSubmitting(true);

    // Simula delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      updateCategory(id, {
        title: formData.title.trim(),
        active: formData.active,
        order: Number(formData.order) || 1,
      });

      router.push('/dashboard/categorias');
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? checked 
        : type === 'number' 
          ? value === '' ? '' : Number(value) || ''
          : value,
    }));
    // Limpa erro quando o usuário começa a digitar
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Categoria não encontrada
            </h1>
            <p className="text-gray-600 mb-6">
              A categoria que você está tentando editar não existe.
            </p>
            <Button variant="secondary" onClick={() => router.push('/dashboard/categorias')}>
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
              onClick={() => router.push('/dashboard/categorias')}
              className="mb-4"
            >
              ← Voltar
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              Editar Categoria
            </h1>
            <p className="text-sm text-gray-500 mt-1">ID: {id}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Título *"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Entradas, Pratos Principais, Bebidas"
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
              label="Categoria ativa"
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
                onClick={() => router.push('/dashboard/categorias')}
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
