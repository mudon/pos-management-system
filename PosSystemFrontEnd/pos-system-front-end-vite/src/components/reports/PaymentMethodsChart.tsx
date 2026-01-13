import React from 'react'
import type { PaymentReport } from '@/types/reports'
import { CreditCard, DollarSign, Receipt } from 'lucide-react'

interface PaymentMethodsChartProps {
  data: PaymentReport[]
}

export function PaymentMethodsChart({ data }: PaymentMethodsChartProps) {
   const safeData = Array.isArray(data) ? data : []

  if (safeData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <p>No payment data available</p>
      </div>
    )
  }

  const totalAmount = safeData.reduce((sum, item) => sum + item.totalAmount, 0)

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return <DollarSign className="h-4 w-4" />
      case 'card':
        return <CreditCard className="h-4 w-4" />
      default:
        return <Receipt className="h-4 w-4" />
    }
  }

  const getMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return 'bg-green-500'
      case 'card':
        return 'bg-blue-500'
      default:
        return 'bg-purple-500'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          ${totalAmount.toFixed(2)}
        </h3>
        <div className="text-sm text-gray-500">
          {safeData.reduce((sum, item) => sum + item.transactionCount, 0)} transactions
        </div>
      </div>

      <div className="space-y-3">
        {safeData.map((method, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${getMethodColor(method.method)}`} />
                <span className="text-sm font-medium">{method.method}</span>
              </div>
              <span className="text-sm font-semibold">
                ${method.totalAmount? method.totalAmount.toFixed(2):0}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getMethodColor(method.method)} transition-all duration-500`}
                style={{ width: `${method.percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{method.transactionCount} transactions</span>
              <span>{method.percentage}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 pt-4 border-t">
        {safeData.map((method, index) => (
          <div key={index} className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              {getMethodIcon(method.method)}
              <span className="text-sm font-medium">{method.method}</span>
            </div>
            <div className="text-lg font-bold">
              ${method.totalAmount? method.totalAmount.toFixed(2):0}
            </div>
            <div className="text-xs text-gray-500">
              {method.transactionCount} txn
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}