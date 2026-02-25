import { create } from 'zustand';
import { Product, ProductVariation } from '@/lib/mockData';
import { productsService } from '@/lib/api/productsService';
import type { ProductDto, ProductVariationDto } from '@/lib/api/types';

// Função helper para converter ProductDto para Product
const dtoToProduct = (dto: ProductDto): Product => ({
  id: dto.id,
  restaurantId: dto.restaurantId,
  categoryId: dto.categoryId,
  subcategoryId: dto.subcategoryId || 0,
  title: dto.title || '',
  description: dto.description || '',
  priceType: (dto.priceType as 'unique' | 'variable') || 'unique',
  price: dto.price || undefined,
  variations: dto.variations?.map((v: ProductVariationDto) => ({
    label: v.label || '',
    price: v.price,
  })) as ProductVariation[] | undefined,
  images: dto.images || [],
  active: dto.active,
  order: dto.order,
  isAvailable: dto.isAvailable ?? true,
});

interface ProductsState {
  products: Product[];
  filterActive: boolean | null;
  isLoading: boolean;
  setFilterActive: (value: boolean | null) => void;
  loadProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>, restaurantId: number) => Promise<Product>;
  updateProduct: (id: number, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  getFilteredProducts: (restaurantId: number) => Product[];
  getProductsByRestaurant: (restaurantId: number) => Product[];
}

