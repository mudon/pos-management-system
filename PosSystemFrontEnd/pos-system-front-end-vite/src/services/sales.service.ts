import { api } from './api'
import type { 
  Sale, 
  SaleItem, 
  SaleWithItems, 
  CreateSaleDto, 
  CreateSaleWithItemsDto,
  CreateSaleWithPaymentDto,
  CreateSaleItemDto,
  SearchSalesDto,
  DateRangeDto,
  SaleSummary,
  SaleTotalSummary
} from '@/types/sales'

class SalesService {
  // Sales CRUD operations
  async getAllSales(): Promise<Sale[]> {
    try {
      const { data } = await api.get<Sale[]>('/sales')
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async getSaleById(id: number): Promise<Sale> {
    try {
      const { data } = await api.get<Sale>(`/sales/${id}`)
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async createSale(saleData: CreateSaleDto): Promise<Sale> {
    try {
      const { data } = await api.post<Sale>('/sales', saleData)
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async createSaleWithItems(saleData: CreateSaleWithItemsDto): Promise<Sale> {
    try {
      const { data } = await api.post<Sale>('/sales/with-items', saleData)
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async createSaleWithPayment(saleData: CreateSaleWithPaymentDto): Promise<Sale> {
    try {
      const { data } = await api.post<Sale>('/sales/with-payment', saleData)
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async deleteSale(id: number): Promise<void> {
    try {
      await api.delete(`/sales/${id}`)
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async searchSales(searchData: SearchSalesDto): Promise<Sale[]> {
    try {
      const { data } = await api.post<Sale[]>('/sales/search', searchData)
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async getSalesByUser(userId: number): Promise<Sale[]> {
    try {
      const { data } = await api.get<Sale[]>(`/sales/user/${userId}`)
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async getSalesByDateRange(dateRange: DateRangeDto): Promise<Sale[]> {
    try {
      const { data } = await api.get<Sale[]>('/sales/date-range', { params: dateRange })
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async getDailySalesSummary(): Promise<SaleSummary[]> {
    try {
      const { data } = await api.get<SaleSummary[]>('/sales/summary/daily')
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async getTotalSalesAmount(): Promise<SaleTotalSummary> {
    try {
      const { data } = await api.get<SaleTotalSummary>('/sales/summary/total-amount')
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async getTotalSalesCount(): Promise<SaleTotalSummary> {
    try {
      const { data } = await api.get<SaleTotalSummary>('/sales/summary/total-count')
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  // Sale Items operations
  async getSaleItems(saleId: number): Promise<SaleItem[]> {
    try {
      const { data } = await api.get<SaleItem[]>(`/sales/${saleId}/saleItems`)
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async getSaleItemById(saleId: number, itemId: number): Promise<SaleItem> {
    try {
      const { data } = await api.get<SaleItem>(`/sales/${saleId}/saleItems/${itemId}`)
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async addSaleItem(saleId: number, itemData: CreateSaleItemDto): Promise<SaleItem> {
    try {
      const { data } = await api.post<SaleItem>(`/sales/${saleId}/saleItems`, itemData)
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async addMultipleSaleItems(saleId: number, itemsData: CreateSaleItemDto[]): Promise<SaleItem[]> {
    try {
      const { data } = await api.post<SaleItem[]>(`/sales/${saleId}/saleItems/multiple`, itemsData)
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async updateSaleItem(saleId: number, itemId: number, itemData: Partial<CreateSaleItemDto>): Promise<SaleItem> {
    try {
      const { data } = await api.put<SaleItem>(`/sales/${saleId}/saleItems/${itemId}`, itemData)
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async removeSaleItem(saleId: number, itemId: number): Promise<void> {
    try {
      await api.delete(`/sales/${saleId}/saleItems/${itemId}`)
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async removeAllSaleItems(saleId: number): Promise<void> {
    try {
      await api.delete(`/sales/${saleId}/saleItems`)
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async calculateSaleTotal(saleId: number): Promise<{ total: number }> {
    try {
      const { data } = await api.get<{ total: number }>(`/sales/${saleId}/saleItems/total`)
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async getSaleWithItems(saleId: number): Promise<SaleWithItems> {
    try {
      const { data } = await api.get<SaleWithItems>(`/sales/${saleId}/saleItems/sale-with-items`)
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

export const salesService = new SalesService()