// Tipos baseados no Swagger da API
// Base URL: http://72.60.7.234:8000

// Resposta padrão da API
export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
  errors: string[] | null;
}

// ========== AUTH ==========
export interface LoginDto {
  login: string | null;
  password: string | null;
}

export interface UserDto {
  id: number;
  restaurantId: number;
  login: string | null;
  email: string | null;
}

export interface RestaurantConfigDto {
  restaurantName: string | null;
  mainColor: string | null;
  logo: string | null;
  backgroundImage: string | null;
  darkMode: boolean;
  slug: string | null;
  tableOrderEnabled: boolean;
  paymentMethods: string | null;
  address: string | null;
  about: string | null;
  openingHours: string | null;
  mapUrl: string | null;
}

export interface LoginResponseDto {
  token: string | null;
  user: UserDto;
  restaurant: RestaurantConfigDto;
}

// ========== CATEGORIES ==========
export interface CategoryDto {
  id: number;
  restaurantId: number;
  title: string | null;
  active: boolean;
  order: number;
}

export interface CreateCategoryDto {
  title: string | null;
  active: boolean;
  order: number;
}

export interface UpdateCategoryDto {
  title?: string | null;
  active?: boolean | null;
  order?: number | null;
}

// ========== SUBCATEGORIES ==========
export interface SubcategoryDto {
  id: number;
  restaurantId: number;
  categoryId: number;
  title: string | null;
  active: boolean;
  order: number;
}

export interface CreateSubcategoryDto {
  categoryId: number;
  title: string | null;
  active: boolean;
  order: number;
}

export interface UpdateSubcategoryDto {
  categoryId?: number | null;
  title?: string | null;
  active?: boolean | null;
  order?: number | null;
}

// ========== PRODUCTS ==========
export interface ProductVariationDto {
  label: string | null;
  price: number;
}

export interface ProductDto {
  id: number;
  restaurantId: number;
  categoryId: number;
  subcategoryId: number | null;
  title: string | null;
  description: string | null;
  priceType: string | null;
  price: number | null;
  variations: ProductVariationDto[] | null;
  images: string[] | null;
  active: boolean;
  order: number;
}

export interface CreateProductDto {
  categoryId: number;
  subcategoryId: number | null;
  title: string | null;
  description: string | null;
  priceType: string | null;
  price: number | null;
  variations: ProductVariationDto[] | null;
  images: string[] | null;
  active: boolean;
  order: number;
}

export interface UpdateProductDto {
  categoryId?: number | null;
  subcategoryId?: number | null;
  title?: string | null;
  description?: string | null;
  priceType?: string | null;
  price?: number | null;
  variations?: ProductVariationDto[] | null;
  images?: string[] | null;
  active?: boolean | null;
  order?: number | null;
}

// ========== RESTAURANT ==========
export interface UpdateRestaurantConfigDto {
  restaurantName?: string | null;
  mainColor?: string | null;
  logo?: string | null;
  backgroundImage?: string | null;
  darkMode?: boolean | null;
  slug?: string | null;
  tableOrderEnabled?: boolean | null;
  paymentMethods?: string | null;
  address?: string | null;
  about?: string | null;
  openingHours?: string | null;
  mapUrl?: string | null;
}

// ========== PUBLIC MENU ==========
export interface SubcategoryWithProductsDto {
  subcategory: SubcategoryDto;
  products: ProductDto[] | null;
}

export interface CategoryWithProductsDto {
  category: CategoryDto;
  subcategories: SubcategoryWithProductsDto[] | null;
  products: ProductDto[] | null;
}

export interface PublicMenuDto {
  restaurant: RestaurantConfigDto;
  categories: CategoryWithProductsDto[] | null;
}

// ========== TABLE MENU ==========
export interface TableMenuDto {
  tableId: number;
  tableNumber: string;
  menu: PublicMenuDto;
}

// ========== TABLES ==========
export interface TableDto {
  id: number;
  restaurantId: number;
  number: string;
  qrCode: string;
  qrCodeUrl: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTableDto {
  number: string;
  active: boolean;
}

export interface UpdateTableDto {
  number?: string;
  active?: boolean;
}

// ========== ORDERS ==========
export interface OrderItemDto {
  productId: number;
  quantity: number;
  observations?: string;
  selectedVariation?: string;
}

export interface CreateOrderDto {
  tableId: number;
  customerName?: string;
  observations?: string;
  items: OrderItemDto[];
}

// Item do pedido retornado pela API
export interface OrderItemResponseDto {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  observations?: string | null;
  selectedVariation?: string | null;
  createdAt: string;
}

// Pedido completo retornado pela API
export interface OrderResponseDto {
  id: number;
  restaurantId: number;
  tableId: number;
  tableNumber: string;
  status: string;
  total: number;
  customerName?: string | null;
  observations?: string | null;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string | null;
  deliveredAt?: string | null;
  items: OrderItemResponseDto[];
}

export interface UpdateOrderStatusDto {
  status: string;
}

// Mantido para compatibilidade
export interface OrderDto {
  id: number;
  tableId: number;
  customerName?: string;
  observations?: string;
  items: OrderItemDto[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

