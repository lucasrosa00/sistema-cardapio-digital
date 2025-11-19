// Cliente HTTP para comunicação com a API
import type { ApiResponse } from './types';

// Usa variável de ambiente ou fallback
// Em produção (Vercel HTTPS), usa API route do Next.js como proxy para evitar Mixed Content
// Em desenvolvimento, usa URL direta
const getBaseUrl = (): string => {
  // Se estiver no servidor (SSR), usa URL direta
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://72.60.7.234:8000';
  }
  
  // Se estiver no cliente e em produção (HTTPS), usa proxy via API route
  if (window.location.protocol === 'https:') {
    return '/api/proxy';
  }
  
  // Caso contrário, usa URL direta (desenvolvimento local)
  return process.env.NEXT_PUBLIC_API_URL || 'http://72.60.7.234:8000';
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

    // Se o token expirou (401), limpar autenticação e redirecionar para login
    if (response.status === 401) {
      // Limpar token do localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('auth-storage');
        } catch (error) {
          console.error('Erro ao limpar autenticação:', error);
        }
        // Redirecionar para login apenas se não estiver já na página de login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      throw new Error('Sessão expirada. Por favor, faça login novamente.');
    }

    // Verifica se a resposta é JSON
    const contentType = response.headers.get('content-type');
    let data: ApiResponse<T>;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Se não for JSON, tenta fazer parse mesmo assim ou cria resposta padrão
      try {
        const text = await response.text();
        if (text) {
          data = JSON.parse(text);
        } else {
          throw new Error('Resposta vazia');
        }
      } catch {
        throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
      }
    }

    // Se a API retornou erro, lança exceção
    if (!response.ok || !data.success) {
      const errorMessage = data.message || data.errors?.join(', ') || 'Erro na requisição';
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    // Se já é um erro de sessão expirada, apenas relança
    if (error instanceof Error && error.message.includes('Sessão expirada')) {
      throw error;
    }
    
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

