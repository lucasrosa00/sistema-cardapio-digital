'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useCategoriesStore } from '@/store/categoriesStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';

export default function CadastrarCategoriaPage() {
  const router = useRouter();
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const addCategory = useCategoriesStore((state) => state.addCategory);
  const [formData, setFormData] = useState({
    title: '',
    active: true,
    order: 1,
  });
  const [errors, setErrors] = useState<{ title?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    // Validação
    if (!formData.title.trim()) {
      setErrors({ title: 'O título é obrigatório' });
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
          order: Number(formData.order) || 1,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) || 1 : value,
    }));
    // Limpa erro quando o usuário começa a digitar
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
