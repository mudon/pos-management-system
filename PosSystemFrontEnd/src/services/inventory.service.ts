import { api } from './api'
import type { 
  InventoryItem, 
  UpdateStockDto, 
  AdjustStockDto, 
  SearchInventoryDto 
} from '@/types/inventory'

class InventoryService {
  async getAllInventory(): Promise<InventoryItem[]> {
    try {
      const { data } = await api.get<InventoryItem[]>('/inventory')
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async getInventoryByProductId(productId: number): Promise<InventoryItem> {
    try {
      const { data } = await api.get<InventoryItem>(`/inventory/product/${productId}`)
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async getInventoryByBarcode(barcode: string): Promise<InventoryItem> {
    try {
      const { data } = await api.get<InventoryItem>(`/inventory/barcode/${barcode}`)
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    try {
      const { data } = await api.get<InventoryItem[]>('/inventory/low-stock')
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async searchInventory(searchData: SearchInventoryDto): Promise<InventoryItem[]> {
    try {
      const { data } = await api.post<InventoryItem[]>('/inventory/search', searchData)
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async updateStock(productId: number, stockData: UpdateStockDto): Promise<InventoryItem> {
    try {
      const { data } = await api.put<InventoryItem>(`/inventory/product/${productId}/stock`, stockData)
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async adjustStock(productId: number, adjustData: AdjustStockDto): Promise<InventoryItem> {
    try {
      const { data } = await api.patch<InventoryItem>(`/inventory/product/${productId}/adjust`, adjustData)
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async checkStockAvailability(productId: number, requiredQuantity: number): Promise<{ available: boolean, currentStock: number }> {
    try {
      const { data } = await api.get<{ available: boolean, currentStock: number }>(
        `/inventory/product/${productId}/check-stock/${requiredQuantity}`
      )
      return data
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

export const inventoryService = new InventoryService()