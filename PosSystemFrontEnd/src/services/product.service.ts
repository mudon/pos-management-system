import { api } from './api'
import type { 
  Product, 
  CreateProductDto, 
  UpdateProductDto, 
  SearchProductsDto,
  ScanBarcodeDto,
  UpdateStockDto
} from '@/types/product'

class ProductService {
  async getAllProducts(): Promise<Product[]> {
    try {
      const { data } = await api.get<Product[]>('/products')
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async getProductById(id: number): Promise<Product> {
    try {
      const { data } = await api.get<Product>(`/products/${id}`)
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async getProductByBarcode(barcode: string): Promise<Product> {
    try {
      const { data } = await api.get<Product>(`/products/barcode/${barcode}`)
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async searchProducts(searchData: SearchProductsDto): Promise<Product[]> {
    try {
      const { data } = await api.post<Product[]>('/products/search', searchData)
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async scanBarcode(scanData: ScanBarcodeDto): Promise<Product> {
    try {
      const { data } = await api.post<Product>('/products/scan', scanData)
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async createProduct(productData: CreateProductDto): Promise<Product> {
    try {
      const { data } = await api.post<Product>('/products', productData)
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async updateProduct(id: number, productData: UpdateProductDto): Promise<Product> {
    try {
      const { data } = await api.put<Product>(`/products/${id}`, productData)
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async deleteProduct(id: number): Promise<void> {
    try {
      await api.delete(`/products/${id}`)
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async toggleProductStatus(id: number): Promise<Product> {
    try {
      const { data } = await api.patch<Product>(`/products/${id}/toggle-status`)
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async updateStock(id: number, stockData: UpdateStockDto): Promise<Product> {
    try {
      const { data } = await api.patch<Product>(`/products/${id}/stock`, stockData)
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async checkBarcodeExists(barcode: string): Promise<boolean> {
    try {
      const { data } = await api.get<{ exists: boolean }>(`/products/exists/barcode/${barcode}`)
      return data.exists
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data?.message || error.response.statusText
      return new Error(message)
    } else if (error.request) {
      return new Error('Network error. Please check your connection.')
    } else {
      return new Error('An unexpected error occurred.')
    }
  }
}

export const productService = new ProductService()