import React, { useEffect } from 'react'
import { Outlet } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '@/components/ui/toast'
import { ThemeProvider } from '@/components/theme-provider'
import { useAuthStore } from '@/stores/auth.store'

const queryClient = new QueryClient()

export function RootLayout() {
  const initialize = useAuthStore(state => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="pos-ui-theme">
        <ToastProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
            <Outlet />
          </div>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}