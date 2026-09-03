import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, AuthResponse } from '../types/auth.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Access Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('vetra_gov_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 401 Token Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('vetra_gov_refresh_token');
      if (!refreshToken) {
        localStorage.removeItem('vetra_gov_access_token');
        localStorage.removeItem('vetra_gov_user');
        window.dispatchEvent(new Event('vetra_auth_logout'));
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<ApiResponse<AuthResponse>>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        const newAccessToken = response.data.data.accessToken;
        const newRefreshToken = response.data.data.refreshToken;

        localStorage.setItem('vetra_gov_access_token', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('vetra_gov_refresh_token', newRefreshToken);
        }

        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        localStorage.removeItem('vetra_gov_access_token');
        localStorage.removeItem('vetra_gov_refresh_token');
        localStorage.removeItem('vetra_gov_user');
        window.dispatchEvent(new Event('vetra_auth_logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
