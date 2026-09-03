import { apiClient } from './apiClient';
import { ApiResponse } from '../types/auth.types';
import { SystemConfigurationResponse, HealthResponse } from '../types/system.types';

export const systemService = {
  /**
   * Retrieves non-sensitive, read-only system and surveillance configuration.
   * Requires GOVERNMENT_OFFICER or ADMINISTRATOR role.
   */
  getSystemConfiguration: async (): Promise<SystemConfigurationResponse> => {
    const response = await apiClient.get<ApiResponse<SystemConfigurationResponse>>(
      '/system/configuration'
    );
    return response.data.data;
  },

  /**
   * Checks backend service readiness.
   */
  getHealthStatus: async (): Promise<HealthResponse> => {
    const response = await apiClient.get<ApiResponse<HealthResponse>>('/health/readiness', {
      baseURL: '', // hits root endpoint
    }).catch(async () => {
      // Fallback to /readiness
      const fallback = await apiClient.get<ApiResponse<HealthResponse>>('/readiness', {
        baseURL: '',
      });
      return fallback;
    });
    return response.data.data || { status: 'READY' };
  },
};
