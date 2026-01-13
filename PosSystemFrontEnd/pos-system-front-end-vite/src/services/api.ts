import axios, { AxiosError } from 'axios'
import type { AxiosInstance } from 'axios'
import type { AuthTokens } from '@/types/auth'
import { useAuthStore } from '@/stores/auth.store'

class ApiService {
  private client: AxiosInstance
  private isRefreshing = false;
  private failedQueue: {
    resolve: (value?: any) => void;
    reject: (err?: any) => void;
  }[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
      headers: { 'Content-Type': 'application/json' },
    });

    // Request interceptor
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;

          if (this.isRefreshing) {
            // If refresh is already in progress, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => this.client(originalRequest))
              .catch((err) => Promise.reject(err));
          }

          this.isRefreshing = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) throw new Error('No refresh token');

            // Call your refresh API
            await useAuthStore.getState().refreshTokens(); 
            // refreshTokens() should update access_token in localStorage and Axios defaults

            // Retry all queued requests
            this.failedQueue.forEach(q => q.resolve());
            this.failedQueue = [];

            this.isRefreshing = false;

            // Retry the original request
            return this.client(originalRequest);
          } catch (err) {
            this.failedQueue.forEach(q => q.reject(err));
            this.failedQueue = [];
            this.isRefreshing = false;

            useAuthStore.getState().logout();
            return Promise.reject(err);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // HTTP Methods
  get<T>(url: string, params?: any) {
    return this.client.get<T>(url, { params })
  }

  post<T>(url: string, data?: any) {
    return this.client.post<T>(url, data)
  }

  put<T>(url: string, data?: any) {
    return this.client.put<T>(url, data)
  }

  delete<T>(url: string) {
    return this.client.delete<T>(url)
  }

  patch<T>(url: string, data?: any) {
    return this.client.patch<T>(url, data)
  }

  // Auth-specific methods
  setAuthTokens(tokens: AuthTokens) {
    localStorage.setItem('access_token', tokens.accessToken)
    localStorage.setItem('refresh_token', tokens.refreshToken)

    this.client.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`
  }

  clearAuthTokens() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    delete this.client.defaults.headers.common['Authorization']
  }
}

export const api = new ApiService()