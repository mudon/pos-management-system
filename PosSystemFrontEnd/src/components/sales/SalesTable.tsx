import { useState } from 'react'
import type { Sale } from '@/types/sales'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Trash2, Receipt, ChevronDown, ChevronUp, CreditCard, DollarSign } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface SalesTableProps {
  sales: Sale[]
  onViewDetails: (sale: Sale) => void
  onDelete: (id: number) => void
  isAdmin: boolean
}

export function SalesTable({
  sales,
  onViewDetails,
  onDelete,
  isAdmin,
}: SalesTableProps) {
  const [sortBy, setSortBy] = useState<'id' | 'date' | 'amount'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const sortedSales = [...sales].sort((a, b) => {
    if (sortBy === 'id') {
      return sortOrder === 'asc' 
        ? a.id - b.id
        : b.id - a.id
    } else if (sortBy === 'date') {
      return sortOrder === 'asc'
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else {
      return sortOrder === 'asc'
        ? a.totalAmount - b.totalAmount
        : b.totalAmount - a.totalAmount
    }
  })

  const toggleSort = (field: 'id' | 'date' | 'amount') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const getSortIcon = (field: 'id' | 'date' | 'amount') => {
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

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'Cash':
        return <DollarSign className="h-4 w-4 text-green-600" />
      case 'Card':
        return <CreditCard className="h-4 w-4 text-blue-600" />
      default:
        return <Receipt className="h-4 w-4 text-gray-600" />
    }
  }

  const getPaymentColor = (method: string) => {
    switch (method) {
      case 'Cash':
        return 'bg-green-100 text-green-800'
      case 'Card':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>
              <button
                onClick={() => toggleSort('id')}
                className="flex items-center gap-1 hover:text-gray-900"
              >
                Sale ID
                {getSortIcon('id')}
              </button>
            </TableHead>
            <TableHead>Cashier</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>
              <button
                onClick={() => toggleSort('amount')}
                className="flex items-center gap-1 hover:text-gray-900"
              >
                Total Amount
                {getSortIcon('amount')}
              </button>
            </TableHead>
            <TableHead>Items</TableHead>
            <TableHead>
              <button
                onClick={() => toggleSort('date')}
                className="flex items-center gap-1 hover:text-gray-900"
              >
                Date & Time
                {getSortIcon('date')}
              </button>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedSales.map((sale) => (
            <TableRow key={sale.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="font-medium text-gray-500">#{sale.id}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-medium">Sale #{sale.id}</div>
                    <div className="text-xs text-gray-500">
                      Transaction
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-gray-600">
                  {sale.userName || `User #${sale.userId}`}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={`${getPaymentColor(sale.paymentMethod)} flex items-center gap-1`}>
                  {getPaymentIcon(sale.paymentMethod)}
                  {sale.paymentMethod}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="font-bold text-green-600">
                  ${sale.totalAmount.toFixed(2)}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-gray-600">
                  {sale.itemCount || 0} items
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-600">
                  {formatDate(sale.createdAt)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewDetails(sale)}
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(sale.id)}
                      title="Delete Sale"
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {sales.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          <div className="h-12 w-12 mx-auto mb-4 opacity-20">
            <Receipt className="h-full w-full" />
          </div>
          <p>No sales found</p>
          <p className="text-sm">Create your first sale to get started</p>
        </div>
      )}
    </div>
  )
}