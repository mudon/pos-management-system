export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'cashier' | 'manager'
  storeId: string
}

export interface Product {
  id: number
  barcode: string
  name: string
  price: number
  category: string
  stock: number
  tax_rate: number
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Receipt {
  id: number
  date: string
  items: CartItem[]
  paymentMethod: string
  subtotal: number
  tax: number
  total: number
}

export interface DashboardStats {
  todaySales: number
  todayTransactions: number
  lowStockItems: number
  totalProducts: number
  averageTransaction: number
}