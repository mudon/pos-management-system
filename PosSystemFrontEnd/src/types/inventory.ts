export interface InventoryItem {
  productId: number
  productName?: string
  barcode?: string
  categoryName?: string
  quantity: number
  updatedAt: string
  minStock?: number
  maxStock?: number
  price?: number
  isActive?: boolean
}

export interface UpdateStockDto {
  quantity: number
}

export interface AdjustStockDto {
  adjustment: number
  reason?: string
}

export interface CheckStockDto {
  requiredQuantity: number
}

export interface SearchInventoryDto {
  searchTerm?: string
  categoryId?: number
  lowStockOnly?: boolean
  inactiveOnly?: boolean
  page?: number
  pageSize?: number
}