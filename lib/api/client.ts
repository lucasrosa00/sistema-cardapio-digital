// Cliente HTTP para comunicação com a API
import type { ApiResponse } from './types';

// Usa variável de ambiente ou fallback
// Em produção (Vercel HTTPS), usa API route do Next.js como proxy para evitar Mixed Content
// Em desenvolvimento, usa URL direta
const getBaseUrl = (): string => {
  // Se estiver no servidor (SSR), usa URL direta
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://72.60.7.234';
  }
  
  // Se estiver no cliente e em produção (HTTPS), usa proxy via API route
  if (window.location.protocol === 'https:') {
    return '/api/proxy';
  }
  
  // Caso contrário, usa URL direta (desenvolvimento local)
  return process.env.NEXT_PUBLIC_API_URL || 'http://72.60.7.234';
};

const BASE_URL = getBaseUrl();

// Função para obter o token do localStorage (Zustand persist)
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      // Zustand persist armazena em parsed.state
      return parsed?.state?.token || null;
    }
  } catch (error) {
    console.error('Erro ao ler token:', error);
  }
  return null;
};

// Função para fazer requisições HTTP
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Adiciona token de autenticação se existir
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Se estiver usando proxy, remover /api do endpoint (o proxy já adiciona)
  const finalEndpoint = BASE_URL.startsWith('/api/proxy') && endpoint.startsWith('/api/')
    ? endpoint.replace('/api', '')
    : endpoint;
  
  const url = `${BASE_URL}${finalEndpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Verifica se a resposta é JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Resposta não é JSON');
    }

    const data: ApiResponse<T> = await response.json();

    // Se a API retornou erro, lança exceção
    if (!response.ok || !data.success) {
      const errorMessage = data.message || data.errors?.join(', ') || 'Erro na requisição';
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro desconhecido na requisição');
  }
}

// Métodos HTTP
export const api = {
  get: <T>(endpoint: string): Promise<ApiResponse<T>> => 
    apiRequest<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> => 
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> => 
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string): Promise<ApiResponse<T>> => 
    apiRequest<T>(endpoint, { method: 'DELETE' }),
};

