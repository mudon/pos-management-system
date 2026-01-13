import { useState } from 'react'
import type { InventoryItem } from '@/types/inventory'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Minus, Package, ChevronDown, ChevronUp, AlertTriangle, CheckCircle } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface InventoryTableProps {
  items: InventoryItem[]
  onAdjustStock: (item: InventoryItem) => void
  onUpdateStock: (item: InventoryItem) => void
  onCheckStock: (item: InventoryItem) => void
  isPermit: boolean
}

export function InventoryTable({
  items,
  onAdjustStock,
  onUpdateStock,
  onCheckStock,
  isPermit,
}: InventoryTableProps) {
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'updated'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const sortedItems = [...items].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc' 
        ? (a.productName || '').localeCompare(b.productName || '')
        : (b.productName || '').localeCompare(a.productName || '')
    } else if (sortBy === 'quantity') {
      return sortOrder === 'asc'
        ? a.quantity - b.quantity
        : b.quantity - a.quantity
    } else {
      return sortOrder === 'asc'
        ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    }
  })

  const toggleSort = (field: 'name' | 'quantity' | 'updated') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const getSortIcon = (field: 'name' | 'quantity' | 'updated') => {
    if (sortBy !== field) return null
    return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStockStatus = (quantity: number, minStock?: number) => {
    if (quantity === 0) {
      return { color: 'text-red-600 bg-red-50', text: 'Out of Stock', icon: AlertTriangle }
    }
    if (minStock !== undefined && quantity <= minStock) {
      return { color: 'text-orange-600 bg-orange-50', text: 'Low Stock', icon: AlertTriangle }
    }
    return { color: 'text-green-600 bg-green-50', text: 'In Stock', icon: CheckCircle }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>
              <button
                onClick={() => toggleSort('name')}
                className="flex items-center gap-1 hover:text-gray-900"
              >
                Product
                {getSortIcon('name')}
              </button>
            </TableHead>
            <TableHead>Barcode</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>
              <button
                onClick={() => toggleSort('quantity')}
                className="flex items-center gap-1 hover:text-gray-900"
              >
                Stock Quantity
                {getSortIcon('quantity')}
              </button>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <button
                onClick={() => toggleSort('updated')}
                className="flex items-center gap-1 hover:text-gray-900"
              >
                Last Updated
                {getSortIcon('updated')}
              </button>
            </TableHead>
            {isPermit && (
                <TableHead className="text-right">Actions</TableHead>
              )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItems.map((item, index) => {
            const status = getStockStatus(item.quantity, item.minStock)
            const Icon = status.icon
            
            return (
              <TableRow key={item.productId} className="hover:bg-gray-50">
                <TableCell>
                  <div className="font-medium text-gray-500">{index + 1}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{item.productName || `Product #${item.productId}`}</div>
                  <div className="text-xs text-gray-500">
                    ID: {item.productId}
                  </div>
                  {item.isActive === false && (
                    <Badge variant="secondary" className="mt-1">
                      Inactive
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {item.barcode || 'N/A'}
                  </code>
                </TableCell>
                <TableCell>
                  <div className="text-gray-600">
                    {item.categoryName || 'Uncategorized'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-bold">{item.quantity}</div>
                  {item.minStock !== undefined && (
                    <div className="text-xs text-gray-500">
                      Min: {item.minStock}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className={`px-2 py-1 rounded text-sm font-medium inline-flex items-center gap-1 ${status.color}`}>
                    <Icon className="h-3 w-3" />
                    {status.text}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600">
                    {formatDate(item.updatedAt)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {isPermit && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onAdjustStock(item)}
                          title="Adjust Stock (Add/Remove)"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onUpdateStock(item)}
                          title="Set Stock Quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {items.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          <div className="h-12 w-12 mx-auto mb-4 opacity-20">
            <Package className="h-full w-full" />
          </div>
          <p>No inventory items found</p>
          <p className="text-sm">Inventory will appear after products are created</p>
        </div>
      )}
    </div>
  )
}