import { api } from './api'
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ResetPasswordData,
  User,
  AuthTokens
} from '@/types/auth'

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', credentials)
      // Store tokens
      api.setAuthTokens({accessToken: data.accessToken, refreshToken: data.refreshToken})
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(data.user))
      
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', userData)
      
      // Store tokens
      api.setAuthTokens({accessToken: data.accessToken, refreshToken: data.refreshToken})

      // Store user data
      localStorage.setItem('user', JSON.stringify(data.user))

      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        await api.post('/auth/revoke-token', { refreshToken })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local storage regardless
      api.clearAuthTokens()
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await api.post('/auth/forgot-password', { email })
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<void> {
    try {
      await api.post('/auth/reset-password', data)
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const { data } = await api.post<AuthTokens>('/auth/refresh-token', { refreshToken })
      api.setAuthTokens(data)
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userStr = localStorage.getItem('user')
      if (!userStr) return null

      const user: User = JSON.parse(userStr)
      
      // Optionally validate token with backend
      // const { data } = await api.get<User>('/auth/me')
      // return data
      
      return user
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.message || error.response.statusText
      return new Error(message)
    } else if (error.request) {
      // Request made but no response
      return new Error('Network error. Please check your connection.')
    } else {
      // Something else happened
      return new Error('An unexpected error occurred.')
    }
  }
}

export const authService = new AuthService()