export const useProductsStore = create<ProductsState>()((set, get) => ({
  products: [],
  filterActive: null,
  isLoading: false,
  setFilterActive: (value) => set({ filterActive: value }),
  loadProducts: async () => {
    set({ isLoading: true });
    try {
      const productsDto = await productsService.getAll();
      const products = productsDto.map(dtoToProduct);
      set({ products, isLoading: false });
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  addProduct: async (product, restaurantId) => {
    try {
      // Se a ordem está sendo usada, precisa reordenar outros produtos
      const restaurantProducts = get().products
        .filter(p => p.restaurantId === restaurantId)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      const newOrder = product.order;
      const productsToUpdate: Array<{ id: number; newOrder: number }> = [];

      // Produtos com ordem >= newOrder precisam descer
      restaurantProducts.forEach(prod => {
        if (prod.order >= newOrder) {
          productsToUpdate.push({ id: prod.id, newOrder: prod.order + 1 });
        }
      });

      // Atualizar todos os produtos afetados
      const updatePromises = productsToUpdate.map(({ id: prodId, newOrder: order }) =>
        productsService.update(prodId, { order })
      );

      // Criar o novo produto
      // Se priceType é 'variable', price deve ser null e variations deve ser enviado
      // Se priceType é 'unique', variations deve ser null e price deve ser enviado
      const createData: any = {
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId || null,
        title: product.title,
        description: product.description,
        priceType: product.priceType,
        images: [], // Não enviar mais base64, será feito upload separado
        active: product.active,
        order: newOrder,
        isAvailable: product.isAvailable ?? true,
      };
      console.log("product.priceType: ", product.priceType)
      if (product.priceType === 'variable') {
        // Produto com variações: price deve ser null, variations deve ser enviado
        createData.price = null;
        createData.variations = product.variations && product.variations.length > 0
          ? product.variations.map((v) => ({
            label: v.label || null,
            price: v.price,
          }))
          : null;
      } else {
        // Produto com preço único: variations deve ser null, price deve ser enviado
        createData.price = product.price || null;
        createData.variations = null;
      }

      const createPromise = productsService.create(createData);
      console.log("createPromise: ", createPromise)
      // Executar todas as operações
      const [newProductDto, ...updatedProducts] = await Promise.all([
        createPromise,
        ...updatePromises,
      ]);

      const newProduct = dtoToProduct(newProductDto);

      // Atualizar o store
      set((state) => {
        const updatedMap = new Map(updatedProducts.map(dto => [dto.id, dtoToProduct(dto)]));
        return {
          products: [
            ...state.products.map((prod) => {
              const updated = updatedMap.get(prod.id);
              return updated || prod;
            }),
            newProduct,
          ],
        };
      });

      return newProduct;
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }
  },
  updateProduct: async (id, updates) => {
    try {
      const productToUpdate = get().products.find(p => p.id === id);
      if (!productToUpdate) return;

      // Se a ordem está sendo alterada, precisa reordenar outros produtos
      if (updates.order !== undefined && updates.order !== productToUpdate.order) {
        const restaurantId = productToUpdate.restaurantId;
        const restaurantProducts = get().products
          .filter(p => p.restaurantId === restaurantId && p.id !== id)
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        const oldOrder = productToUpdate.order;
        const newOrder = updates.order;

        // Calcular novas ordens para todos os produtos
        const productsToUpdate: Array<{ id: number; newOrder: number }> = [];

        if (newOrder < oldOrder) {
          // Movendo para cima: produtos entre newOrder e oldOrder-1 precisam descer
          restaurantProducts.forEach(prod => {
            if (prod.order >= newOrder && prod.order < oldOrder) {
              productsToUpdate.push({ id: prod.id, newOrder: prod.order + 1 });
            }
          });
        } else {
          // Movendo para baixo: produtos entre oldOrder+1 e newOrder precisam subir
          restaurantProducts.forEach(prod => {
            if (prod.order > oldOrder && prod.order <= newOrder) {
              productsToUpdate.push({ id: prod.id, newOrder: prod.order - 1 });
            }
          });
        }

        // Atualizar todos os produtos afetados
        const updatePromises = productsToUpdate.map(({ id: prodId, newOrder: order }) =>
          productsService.update(prodId, { order })
        );

        // Atualizar o produto principal
        const updateData: any = {
          categoryId: updates.categoryId !== undefined ? updates.categoryId : undefined,
          subcategoryId: updates.subcategoryId !== undefined ? updates.subcategoryId : undefined,
          title: updates.title !== undefined ? updates.title : undefined,
          description: updates.description !== undefined ? updates.description : undefined,
          priceType: updates.priceType !== undefined ? updates.priceType : undefined,
          images: updates.images !== undefined ? updates.images : undefined,
          active: updates.active !== undefined ? updates.active : undefined,
          order: newOrder,
        };

        // Se priceType está sendo atualizado, ajustar price e variations
        const finalPriceType = updates.priceType !== undefined ? updates.priceType : productToUpdate.priceType;
        if (finalPriceType === 'variable') {
          updateData.price = null;
          updateData.variations = updates.variations && updates.variations.length > 0
            ? updates.variations.map((v) => ({
              label: v.label || null,
              price: v.price,
            }))
            : null;
        } else {
          updateData.price = updates.price !== undefined ? updates.price : undefined;
          updateData.variations = null;
        }

        updatePromises.push(productsService.update(id, updateData));

        // Executar todas as atualizações
        const updatedProducts = await Promise.all(updatePromises);

        // Atualizar o store com todos os produtos atualizados
        set((state) => {
          const updatedMap = new Map(updatedProducts.map(dto => [dto.id, dtoToProduct(dto)]));
          return {
            products: state.products.map((prod) => {
              const updated = updatedMap.get(prod.id);
              return updated || prod;
            }),
          };
        });
      } else {
        // Se não está alterando a ordem, atualizar normalmente
        const updateData: any = {
          categoryId: updates.categoryId !== undefined ? updates.categoryId : undefined,
          subcategoryId: updates.subcategoryId !== undefined ? updates.subcategoryId : undefined,
          title: updates.title !== undefined ? updates.title : undefined,
          description: updates.description !== undefined ? updates.description : undefined,
          priceType: updates.priceType !== undefined ? updates.priceType : undefined,
          images: updates.images !== undefined ? updates.images : undefined,
          active: updates.active !== undefined ? updates.active : undefined,
          order: updates.order !== undefined ? updates.order : undefined,
          isAvailable: updates.isAvailable !== undefined ? updates.isAvailable : undefined,
        };

        // Se priceType está sendo atualizado, ajustar price e variations
        const finalPriceType = updates.priceType !== undefined ? updates.priceType : productToUpdate.priceType;
        if (finalPriceType === 'variable') {
          updateData.price = null;
          updateData.variations = updates.variations && updates.variations.length > 0
            ? updates.variations.map((v) => ({
              label: v.label || null,
              price: v.price,
            }))
            : null;
        } else {
          updateData.price = updates.price !== undefined ? updates.price : undefined;
          updateData.variations = null;
        }

        const updatedProductDto = await productsService.update(id, updateData);
        const updatedProduct = dtoToProduct(updatedProductDto);

        set((state) => ({
          products: state.products.map((prod) =>
            prod.id === id ? updatedProduct : prod
          ),
        }));
      }
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  },
  deleteProduct: async (id) => {
    try {
      await productsService.delete(id);
      set((state) => ({
        products: state.products.filter((prod) => prod.id !== id),
      }));
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    }
  },
  getProductsByRestaurant: (restaurantId) => {
    const products = get().products.filter((prod) => prod.restaurantId === restaurantId);
    // Ordenar por order
    return products.sort((a, b) => (a.order || 0) - (b.order || 0));
  },
  getFilteredProducts: (restaurantId) => {
    const { products } = get();
    const filtered = products.filter((prod) => prod.restaurantId === restaurantId);
    // Ordenar por order
    return filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
  },
}));

