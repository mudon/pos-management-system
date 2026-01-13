import { useAuthStore } from '@/stores/auth.store'
import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'

export function useAuth(requireAuth = false) {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    clearError,
    initialize,
  } = useAuthStore()

  const navigate = useNavigate()

  // Initialize auth on mount
  useEffect(() => {
    initialize()
  }, [initialize])

    // Clear error on unmount
    useEffect(() => {
        return () => {
        clearError()
        }
    }, [clearError])

  // Redirect if auth state changes
  useEffect(() => {
    if (requireAuth && !isLoading && !isAuthenticated) {
      navigate({ to: '/login' })
    }
  }, [isAuthenticated, isLoading, requireAuth, navigate])

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    clearError,
  }
}