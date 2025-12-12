'use client';

import React, { useState, useEffect } from 'react';
import { addonsService } from '@/lib/api/addonsService';
import type { AddonDto, ProductAddonDto, UpdateAddonDto } from '@/lib/api/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';

interface ProductAddonsManagerProps {
  productId: number | null;
  selectedAddonIds: number[];
  onChange: (addonIds: number[]) => void;
  restaurantId: number;
  showSelection?: boolean; // Novo prop para controlar se mostra seleção
}

export const ProductAddonsManager: React.FC<ProductAddonsManagerProps> = ({
  productId,
  selectedAddonIds,
  onChange,
  restaurantId,
  showSelection = false, // Por padrão, não mostra seleção
}) => {
  const [allAddons, setAllAddons] = useState<AddonDto[]>([]);
  const [availableAddons, setAvailableAddons] = useState<AddonDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAddon, setEditingAddon] = useState<AddonDto | null>(null);

  const [newAddon, setNewAddon] = useState({
    name: '',
    description: '',
    extraPrice: '',
    active: true,
    order: '1',
  });

  // Função para recarregar adicionais
  const reloadAddons = async () => {
    try {
      const addons = await addonsService.getAll();
      setAllAddons(addons);

      // Filtrar adicionais: apenas os vinculados ao produto específico
      let filtered: AddonDto[] = [];

      if (productId) {
        // Buscar adicionais vinculados especificamente a este produto
        const productAddonIds = new Set<number>();
        try {
          const productAddons = await addonsService.getByProduct(productId);
          console.log("productId:", productId);
          console.log("productAddons retornados:", productAddons);
          
          productAddons.forEach(pa => {
            // O backend pode estar retornando o ID do adicional em 'id' ao invés de 'productAddonId'
            // Vamos usar productAddonId se existir, senão usar id
            const addonId = pa.productAddonId ?? pa.id;
            if (addonId) {
              productAddonIds.add(addonId);
              console.log("Adicionado addonId ao Set:", addonId, "objeto completo:", JSON.stringify(pa, null, 2));
            } else {
              console.warn("Adicional sem ID válido:", pa);
            }
          });
          
          console.log("Set de productAddonIds:", Array.from(productAddonIds));
          console.log("Total de adicionais carregados (getAll):", addons.length);
        } catch (error) {
          console.error('Erro ao carregar adicionais do produto:', error);
        }

        // Filtrar APENAS os adicionais que estão vinculados a este produto específico
        // No dashboard, mostrar todos (ativos e inativos) para permitir edição
        filtered = addons.filter(addon => {
          const isLinked = productAddonIds.has(addon.id);
          if (isLinked) {
            console.log("Adicional encontrado e vinculado:", addon.id, addon.name);
          }
          return isLinked;
        });
        
        console.log("Adicionais filtrados para exibição:", filtered.length);
      }
      // Se não há productId, não mostrar nenhum adicional (produto ainda não foi criado)

      setAvailableAddons(filtered);
      
      // Se há productId e showSelection, carregar adicionais já vinculados ao produto
      if (productId && showSelection) {
        try {
          const productAddons = await addonsService.getByProduct(productId);
          const productAddonIds = productAddons.map(pa => pa.productAddonId ?? pa.id).filter(id => id !== undefined);
          if (productAddonIds.length > 0 && selectedAddonIds.length === 0) {
            onChange(productAddonIds as number[]);
          }
        } catch (error) {
          console.error('Erro ao carregar adicionais do produto:', error);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar adicionais:', error);
    }
  };

  // Carregar adicionais
  useEffect(() => {
    const loadAddons = async () => {
      setIsLoading(true);
      await reloadAddons();
      setIsLoading(false);
    };

    if (restaurantId) {
      loadAddons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, productId]);

  const handleToggleAddon = async (addonId: number) => {
    if (!showSelection) return;

    const addon = allAddons.find(a => a.id === addonId);
    if (!addon || !productId) return;

    const isSelected = selectedAddonIds.includes(addonId);

    try {
      // Atualizar o adicional para incluir/remover o productId
      // Nota: Isso requer que a API suporte atualizar os productIds do adicional
      // Por enquanto, apenas atualizamos a seleção local
      if (isSelected) {
        onChange(selectedAddonIds.filter(id => id !== addonId));
      } else {
        onChange([...selectedAddonIds, addonId]);
      }
    } catch (error) {
      console.error('Erro ao atualizar adicional:', error);
    }
  };

  const handleCreateAddon = async () => {
    if (!newAddon.name.trim() || !newAddon.extraPrice) {
      alert('Preencha nome e preço do adicional');
      return;
    }

    try {
      if (!productId) {
        alert('É necessário ter um produto para criar adicionais. Salve o produto primeiro.');
        return;
      }

      // Vincular apenas ao produto específico
      const addonData = {
        name: newAddon.name.trim(),
        description: newAddon.description.trim() || null,
        extraPrice: parseFloat(newAddon.extraPrice),
        active: newAddon.active,
        order: parseInt(newAddon.order) || 1,
        categoryIds: null, // Nunca vincular a categoria
        productIds: [productId], // Sempre vincular ao produto específico
      };

      const createdAddon = await addonsService.create(addonData);

      // Recarregar adicionais
      await reloadAddons();

      // Adicionar à seleção se foi criado para este produto e showSelection estiver ativo
      if (productId && showSelection) {
        onChange([...selectedAddonIds, createdAddon.id]);
      }

      // Reset form
      setNewAddon({
        name: '',
        description: '',
        extraPrice: '',
        active: true,
        order: '1',
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Erro ao criar adicional:', error);
      alert('Erro ao criar adicional. Tente novamente.');
    }
  };

  const handleEditAddon = async () => {
    if (!editingAddon || !newAddon.name.trim() || !newAddon.extraPrice) {
      alert('Preencha nome e preço do adicional');
      return;
    }

    try {
      // Ao editar, não enviamos categoryIds e productIds para não sobrescrever vínculos existentes
      // Apenas atualizamos os campos básicos do adicional
      const addonData: UpdateAddonDto = {
        name: newAddon.name.trim(),
        description: newAddon.description.trim() || null,
        extraPrice: parseFloat(newAddon.extraPrice),
        active: newAddon.active,
        order: parseInt(newAddon.order) || editingAddon.order,
        // Não enviar categoryIds e productIds na atualização para preservar vínculos existentes
        // Se o usuário quiser alterar os vínculos, deve fazer isso criando um novo adicional ou
        // através de uma interface específica de gerenciamento de adicionais
      };

      const updatedAddon = await addonsService.update(editingAddon.id, addonData);

      // Recarregar adicionais
      await reloadAddons();

      // Reset form
      setEditingAddon(null);
      setNewAddon({
        name: '',
        description: '',
        extraPrice: '',
        active: true,
        order: '1',
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Erro ao atualizar adicional:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar adicional. Tente novamente.';
      alert(errorMessage);
    }
  };

  const handleDeleteAddon = async (addonId: number) => {
    if (!confirm('Tem certeza que deseja excluir este adicional?')) {
      return;
    }

    try {
      await addonsService.delete(addonId);

      // Remover da seleção se estiver selecionado e showSelection estiver ativo
      if (showSelection) {
        onChange(selectedAddonIds.filter(id => id !== addonId));
      }

      // Recarregar adicionais
      await reloadAddons();
    } catch (error) {
      console.error('Erro ao excluir adicional:', error);
      alert('Erro ao excluir adicional. Tente novamente.');
    }
  };

  const startEdit = (addon: AddonDto) => {
    setEditingAddon(addon);
    setNewAddon({
      name: addon.name || '',
      description: addon.description || '',
      extraPrice: String(addon.extraPrice),
      active: addon.active,
      order: String(addon.order),
    });
    setShowCreateForm(true);
  };

  const cancelEdit = () => {
    setEditingAddon(null);
    setNewAddon({
      name: '',
      description: '',
      extraPrice: '',
      active: true,
      order: '1',
    });
    setShowCreateForm(false);
  };

  if (isLoading) {
    return <div className="text-sm text-gray-500">Carregando adicionais...</div>;
  }

  // Se não há productId, mostrar mensagem informativa
  if (!productId) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700">
            Adicionais do Produto
          </label>
        </div>
        <p className="text-sm text-gray-500 italic p-4 border border-gray-200 rounded-lg bg-gray-50">
          Salve o produto primeiro para poder criar e gerenciar adicionais.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Adicionais do Produto
        </label>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            if (showCreateForm) {
              cancelEdit();
            } else {
              setShowCreateForm(true);
            }
          }}
          className="text-xs"
        >
          {showCreateForm ? 'Cancelar' : '+ Criar Novo Adicional'}
        </Button>
      </div>

      {/* Formulário de criar/editar */}
      {showCreateForm && (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
          <h3 className="font-medium text-gray-900">
            {editingAddon ? 'Editar Adicional' : 'Novo Adicional'}
          </h3>

          <Input
            label="Nome *"
            value={newAddon.name}
            onChange={(e) => setNewAddon({ ...newAddon, name: e.target.value })}
            placeholder="Ex: Bacon, Cheddar, Topper"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={newAddon.description}
              onChange={(e) => setNewAddon({ ...newAddon, description: e.target.value })}
              placeholder="Descrição do adicional..."
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Preço Extra (R$) *"
              type="number"
              step="0.01"
              min="0"
              value={newAddon.extraPrice}
              onChange={(e) => setNewAddon({ ...newAddon, extraPrice: e.target.value })}
              placeholder="0.00"
            />
            <Input
              label="Ordem"
              type="number"
              min="1"
              value={newAddon.order}
              onChange={(e) => setNewAddon({ ...newAddon, order: e.target.value })}
              placeholder="1"
            />
          </div>

          <Checkbox
            label="Adicional ativo"
            checked={newAddon.active}
            onChange={(e) => setNewAddon({ ...newAddon, active: e.target.checked })}
          />

          <div className="flex gap-2">
            <Button
              type="button"
              variant="primary"
              onClick={editingAddon ? handleEditAddon : handleCreateAddon}
              className="flex-1"
            >
              {editingAddon ? 'Salvar Alterações' : 'Criar Adicional'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={cancelEdit}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Lista de adicionais disponíveis */}
      {availableAddons.length === 0 && !showCreateForm ? (
        <p className="text-sm text-gray-500 italic">
          Nenhum adicional disponível. Clique em "Criar Novo Adicional" para começar.
        </p>
      ) : (
        <div className="space-y-2">
          {availableAddons.map((addon) => {
            const isSelected = showSelection && selectedAddonIds.includes(addon.id);

            return (
              <div
                key={addon.id}
                className={`flex items-center justify-between p-3 border rounded-lg ${isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white'
                  }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  {showSelection && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleAddon(addon.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{addon.name}</span>
                      {!addon.active && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          Inativo
                        </span>
                      )}
                    </div>
                    {addon.description && (
                      <p className="text-xs text-gray-500 mt-1">{addon.description}</p>
                    )}
                    <p className="text-sm font-medium text-gray-700 mt-1">
                      + R$ {addon.extraPrice.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => startEdit(addon)}
                    className="text-xs px-2 py-1"
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleDeleteAddon(addon.id)}
                    className="text-xs px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showSelection && selectedAddonIds.length > 0 && (
        <p className="text-xs text-gray-500">
          {selectedAddonIds.length} adicional(is) selecionado(s) para este produto
        </p>
      )}
    </div>
  );
};

