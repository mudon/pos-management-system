import React from 'react'
import type { InventoryItem } from '@/types/inventory'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'

interface LowStockTableProps {
  items: InventoryItem[]
}

export function LowStockTable({ items }: LowStockTableProps) {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-20" />
        <p>No low stock items found</p>
        <p className="text-sm">Inventory levels are healthy</p>
      </div>
    )
  }

  const getStockLevel = (quantity: number, minStock?: number) => {
    const percentage = minStock ? (quantity / minStock) * 100 : 0
    if (quantity === 0) return { color: 'text-red-600', text: 'Out of Stock' }
    if (percentage < 20) return { color: 'text-red-600', text: 'Critical' }
    if (percentage < 50) return { color: 'text-orange-600', text: 'Low' }
    return { color: 'text-yellow-600', text: 'Warning' }
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const stockLevel = getStockLevel(item.quantity, item.minStock)
        
        return (
          <div key={index} className="p-3 border rounded-lg hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium">{item.productName}</div>
                <div className="text-sm text-gray-600">
                  Barcode: {item.barcode} | Category: {item.categoryName}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`font-medium ${stockLevel.color}`}>
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {stockLevel.text}
                  </Badge>
                  <div>
                    <div className="font-bold">{item.quantity}</div>
                    <div className="text-xs text-gray-500">
                      of {item.minStock || 'N/A'} min
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}