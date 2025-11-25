'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { tablesService } from '@/lib/api/tablesService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';

export default function CadastrarMesaPage() {
  const router = useRouter();
  const restaurantId = useAuthStore((state) => state.restaurantId);

  const [formData, setFormData] = useState({
    number: '',
    active: true,
  });
  const [errors, setErrors] = useState<{ number?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    // Validação
    if (!formData.number.trim()) {
      setErrors({ number: 'O número da mesa é obrigatório' });
      return;
    }

    setIsSubmitting(true);

    if (!restaurantId) {
      alert('Erro: Restaurante não identificado. Faça login novamente.');
      router.push('/login');
      setIsSubmitting(false);
      return;
    }

    try {
      await tablesService.create({
        number: formData.number.trim(),
        active: formData.active,
      });

      router.push('/dashboard/mesas');
    } catch (error) {
      console.error('Erro ao cadastrar mesa:', error);
      alert('Erro ao cadastrar mesa. Tente novamente.');
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
              Cadastrar Mesa
            </h1>
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
                Salvar
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

