export interface Sale {
  id: number
  userId: number
  userName?: string
  totalAmount: number
  paymentMethod: 'Cash' | 'Card' | 'Other'
  createdAt: string
  itemCount?: number
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

export interface SaleWithItems extends Sale {
  items: SaleItem[]
}

export interface CreateSaleDto {
  userId: number
  paymentMethod: 'Cash' | 'Card' | 'Other'
}

export interface CreateSaleWithItemsDto extends CreateSaleDto {
  items: CreateSaleItemDto[]
}

export interface CreateSaleItemDto {
  productId: number
  barcode: string
  productName: string
  quantity: number
  priceAtSale: number
}

export interface CreateSaleWithPaymentDto extends CreateSaleWithItemsDto {
  // Can add payment-specific fields if needed
}

export interface SearchSalesDto {
  startDate?: string
  endDate?: string
  userId?: number
  paymentMethod?: string
  minAmount?: number
  maxAmount?: number
  page?: number
  pageSize?: number
}

export interface DateRangeDto {
  startDate: string
  endDate: string
}

export interface SaleSummary {
  date: string
  totalAmount: number
  saleCount: number
  averageAmount: number
}

export interface SaleTotalSummary {
  totalAmount: number
  totalCount: number
  averageAmount: number
}