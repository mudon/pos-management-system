import { api } from './api'
import type { 
  Product, 
  Category, 
  Sale, 
  SaleItem, 
  CreateSaleDto, 
  CreateSaleWithPaymentDto, 
  Payment, 
  SalesSummary,
  InventoryUpdateDto 
} from '@/types/pos'

class POSService {
  // ==================== PRODUCTS ====================
  async getProducts() {
    const response = await api.get<Product[]>('/products')
    return response.data
  }

  async getProduct(id: number) {
    const response = await api.get<Product>(`/products/${id}`)
    return response.data
  }

  async getProductByBarcode(barcode: string) {
    try {
      const response = await api.get<Product>(`/products/barcode/${barcode}`)
      return response.data
    } catch (error) {
      console.error('Product not found:', error)
      return null
    }
  }

  async searchProducts(query: string) {
    const response = await api.post<Product[]>('/products/search', { query })
    return response.data
  }

  async scanBarcode(barcode: string) {
    const response = await api.post<Product>('/products/scan', { barcode })
    return response.data
  }

  async updateStock(productId: number, data: InventoryUpdateDto) {
    if (data.quantity !== undefined) {
      const response = await api.patch(`/products/${productId}/stock`, { quantity: data.quantity })
      return response.data
    } else if (data.adjust !== undefined) {
      const response = await api.patch(`/inventory/product/${productId}/adjust`, { adjust: data.adjust })
      return response.data
    }
  }

  async checkStock(productId: number, requiredQuantity: number) {
    const response = await api.get<{ available: boolean, currentStock: number }>(
      `/inventory/product/${productId}/check-stock/${requiredQuantity}`
    )
    return response.data
  }

  // ==================== CATEGORIES ====================
  async getCategories() {
    const response = await api.get<Category[]>('/categories')
    return response.data
  }

  async getCategory(id: number) {
    const response = await api.get<Category>(`/categories/${id}`)
    return response.data
  }

  // ==================== INVENTORY ====================
  async getInventory() {
    const response = await api.get<Product[]>('/inventory')
    return response.data
  }

  async getLowStockItems() {
    const response = await api.get<Product[]>('/inventory/low-stock')
    return response.data
  }

  async getInventoryByProduct(productId: number) {
    const response = await api.get<{ quantity: number }>(`/inventory/product/${productId}`)
    return response.data
  }

  // ==================== SALES ====================
  async getSales() {
    const response = await api.get<Sale[]>('/sales')
    return response.data
  }

  async getSale(id: number) {
    const response = await api.get<Sale>(`/sales/${id}`)
    return response.data
  }

  async createSale(data: CreateSaleDto) {
    const response = await api.post<Sale>('/sales', data)
    return response.data
  }

  async createSaleWithItems(saleId: number, items: SaleItem[]) {
    const response = await api.post(`/sales/${saleId}/saleItems/multiple`, { items })
    return response.data
  }

    async createSaleWithPayment(data: CreateSaleWithPaymentDto) {
        console.log(data);
        
        const response = await api.post<{ sale: Sale; payment: Payment }>('/sales/with-payment', data)
        return response.data
    }

  async getSalesByUser(userId: number) {
    const response = await api.get<Sale[]>(`/sales/user/${userId}`)
    return response.data
  }

  async getSalesByDateRange(startDate: string, endDate: string) {
    const response = await api.get<Sale[]>('/sales/date-range', {
      params: { startDate, endDate }
    })
    return response.data
  }

  async getSaleItems(saleId: number) {
    const response = await api.get<SaleItem[]>(`/sales/${saleId}/saleItems`)
    return response.data
  }

  async calculateSaleTotal(saleId: number) {
    const response = await api.get<{ total: number }>(`/sales/${saleId}/saleItems/total`)
    return response.data
  }

  // ==================== PAYMENTS ====================
  async getPayments() {
    const response = await api.get<Payment[]>('/payments')
    return response.data
  }

  async getPaymentBySale(saleId: number) {
    const response = await api.get<Payment>(`/payments/sale/${saleId}`)
    return response.data
  }

  async createPayment(data: {
    saleId: number
    amount: number
    method: string
    transactionId: string
    notes?: string
  }) {
    const response = await api.post<Payment>('/payments', data)
    return response.data
  }

  async getPaymentReceipt(paymentId: number) {
    const response = await api.get(`/payments/${paymentId}/receipt`)
    return response.data
  }

  // ==================== STATISTICS ====================
  async getSalesSummary() {
    const response = await api.get<SalesSummary>('/sales/summary/total-amount')
    return response.data
  }

  async getDailySalesSummary() {
    const response = await api.get<Array<{ date: string; totalAmount: number; transactionCount: number }>>(
      '/sales/summary/daily'
    )
    return response.data
  }

  async getTotalSalesCount() {
    const response = await api.get<{ totalCount: number }>('/sales/summary/total-count')
    return response.data
  }

  // ==================== DASHBOARD STATS ====================
  async getDashboardStats() {
    try {
      const [salesSummary, lowStock, payments] = await Promise.all([
        this.getSalesSummary(),
        this.getLowStockItems(),
        this.getPayments()
      ])

      const today = new Date().toISOString().split('T')[0]
      const todayPayments = payments.filter(p => p.paidAt.startsWith(today))
      const todayTotal = todayPayments.reduce((sum, p) => sum + p.amount, 0)

      return {
        todaySales: todayTotal,
        transactionsToday: todayPayments.length,
        lowStockItems: lowStock.length,
        totalAmount: salesSummary.totalAmount || 0
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        todaySales: 0,
        transactionsToday: 0,
        lowStockItems: 0,
        totalAmount: 0
      }
    }
  }
}

export const posService = new POSService()