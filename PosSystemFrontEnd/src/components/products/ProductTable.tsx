import { useState } from 'react'
import type { Product } from '@/types/product'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit2, Trash2, Package, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface ProductTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (id: number) => void
  onToggleStatus: (id: number) => void
  onUpdateStock: (product: Product) => void
  isAdmin: boolean
}

export function ProductTable({
  products,
  onEdit,
  onDelete,
  onToggleStatus,
  onUpdateStock,
  isAdmin,
}: ProductTableProps) {
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    } else if (sortBy === 'price') {
      return sortOrder === 'asc'
        ? a.price - b.price
        : b.price - a.price
    } else {
      return sortOrder === 'asc'
        ? (a.currentStock || 0) - (b.currentStock || 0)
        : (b.currentStock || 0) - (a.currentStock || 0)
    }
  })

  const toggleSort = (field: 'name' | 'price' | 'stock') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const getSortIcon = (field: 'name' | 'price' | 'stock') => {
    if (sortBy !== field) return null
    return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getStockColor = (stock: number, initialStock: number) => {
    const percentage = (stock / initialStock) * 100
    if (percentage < 20) return 'text-red-600 bg-red-50'
    if (percentage < 50) return 'text-orange-600 bg-orange-50'
    return 'text-green-600 bg-green-50'
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
                Product Name
                {getSortIcon('name')}
              </button>
            </TableHead>
            <TableHead>Barcode</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>
              <button
                onClick={() => toggleSort('price')}
                className="flex items-center gap-1 hover:text-gray-900"
              >
                Price
                {getSortIcon('price')}
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => toggleSort('stock')}
                className="flex items-center gap-1 hover:text-gray-900"
              >
                Stock
                {getSortIcon('stock')}
              </button>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            {
              isAdmin &&
              <TableHead className="text-right">Actions</TableHead>
            }
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProducts.map((product, index) => (
            <TableRow key={product.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="font-medium text-gray-500">{index + 1}</div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{product.name}</div>
                <div className="text-xs text-gray-500">
                  SKU: {product.id.toString().padStart(6, '0')}
                </div>
              </TableCell>
              <TableCell>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {product.barcode}
                </code>
              </TableCell>
              <TableCell>
                <div className="text-gray-600">
                  {product.categoryName || 'Uncategorized'}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-bold">${product.price.toFixed(2)}</div>
                <div className="text-xs text-gray-500">
                  Tax: {product.taxRate}%
                </div>
              </TableCell>
              <TableCell>
                <div className={`px-2 py-1 rounded text-sm font-medium inline-block ${getStockColor(product.currentStock || 0, product.initialStock)}`}>
                  {product.currentStock || 0} / {product.initialStock}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={product.isActive ? "default" : "secondary"}
                    className={product.isActive 
                      ? "bg-green-100 text-green-800 hover:bg-green-100" 
                      : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    }
                  >
                    {product.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onToggleStatus(product.id)}
                      title="Toggle Status"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-600">
                  {formatDate(product.createdAt)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {isAdmin && 
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onUpdateStock(product)}
                        title="Update Stock"
                      >
                        <Package className="h-4 w-4" />
                      </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(product)}
                      title="Edit Product"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(product.id)}
                        title="Delete Product"
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  }
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {products.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          <div className="h-12 w-12 mx-auto mb-4 opacity-20">
            <Package className="h-full w-full" />
          </div>
          <p>No products found</p>
          <p className="text-sm">Create your first product to get started</p>
        </div>
      )}
    </div>
  )
}