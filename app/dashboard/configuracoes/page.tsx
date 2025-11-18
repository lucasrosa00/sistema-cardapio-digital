'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRestaurantConfigStore } from '@/store/restaurantConfigStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { ImageUpload } from '@/components/ui/ImageUpload';

export default function ConfiguracoesPage() {
  const router = useRouter();
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const restaurantName = useAuthStore((state) => state.restaurantName);
  const getConfig = useRestaurantConfigStore((state) => state.getConfig);
  const updateConfig = useRestaurantConfigStore((state) => state.updateConfig);
  const loadConfig = useRestaurantConfigStore((state) => state.loadConfig);
  const isLoading = useRestaurantConfigStore((state) => state.isLoading);

  const [formData, setFormData] = useState({
    restaurantName: '',
    mainColor: '#ff0000',
    logo: null as string | null,
  });

  const [errors, setErrors] = useState<{ restaurantName?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  // Carregar dados da API ao montar
  useEffect(() => {
    if (restaurantId) {
      loadConfig(restaurantId).then(() => {
        const config = getConfig(restaurantId);
        if (config) {
          setFormData({
            restaurantName: config.restaurantName || restaurantName || '',
            mainColor: config.mainColor,
            logo: config.logo,
          });
        } else {
          // Se não retornou config, usa valores padrão
          setFormData({
            restaurantName: restaurantName || '',
            mainColor: '#ff0000',
            logo: null,
          });
        }
      }).catch((error) => {
        console.error('Erro ao carregar configurações:', error);
        // Se der erro, usa valores padrão
        setFormData({
          restaurantName: restaurantName || '',
          mainColor: '#ff0000',
          logo: null,
        });
      });
    }
  }, [restaurantId, restaurantName, getConfig, loadConfig]);


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    // Validação
    if (!formData.restaurantName.trim()) {
      setErrors({ restaurantName: 'O nome do restaurante é obrigatório' });
      return;
    }

    setIsSubmitting(true);
    setSaved(false);

    if (!restaurantId) {
      alert('Erro: Restaurante não identificado. Faça login novamente.');
      router.push('/login');
      setIsSubmitting(false);
      return;
    }

      try {
      await updateConfig(restaurantId, {
        restaurantName: formData.restaurantName.trim(),
        mainColor: formData.mainColor,
        logo: formData.logo,
      });

      // Recarrega as configurações da API para garantir sincronização
      await loadConfig(restaurantId);
      const updatedConfig = getConfig(restaurantId);
      if (updatedConfig) {
        setFormData({
          restaurantName: updatedConfig.restaurantName || '',
          mainColor: updatedConfig.mainColor,
          logo: updatedConfig.logo,
        });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleLogoChange = (images: string[]) => {
    setFormData((prev) => ({
      ...prev,
      logo: images.length > 0 ? images[0] : null,
    }));
  };

  const handleLogoUpload = (images: string[]) => {
    if (images.length > 0) {
      handleLogoChange(images);
    }
  };

  const removeLogo = () => {
    setFormData((prev) => ({ ...prev, logo: null }));
  };

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <Button
              variant="secondary"
              onClick={() => router.push('/dashboard')}
              className="mb-4"
            >
              ← Voltar
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              Configurações do Restaurante
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Personalize a identidade visual do seu cardápio digital
            </p>
          </div>

          {saved && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ Configurações salvas com sucesso!
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Nome do Restaurante *"
              name="restaurantName"
              type="text"
              value={formData.restaurantName}
              onChange={handleChange}
              placeholder="Ex: Restaurante Exemplo"
              error={errors.restaurantName}
              required
            />

            <ColorPicker
              label="Cor Principal"
              value={formData.mainColor}
              onChange={(value) => setFormData((prev) => ({ ...prev, mainColor: value }))}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Logo do Restaurante
              </label>
              
              {formData.logo ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={formData.logo}
                      alt="Logo do restaurante"
                      className="max-w-xs max-h-32 object-contain rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Clique no × para remover o logo atual
                  </p>
                </div>
              ) : (
                <ImageUpload
                  images={[]}
                  onImagesChange={handleLogoUpload}
                  maxImages={1}
                />
              )}
            </div>

            {/* Preview da identidade visual */}
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                Preview da Identidade Visual
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {formData.logo && (
                    <img
                      src={formData.logo}
                      alt="Logo preview"
                      className="w-12 h-12 object-contain"
                    />
                  )}
                  <h4
                    className="text-lg font-semibold"
                    style={{ color: formData.mainColor }}
                  >
                    {formData.restaurantName || 'Nome do Restaurante'}
                  </h4>
                </div>
                <div
                  className="h-2 rounded"
                  style={{ backgroundColor: formData.mainColor }}
                />
                <p className="text-sm text-gray-600">
                  Esta é uma prévia de como sua identidade visual aparecerá no cardápio.
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="flex-1"
                style={{ backgroundColor: formData.mainColor }}
              >
                Salvar Configurações
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/dashboard')}
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

