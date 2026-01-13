import { createRouter, createRoute, redirect, createRootRouteWithContext } from '@tanstack/react-router'
import { RootLayout } from '@/components/layout/RootLayout'
import { LoginPage } from './routes/login'
import { SignupPage } from './routes/signup'
import { ForgotPasswordPage } from './routes/forgot-password'
import { DashboardPage } from './routes/dashboard/index'
import type { User } from './types/auth'
import { useAuthStore } from './stores/auth.store'
import { ResetPasswordPage } from './routes/reset-password'
import { CategoriesPage } from './routes/dashboard/categories'
import { ProductsPage } from './routes/dashboard/products'
import { InventoryPage } from './routes/dashboard/inventory'
import { SalesPage } from './routes/dashboard/sales'
import { ReportsPage } from './routes/dashboard/reports'

type RouterContext = {
  user: User | null
  // We can add more context here if needed
}

// Root route
const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  // Initialize context from store
  beforeLoad: () => {
    const { user } = useAuthStore.getState()
    return { user }
  },
})

// Index route (redirects to login)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({
      to: '/login',
    })
  },
})

// Login route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
  beforeLoad: ({ context }) => {
    // If user is already authenticated, redirect to dashboard
    if (context.user) {
      throw redirect({ to: '/dashboard/pos' })
    }
  },
})

// Signup route
const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: SignupPage,
  beforeLoad: ({ context }) => {
    // If user is already authenticated, redirect to dashboard
    if (context.user) {
      throw redirect({ to: '/dashboard/pos' })
    }
  },
})

// Forgot password route
const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/forgot-password',
  component: ForgotPasswordPage,
  beforeLoad: ({ context }) => {
    // If user is already authenticated, redirect to dashboard
    if (context.user) {
      throw redirect({ to: '/dashboard/pos' })
    }
  },
})

// Reset password route
const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reset-password',
  component: ResetPasswordPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: search.token as string | undefined,
    }
  },
  beforeLoad: ({ context }) => {
    // If user is already authenticated, redirect to dashboard
    if (context.user) {
      throw redirect({ to: '/dashboard/pos' })
    }
  },
})

// Dashboard route (protected)
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/pos',
  component: DashboardPage,
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: '/login' })
    }
  },
})

// categories route
const categoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/categories',
  component: CategoriesPage,
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: '/login' })
    }
  },
})

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/products',
  component: ProductsPage,
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: '/login' })
    }
  },
})

const inventoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/inventory',
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: '/login' })
    }
  },
  component: InventoryPage,
})

const salesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/sales',
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: '/login' })
    }
  },
  component: SalesPage,
})

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/reports',
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: '/login' })
    }
  },
  component: ReportsPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  signupRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  dashboardRoute,
  categoriesRoute,
  productsRoute,
  inventoryRoute,
  salesRoute,
  reportsRoute,
])

export const router = createRouter({
  routeTree,
  context: {
    user: null,
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}