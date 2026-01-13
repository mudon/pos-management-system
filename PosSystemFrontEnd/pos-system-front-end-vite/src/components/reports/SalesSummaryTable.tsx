import React from 'react'
import type { SalesReport } from '@/types/reports'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface SalesSummaryTableProps {
  data: SalesReport[]
}

export function SalesSummaryTable({ data }: SalesSummaryTableProps) {
  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p>No sales data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {data.map((day, index) => {
        const date = new Date(day.date)
        const previousDay = data[index - 1]
        const change = previousDay ? 
          ((day.totalAmount - previousDay.totalAmount) / previousDay.totalAmount * 100) : 0
        
        return (
          <div key={index} className="p-3 border rounded-lg hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className="text-sm text-gray-600">
                  {day.saleCount} sales
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <div className="text-lg font-bold">${day.totalAmount? day.totalAmount.toFixed(2) : 0}</div>
                  {index > 0 && (
                    <div className={`text-sm flex items-center ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {change >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {Math.abs(change)? Math.abs(change).toFixed(1) : 0}%
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  Avg: ${day.averageAmount? day.averageAmount.toFixed(2) : 0}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}