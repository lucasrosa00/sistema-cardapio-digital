'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { tablesService } from '@/lib/api/tablesService';
import type { TableDto } from '@/lib/api/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Spinner } from '@/components/ui/Spinner';

export default function EditarMesaPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const restaurantId = useAuthStore((state) => state.restaurantId);
  const [table, setTable] = useState<TableDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    number: '',
    active: true,
  });
  const [errors, setErrors] = useState<{ number?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carregar mesa ao montar o componente
  useEffect(() => {
    if (id) {
      loadTable();
    }
  }, [id]);

  const loadTable = async () => {
    setIsLoading(true);
    try {
      const data = await tablesService.getById(id);
      setTable(data);
      setFormData({
        number: data.number,
        active: data.active,
      });
    } catch (error) {
      console.error('Erro ao carregar mesa:', error);
      alert('Erro ao carregar mesa. Tente novamente.');
      router.push('/dashboard/mesas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    // Validação
    if (!formData.number.trim()) {
      setErrors({ number: 'O número da mesa é obrigatório' });
      return;
    }

    if (!table) {
      alert('Mesa não encontrada');
      router.push('/dashboard/mesas');
      return;
    }

    setIsSubmitting(true);

    try {
      await tablesService.update(id, {
        number: formData.number.trim(),
        active: formData.active,
      });

      router.push('/dashboard/mesas');
    } catch (error) {
      console.error('Erro ao atualizar mesa:', error);
      alert('Erro ao atualizar mesa. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Limpa erro quando o usuário começa a digitar
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
  if (!table) {
    return (
      <div className="bg-gray-50 min-h-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Mesa não encontrada
            </h1>
            <p className="text-gray-600 mb-6">
              A mesa que você está tentando editar não existe.
            </p>
            <Button variant="secondary" onClick={() => router.push('/dashboard/mesas')}>
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
              onClick={() => router.push('/dashboard/mesas')}
              className="mb-4"
            >
              ← Voltar
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              Editar Mesa
            </h1>
            <p className="text-sm text-gray-500 mt-1">ID: {id}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Número da Mesa *"
              name="number"
              type="text"
              value={formData.number}
              onChange={handleChange}
              placeholder="Ex: 1, 2, 3, A1, B2, etc."
              error={errors.number}
              required
            />

            <Checkbox
              label="Mesa ativa"
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
                onClick={() => router.push('/dashboard/mesas')}
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

