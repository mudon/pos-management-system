export interface Product {
  id: number
  barcode: string
  name: string
  categoryId: number | null
  categoryName?: string
  supplierId: string | null
  supplierName?: string
  price: number
  taxRate: number
  initialStock: number
  currentStock?: number
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export interface CreateProductDto {
  barcode: string
  name: string
  categoryId?: number | null
  supplierId?: string | null
  price: number
  taxRate?: number
  initialStock: number
  isActive?: boolean
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  isActive?: boolean
}

export interface SearchProductsDto {
  searchTerm?: string
  categoryId?: number
  isActive?: boolean
  page?: number
  pageSize?: number
}

export interface ScanBarcodeDto {
  barcode: string
}

export interface UpdateStockDto {
  stock: number
  reason?: string
}