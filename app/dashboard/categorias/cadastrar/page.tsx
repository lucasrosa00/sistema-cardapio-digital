'use client';

import { useState, FormEvent, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCategoriesStore } from '@/store/categoriesStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';

export default function CadastrarCategoriaPage() {
  const router = useRouter();
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const addCategory = useCategoriesStore((state) => state.addCategory);
  const { getCategoriesByRestaurant } = useCategoriesStore();
  
  const categories = restaurantId ? getCategoriesByRestaurant(restaurantId) : [];
  
  // Calcula a maior ordem atual para as opções do select
  const maxOrder = categories.length === 0 
    ? 0 
    : Math.max(...categories.map(c => c.order || 0));

  // Inicializa o formData com a ordem inicial calculada uma única vez
  const [formData, setFormData] = useState(() => {
    // Calcula a ordem inicial no momento da inicialização
    const initialCategories = restaurantId ? getCategoriesByRestaurant(restaurantId) : [];
    const calculatedMaxOrder = initialCategories.length === 0 
      ? 0 
      : Math.max(...initialCategories.map(c => c.order || 0));
    return {
      title: '',
      active: true,
      order: String(calculatedMaxOrder + 1),
    };
  });
  const [errors, setErrors] = useState<{ title?: string; order?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gera as opções do select: de 1 até maxOrder + 1
  const orderOptions = useMemo(() => {
    const options = [];
    const maxAvailableOrder = maxOrder + 1;
    for (let i = 1; i <= maxAvailableOrder; i++) {
      options.push({
        value: String(i),
        label: String(i),
      });
    }
    return options;
  }, [maxOrder]);

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

    setIsSubmitting(true);

    // Simula delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!restaurantId) {
      alert('Erro: Restaurante não identificado. Faça login novamente.');
      router.push('/login');
      return;
    }

    try {
      addCategory(
        {
          title: formData.title.trim(),
          active: formData.active,
          restaurantId,
          order: selectedOrder,
        },
        restaurantId
      );

      router.push('/dashboard/categorias');
    } catch (error) {
      console.error('Erro ao cadastrar categoria:', error);
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
              Cadastrar Categoria
            </h1>
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
                Salvar
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
