'use client';

import { useState, FormEvent, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCategoriesStore } from '@/store/categoriesStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Spinner } from '@/components/ui/Spinner';

export default function EditarCategoriaPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const restaurantId = useAuthStore((state) => state.restaurantId);
  const { getCategoriesByRestaurant, loadCategories, isLoading } = useCategoriesStore();
  const updateCategory = useCategoriesStore((state) => state.updateCategory);

  const categories = restaurantId ? getCategoriesByRestaurant(restaurantId) : [];
  const category = categories.find((cat) => cat.id === id);

  // Carregar categorias ao montar o componente
  useEffect(() => {
    if (restaurantId) {
      loadCategories().catch((error) => {
        console.error('Erro ao carregar categorias:', error);
      });
    }
  }, [restaurantId, loadCategories]);

  // Calcula a maior ordem atual (sem incluir +1, pois é edição)
  const maxOrder = useMemo(() => {
    if (categories.length === 0) return 1;
    return Math.max(...categories.map(c => c.order || 0));
  }, [categories]);

  // Gera as opções do select: de 1 até maxOrder
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

  const [formData, setFormData] = useState({
    title: '',
    active: true,
    order: '1',
  });
  const [errors, setErrors] = useState<{ title?: string; order?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        title: category.title,
        active: category.active,
        order: String(category.order || 1),
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
    const selectedOrder = Number(formData.order);
    if (!selectedOrder || selectedOrder < 1) {
      setErrors({ order: 'Selecione uma ordem válida' });
      return;
    }

    if (!category) {
      alert('Categoria não encontrada');
      router.push('/dashboard/categorias');
      return;
    }

    setIsSubmitting(true);

    try {
      await updateCategory(id, {
        title: formData.title.trim(),
        active: formData.active,
        order: selectedOrder,
      });

      // Recarregar categorias para garantir sincronização
      await loadCategories();

      router.push('/dashboard/categorias');
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      alert('Erro ao atualizar categoria. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox'
        ? checked
        : type === 'number'
          ? value === '' ? '' : Number(value) || ''
          : value,
    }));
    // Limpa erro quando o usuário começa a digitar/selecionar
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Mostrar loading enquanto carrega
  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-center">
              <Spinner size="md" color="#3b82f6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Só mostrar "não encontrada" se não estiver carregando e realmente não existir
  if (!category) {
    return (
      <div className="bg-gray-50 min-h-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
    <div className="bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
