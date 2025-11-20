// Cliente HTTP para comunicação com a API
import type { ApiResponse } from './types';

// Usa variável de ambiente ou fallback
// Usa API route do Next.js como proxy para evitar problemas de CORS e Mixed Content
const getBaseUrl = (): string => {
  // Se estiver no servidor (SSR), usa URL direta (não há CORS no servidor)
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://72.60.7.234:8000';
  }
  
  // Se estiver no cliente, sempre usa proxy via API route
  // Isso evita problemas de CORS quando frontend e backend estão em portas/domínios diferentes
  return '/api/proxy';
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

// Função para atualizar o token no localStorage (Zustand persist)
const updateToken = (newToken: string): void => {
  if (typeof window === 'undefined') return;
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      // Atualiza o token mantendo o resto do estado
      parsed.state = {
        ...parsed.state,
        token: newToken,
      };
      localStorage.setItem('auth-storage', JSON.stringify(parsed));
    }
  } catch (error) {
    console.error('Erro ao atualizar token:', error);
  }
};

// Flag para evitar loops infinitos ao tentar renovar token
let isRefreshing = false;

// Função para renovar o token
async function refreshToken(): Promise<string | null> {
  if (isRefreshing) {
    // Se já está tentando renovar, aguarda um pouco e retorna null
    await new Promise(resolve => setTimeout(resolve, 100));
    return null;
  }

  const currentToken = getToken();
  if (!currentToken) {
    return null;
  }

  isRefreshing = true;

  try {
    // Prepara a URL para o endpoint de refresh
    // O endpoint é /api/Auth/refresh, então se estiver usando proxy, remove /api
    const refreshEndpoint = BASE_URL.startsWith('/api/proxy')
      ? '/Auth/refresh'
      : '/api/Auth/refresh';
    const refreshUrl = `${BASE_URL}${refreshEndpoint}`;

    const response = await fetch(refreshUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`,
      },
    });

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      let data: unknown;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = text ? JSON.parse(text) : null;
      }

      // O endpoint pode retornar:
      // 1. Uma string diretamente (o token)
      // 2. Um objeto ApiResponse com data contendo o token
      // 3. Um objeto com propriedade token
      let newToken: string | null = null;

      if (typeof data === 'string') {
        // Caso 1: Retorna string diretamente
        newToken = data;
      } else if (data && typeof data === 'object') {
        // Caso 2 ou 3: Retorna objeto
        const obj = data as Record<string, unknown>;
        if ('data' in obj && typeof obj.data === 'string') {
          // ApiResponse<string>
          newToken = obj.data as string;
        } else if ('token' in obj && typeof obj.token === 'string') {
          // Objeto com propriedade token
          newToken = obj.token as string;
        }
      }
      
      if (newToken) {
        updateToken(newToken);
        return newToken;
      }
    }

    return null;
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    return null;
  } finally {
    isRefreshing = false;
  }
}

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
    let response = await fetch(url, {
      ...options,
      headers,
    });

    // Se o token expirou (401), tentar renovar o token antes de redirecionar
    if (response.status === 401 && token && typeof window !== 'undefined') {
      // Tentar renovar o token
      const newToken = await refreshToken();
      
      if (newToken) {
        // Se conseguiu renovar, tentar novamente a requisição original com o novo token
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, {
          ...options,
          headers,
        });
        
        // Se ainda retornar 401 após renovar, limpar e redirecionar
        if (response.status === 401) {
          try {
            localStorage.removeItem('auth-storage');
          } catch (error) {
            console.error('Erro ao limpar autenticação:', error);
          }
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }
      } else {
        // Se não conseguiu renovar, limpar autenticação e redirecionar para login
        try {
          localStorage.removeItem('auth-storage');
        } catch (error) {
          console.error('Erro ao limpar autenticação:', error);
        }
        // Redirecionar para login apenas se não estiver já na página de login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }
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

