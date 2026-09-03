import { apiClient } from './apiClient';
import { ApiResponse, AuthResponse, LoginRequest, UserProfileDto } from '../types/auth.types';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data.data;
  },

  async getCurrentUser(): Promise<UserProfileDto> {
    const response = await apiClient.get<ApiResponse<UserProfileDto>>('/auth/me');
    return response.data.data;
  },

  async logout(refreshToken: string): Promise<void> {
    try {
      await apiClient.post('/auth/logout', { refreshToken });
    } catch {
      // Ignore network errors during logout
    } finally {
      localStorage.removeItem('vetra_gov_access_token');
      localStorage.removeItem('vetra_gov_refresh_token');
      localStorage.removeItem('vetra_gov_user');
    }
  },
};
