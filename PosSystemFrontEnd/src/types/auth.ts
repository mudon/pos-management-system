export interface User {
  id: number
  username: string
  email: string
  role: 'admin' | 'cashier'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  tokenType?: string
  expiresIn?: number
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
  tokenType?: string
  expiresIn?: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  confirmPassword: string
  role?: 'admin' | 'cashier'
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  password: string
  confirmPassword: string
}

export interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
}

export interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (data: ResetPasswordData) => Promise<void>
  refreshTokens: () => Promise<AuthTokens>
  clearError: () => void
  initialize: () => Promise<void>
}