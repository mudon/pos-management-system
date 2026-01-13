import React from 'react'

interface InventoryStatusProps {
  lowStockCount: number
}

export function InventoryStatus({ lowStockCount }: InventoryStatusProps) {
  const getStatusColor = (count: number) => {
    if (count === 0) return 'bg-green-100 text-green-800'
    if (count <= 5) return 'bg-yellow-100 text-yellow-800'
    if (count <= 10) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  const getStatusText = (count: number) => {
    if (count === 0) return 'Excellent'
    if (count <= 5) return 'Good'
    if (count <= 10) return 'Attention Needed'
    return 'Critical'
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getStatusColor(lowStockCount)} mb-3`}>
          <span className="text-2xl font-bold">{lowStockCount}</span>
        </div>
        <h3 className="text-lg font-semibold">{getStatusText(lowStockCount)}</h3>
        <p className="text-sm text-gray-600">Inventory Status</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Low Stock Items</span>
          <span className="font-medium">{lowStockCount}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getStatusColor(lowStockCount).split(' ')[0]} transition-all duration-500`}
            style={{ width: `${Math.min(lowStockCount * 10, 100)}%` }}
          />
        </div>
      </div>

      <div className="text-sm text-gray-500 space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span>0 items: Excellent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
          <span>1-5 items: Good</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-orange-500"></div>
          <span>6-10 items: Attention Needed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-500"></div>
          <span>10+ items: Critical</span>
        </div>
      </div>
    </div>
  )
}