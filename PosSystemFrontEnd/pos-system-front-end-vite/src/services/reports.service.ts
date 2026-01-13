import { api } from './api'
import { DateTime } from "luxon";
import type { 
  SalesReport,
  PaymentReport,
  DateRangeDto,
  ReportFilters,
  PaymentSummaryTotalAmount
} from '@/types/reports'
import type { Sale } from '@/types/sales'
import type { InventoryItem } from '@/types/inventory'
import type { Payment } from '@/types/payment'

//helper ================
function convertSalesToDailyReport(
  sales: Sale[],
  dateRange: DateRangeDto,
  timeZone = "Asia/Singapore"
): SalesReport[] {
  const start = DateTime.fromISO(dateRange.startDate, { zone: "utc" }).setZone(timeZone).startOf("day");
  const end = DateTime.fromISO(dateRange.endDate, { zone: "utc" }).setZone(timeZone).startOf("day");

  const result: SalesReport[] = [];

  for (let day = start; day <= end; day = day.plus({ days: 1 })) {
    const dailySales = sales.filter((s) => {
      const saleDate = DateTime.fromISO(s.createdAt, { zone: "utc" }).setZone(timeZone);
      return saleDate.hasSame(day, "day");
    });

    const totalAmount = dailySales.reduce((sum, s) => sum + s.totalAmount, 0);
    const saleCount = dailySales.length;

    result.push({
      date: day.toISODate()!, // e.g., "2026-01-08"
      totalAmount,
      saleCount,
      averageAmount: saleCount ? totalAmount / saleCount : 0,
    });
  }

  return result;
}

class ReportsService {
  // Sales Reports
  async getDailySalesSummary(): Promise<SalesReport[]> {
    try {
      const { data } = await api.get<SalesReport[]>('/sales/summary/daily')

      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async getTotalSalesAmount(): Promise<{ totalAmount: number, totalCount: number }> {
    try {
      const { data } = await api.get<{ totalAmount: number, totalCount: number }>('/sales/summary/total-amount')
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async getSalesByDateRange(dateRange: DateRangeDto): Promise<SalesReport[]> {
    try {
      
      const { data } = await api.get('/sales/date-range', dateRange);
      const saleDto = convertSalesToDailyReport(data as Sale[], dateRange);
      
      return saleDto as SalesReport[]
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async searchSales(filters: ReportFilters): Promise<Sale[]> {
    try {
      const { data } = await api.post<Sale[]>('/sales/search', filters)
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  // Inventory Reports
  async getLowStockItems(): Promise<InventoryItem[]> {
    try {
      const { data } = await api.get<InventoryItem[]>('/inventory/low-stock')
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async getAllInventory(): Promise<InventoryItem[]> {
    try {
      const { data } = await api.get<InventoryItem[]>('/inventory')
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async searchInventory(filters: ReportFilters): Promise<InventoryItem[]> {
    try {
      const { data } = await api.post<InventoryItem[]>('/inventory/search', filters)
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  // Payment Reports
  async getPaymentSummary(): Promise<PaymentSummaryTotalAmount> {
    try {
      const { data } = await api.get<PaymentSummaryTotalAmount>('/payments/summary/total-amount')

      console.log(data);
      
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async getPaymentsByDateRange(dateRange: DateRangeDto): Promise<Payment[]> {
    try {
      const { data } = await api.get<Payment[]>('/payments/date-range', { params: dateRange })
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  // Get all data for combined reports
  async getAllSales(): Promise<Sale[]> {
    try {
      const { data } = await api.get<Sale[]>('/sales')
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async getAllPayments(): Promise<Payment[]> {
    try {
      const { data } = await api.get<Payment[]>('/payments')
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

export const reportsService = new ReportsService()