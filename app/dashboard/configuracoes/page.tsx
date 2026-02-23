'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRestaurantConfigStore } from '@/store/restaurantConfigStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Switch } from '@/components/ui/Switch';
import { Select } from '@/components/ui/Select';

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
    serviceType: 'Menu' as 'Menu' | 'Catalog',
    mainColor: '#ff0000',
    logo: null as string | null,
    backgroundImage: null as string | null,
    darkMode: false,
    tableOrderEnabled: false,
    whatsAppOrderEnabled: false,
    whatsAppNumber: '',
    paymentMethods: '',
    address: '',
    openingHours: '',
    mapUrl: '',
    deliveryFee: 0,
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
            serviceType: (config.serviceType as 'Menu' | 'Catalog') || 'Menu',
            mainColor: config.mainColor,
            logo: config.logo,
            backgroundImage: config.backgroundImage,
            darkMode: config.darkMode ?? false,
            tableOrderEnabled: config.tableOrderEnabled,
            whatsAppOrderEnabled: config.whatsAppOrderEnabled ?? false,
            whatsAppNumber: config.whatsAppNumber || '',
            paymentMethods: config.paymentMethods || '',
            address: config.address || '',
            openingHours: config.openingHours || '',
            mapUrl: config.mapUrl || '',
            deliveryFee: config.deliveryFee ?? 0,
          });
        } else {
          // Se não retornou config, usa valores padrão
          setFormData({
            restaurantName: restaurantName || '',
            serviceType: 'Menu',
            mainColor: '#ff0000',
            logo: null,
            backgroundImage: null,
            darkMode: false,
            tableOrderEnabled: false,
            whatsAppOrderEnabled: false,
            whatsAppNumber: '',
            paymentMethods: '',
            address: '',
            openingHours: '',
            mapUrl: '',
            deliveryFee: 0,
          });
        }
      }).catch((error) => {
        console.error('Erro ao carregar configurações:', error);
        // Se der erro, usa valores padrão
        setFormData({
          restaurantName: restaurantName || '',
          serviceType: 'Menu',
          mainColor: '#ff0000',
          logo: null,
          backgroundImage: null,
          darkMode: false,
          tableOrderEnabled: false,
          whatsAppOrderEnabled: false,
          whatsAppNumber: '',
          paymentMethods: '',
          address: '',
          openingHours: '',
          mapUrl: '',
          deliveryFee: 0,
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
        serviceType: formData.serviceType,
        mainColor: formData.mainColor,
        logo: formData.logo,
        backgroundImage: formData.backgroundImage,
        darkMode: formData.darkMode,
        tableOrderEnabled: formData.tableOrderEnabled,
        whatsAppOrderEnabled: formData.whatsAppOrderEnabled,
        whatsAppNumber: formData.whatsAppNumber.trim() || null,
        paymentMethods: formData.paymentMethods.trim() || null,
        address: formData.address.trim() || null,
        openingHours: formData.openingHours.trim() || null,
        mapUrl: formData.mapUrl.trim() || null,
        deliveryFee: formData.deliveryFee,
      });

      // Recarrega as configurações da API para garantir sincronização
      await loadConfig(restaurantId);
      const updatedConfig = getConfig(restaurantId);
      if (updatedConfig) {
        setFormData({
          restaurantName: updatedConfig.restaurantName || '',
          serviceType: (updatedConfig.serviceType as 'Menu' | 'Catalog') || 'Menu',
          mainColor: updatedConfig.mainColor,
          logo: updatedConfig.logo,
          backgroundImage: updatedConfig.backgroundImage,
          darkMode: updatedConfig.darkMode ?? false,
          tableOrderEnabled: updatedConfig.tableOrderEnabled,
          whatsAppOrderEnabled: updatedConfig.whatsAppOrderEnabled ?? false,
          whatsAppNumber: updatedConfig.whatsAppNumber || '',
          paymentMethods: updatedConfig.paymentMethods || '',
          address: updatedConfig.address || '',
          openingHours: updatedConfig.openingHours || '',
          mapUrl: updatedConfig.mapUrl || '',
          deliveryFee: updatedConfig.deliveryFee ?? 0,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleLogoFilesChange = async (files: File[]) => {
    if (files.length === 0) {
      setFormData((prev) => ({ ...prev, logo: null }));
      return;
    }

    // Converter o primeiro arquivo para base64
    const file = files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      setFormData((prev) => ({
        ...prev,
        logo: base64String,
      }));
    };

    reader.onerror = () => {
      console.error('Erro ao converter arquivo para base64');
      alert('Erro ao processar a imagem. Tente novamente.');
    };

    reader.readAsDataURL(file);
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

            <Select
              label="Tipo de Serviço"
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              options={[
                { value: 'Menu', label: 'Cardápio' },
                { value: 'Catalog', label: 'Catálogo' },
              ]}
            />

            <ColorPicker
              label="Cor Principal"
              value={formData.mainColor}
              onChange={(value) => setFormData((prev) => ({ ...prev, mainColor: value }))}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Modo Escuro
              </label>
              <Switch
                label="Ativar modo escuro no cardápio"
                checked={formData.darkMode}
                onChange={(checked) => setFormData((prev) => ({ ...prev, darkMode: checked }))}
              />
              <p className="text-xs text-gray-500 mt-2">
                Quando habilitado, o cardápio será exibido com fundo escuro e texto claro
              </p>
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Pedidos pela Mesa
              </label>
              <Switch
                label="Permitir realizar pedidos pela mesa"
                checked={formData.tableOrderEnabled}
                onChange={(checked) => setFormData((prev) => ({ ...prev, tableOrderEnabled: checked }))}
              />
              <p className="text-xs text-gray-500 mt-2">
                Quando habilitado, os clientes poderão fazer pedidos diretamente pelo cardápio digital
              </p>
            </div> */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Pedidos pelo WhatsApp
              </label>
              <Switch
                label="Permitir realizar pedidos pelo WhatsApp"
                checked={formData.whatsAppOrderEnabled}
                onChange={(checked) => setFormData((prev) => ({ ...prev, whatsAppOrderEnabled: checked }))}
              />
              <p className="text-xs text-gray-500 mt-2">
                Quando habilitado, os clientes poderão fazer pedidos através do WhatsApp
              </p>
              {formData.whatsAppOrderEnabled && (
                <div className="mt-4 space-y-4">
                  <Input
                    label="Número do WhatsApp *"
                    name="whatsAppNumber"
                    type="text"
                    value={formData.whatsAppNumber}
                    onChange={handleChange}
                    placeholder="Ex: 5511999999999"
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Digite o número do WhatsApp com código do país e DDD (ex: 5511999999999)
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Taxa de Entrega (R$)
                    </label>
                    <input
                      type="number"
                      name="deliveryFee"
                      value={formData.deliveryFee}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setFormData((prev) => ({ ...prev, deliveryFee: value }));
                      }}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Valor da taxa de entrega. Use 0 para entrega grátis.
                    </p>
                  </div>
                </div>
              )}
            </div>

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
                  onFilesChange={handleLogoFilesChange}
                  onImagesChange={() => {}}
                  maxImages={1}
                />
              )}
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Imagem de Fundo
              </label>
              <Input
                label="URL da Imagem de Fundo"
                name="backgroundImage"
                type="text"
                value={formData.backgroundImage || ''}
                onChange={handleChange}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div> */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Métodos de Pagamento
              </label>
              <textarea
                name="paymentMethods"
                value={formData.paymentMethods}
                onChange={handleChange}
                placeholder="Ex: Dinheiro, Cartão de Crédito, PIX, etc."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Informações sobre formas de pagamento aceitas
              </p>
            </div>

            <Input
              label="Endereço"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              placeholder="Ex: Rua Exemplo, 123 - Bairro, Cidade - Estado"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horário de Funcionamento
              </label>
              <textarea
                name="openingHours"
                value={formData.openingHours}
                onChange={handleChange}
                placeholder="Ex: Segunda a Sexta: 11h às 22h&#10;Sábado e Domingo: 12h às 23h"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Input
              label="URL do Mapa"
              name="mapUrl"
              type="text"
              value={formData.mapUrl}
              onChange={handleChange}
              placeholder="https://www.google.com/maps/embed?pb=..."
            />
            <p className="text-xs text-gray-500 -mt-2">
              URL do iframe do Google Maps (embed)
            </p>

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

