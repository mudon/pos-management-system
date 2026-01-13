import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '@/services/auth.service'
import type { AuthStore, LoginCredentials, RegisterData, ResetPasswordData, AuthState } from '@/types/auth'

const initialState: AuthState = {
  user: null,
  tokens: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.login(credentials)
          
          set({
            user: response.user,
            tokens: {accessToken: response.accessToken, refreshToken: response.refreshToken},
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error: any) {
          set({ 
            error: error.message,
            isLoading: false 
          })
          throw error
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.register(userData)
          
          set({
            user: response.user,
            tokens: {accessToken: response.accessToken, refreshToken: response.refreshToken},
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error: any) {
          set({ 
            error: error.message,
            isLoading: false 
          })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await authService.logout()
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
          })
        } catch (error: any) {
          set({ 
            error: error.message,
            isLoading: false 
          })
          throw error
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null })
        try {
          await authService.forgotPassword(email)
          set({ isLoading: false })
        } catch (error: any) {
          set({ 
            error: error.message,
            isLoading: false 
          })
          throw error
        }
      },

      resetPassword: async (data: ResetPasswordData) => {
        set({ isLoading: true, error: null })
        try {
          await authService.resetPassword(data)
          set({ isLoading: false })
        } catch (error: any) {
          set({ 
            error: error.message,
            isLoading: false 
          })
          throw error
        }
      },

      refreshTokens: async () => {
        const { tokens } = get()

        if (!tokens?.refreshToken) {
          set({ user: null, tokens: null, isAuthenticated: false })
          throw new Error('No refresh token')
        }

        try {
          // 🔥 use your existing service
          const newTokens = await authService.refreshToken(tokens.refreshToken)

          // 🔥 fetch user again (important)
          const user = await authService.getCurrentUser()

          set({
            tokens: newTokens,
            user,
            isAuthenticated: true,
          })

          return newTokens
        } catch (error) {
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
          })
          throw error
        }
      },

      clearError: () => {
        set({ error: null })
      },

      initialize: async () => {
        set({ isLoading: true })
        try {
          const user = await authService.getCurrentUser()
          const accessToken = localStorage.getItem('access_token')
          const refreshToken = localStorage.getItem('refresh_token')

          if (user && accessToken && refreshToken) {
            set({
              user,
              tokens: { accessToken, refreshToken },
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            set({ 
              ...initialState,
              isLoading: false 
            })
          }
        } catch (error) {
          set({ 
            ...initialState,
            isLoading: false 
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)