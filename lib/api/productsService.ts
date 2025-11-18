// Serviço de produtos
import { api } from './client';
import type {
  ProductDto,
  CreateProductDto,
  UpdateProductDto,
} from './types';

export const productsService = {
  /**
   * Lista todos os produtos
   */
  async getAll(): Promise<ProductDto[]> {
    const response = await api.get<ProductDto[]>('/api/Products');
    return response.data || [];
  },

  /**
   * Lista produtos por categoria
   */
  async getByCategory(categoryId: number): Promise<ProductDto[]> {
    const response = await api.get<ProductDto[]>(
      `/api/Products/category/${categoryId}`
    );
    return response.data || [];
  },

  /**
   * Lista produtos por subcategoria
   */
  async getBySubcategory(subcategoryId: number): Promise<ProductDto[]> {
    const response = await api.get<ProductDto[]>(
      `/api/Products/subcategory/${subcategoryId}`
    );
    return response.data || [];
  },

  /**
   * Obtém um produto por ID
   */
  async getById(id: number): Promise<ProductDto> {
    const response = await api.get<ProductDto>(`/api/Products/${id}`);
    return response.data;
  },

  /**
   * Cria um novo produto
   */
  async create(data: CreateProductDto): Promise<ProductDto> {
    console.log("data: ", data)
    const response = await api.post<ProductDto>('/api/Products', data);
    console.log("response: ", response)
    console.log("response.data: ", response.data)
    return response.data;
  },

  /**
   * Atualiza um produto
   */
  async update(id: number, data: UpdateProductDto): Promise<ProductDto> {
    const response = await api.put<ProductDto>(`/api/Products/${id}`, data);
    return response.data;
  },

  /**
   * Deleta um produto
   */
  async delete(id: number): Promise<boolean> {
    const response = await api.delete<boolean>(`/api/Products/${id}`);
    return response.data;
  },
};

