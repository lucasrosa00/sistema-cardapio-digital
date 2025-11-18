// Serviço de autenticação
import { api } from './client';
import type { LoginDto, LoginResponseDto } from './types';

export const authService = {
  /**
   * Realiza login na API
   */
  async login(login: string, password: string): Promise<LoginResponseDto> {
    const response = await api.post<LoginResponseDto>('/api/Auth/login', {
      login,
      password,
    } as LoginDto);
    
    return response.data;
  },
};

