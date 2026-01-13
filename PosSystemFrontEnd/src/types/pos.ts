export interface Product {
  id: number
  barcode: string
  name: string
  price: number
  category: string
  categoryId: number
  stock: number
  taxRate: number
  isActive: boolean
  createdAt: string
  supplierId?: number
}

export interface Category {
  id: number
  name: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface SaleItem {
  id: number
  saleId: number
  productId: number
  barcode: string
  productName: string
  quantity: number
  priceAtSale: number
}

export interface Sale {
  id: number
  userId: number
  totalAmount: number
  paymentMethod: string
  createdAt: string
  items?: SaleItem[]
}

export interface CreateSaleDto {
  items: Array<{
    productId: number
    quantity: number
  }>
  paymentMethod: string
}

export interface CreateSaleWithPaymentDto extends CreateSaleDto {
  paymentAmount: number
  transactionId: string
  notes?: string
}

export interface Payment {
  id: number
  saleId: number
  amount: number
  method: string
  paidAt: string
  transactionId: string
  notes?: string
}

export interface Receipt {
  id: number
  date: string
  items: CartItem[]
  paymentMethod: string
  subtotal: number
  tax: number
  total: number
  transactionId?: string
}

export interface SalesSummary {
  daily: Array<{
    date: string
    totalAmount: number
    transactionCount: number
  }>
  totalAmount: number
  totalCount: number
}

export interface InventoryUpdateDto {
  quantity?: number
  adjust?: number
}

export interface DashboardStats {
  todaySales: number
  transactionsToday: number
  lowStockItems: number
  totalAmount: number
}

export interface StockCheckResponse {
  available: boolean
  currentStock: number
}

export interface SaleTotalResponse {
  total: number
}