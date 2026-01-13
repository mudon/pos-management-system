export interface SalesReport {
  date: string
  totalAmount: number
  saleCount: number
  averageAmount: number
}

export interface InventoryReport {
  productName: string
  barcode: string
  currentStock: number
  minStock: number
  maxStock: number
  status: string
}

export interface LowStockReport {
  productName: string
  barcode: string
  currentStock: number
  minStock: number
  categoryName: string
}

export interface PaymentReport {
  method: string
  totalAmount: number
  transactionCount: number
  percentage: number
}

export interface DateRangeDto {
  startDate: string
  endDate: string
}

export interface ReportFilters {
  startDate?: string
  endDate?: string
  categoryId?: number
  userId?: number
  paymentMethod?: string
}

export interface PaymentSummaryTotalAmount{
  totalAmount: number
}