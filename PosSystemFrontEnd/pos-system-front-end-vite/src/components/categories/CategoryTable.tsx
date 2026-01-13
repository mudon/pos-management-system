import React, { useState } from 'react'
import type  { Category } from '@/types/category'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit2, Trash2, Eye, ChevronDown, ChevronUp, Package } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface CategoryTableProps {
  categories: Category[]
  isPermit: boolean
  onEdit: (category: Category) => void
  onDelete: (id: number) => void
  onViewProducts: (category: Category) => void
}

export function CategoryTable({
  categories,
  onEdit,
  onDelete,
  onViewProducts,
  isPermit
}: CategoryTableProps) {
  const [sortBy, setSortBy] = useState<'name' | 'products'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const sortedCategories = [...categories].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    } else {
      return sortOrder === 'asc'
        ? a.product_count - b.product_count
        : b.product_count - a.product_count
    }
  })

  const toggleSort = (field: 'name' | 'products') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const getSortIcon = (field: 'name' | 'products') => {
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

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Icon</TableHead>
            <TableHead>
              <button
                onClick={() => toggleSort('name')}
                className="flex items-center gap-1 hover:text-gray-900"
              >
                Category Name
                {getSortIcon('name')}
              </button>
            </TableHead>
            <TableHead>Description</TableHead>
            <TableHead>
              <button
                onClick={() => toggleSort('products')}
                className="flex items-center gap-1 hover:text-gray-900"
              >
                Products
                {getSortIcon('products')}
              </button>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            {
              isPermit &&
              <TableHead className="text-right">Actions</TableHead>
            }
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCategories.map((category) => (
            <TableRow key={category.id} className="hover:bg-gray-50">
              <TableCell>
                <div 
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  {category.icon}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{category.name}</div>
                <div className="text-xs text-gray-500">
                  ID: {category.id}
                </div>
              </TableCell>
              <TableCell>
                <div className="max-w-xs truncate text-gray-600">
                  {category.description || 'No description'}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-semibold">{category.product_count}</div>
                <div className="text-xs text-gray-500">products</div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={category.is_active ? "default" : "secondary"}
                  className={category.is_active 
                    ? "bg-green-100 text-green-800 hover:bg-green-100" 
                    : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                  }
                >
                  {category.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-600">
                  {formatDate(category.created_at)}
                </div>
              </TableCell>
              {
                isPermit &&
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewProducts(category)}
                      title="View Products"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(category)}
                      title="Edit Category"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(category.id)}
                      title="Delete Category"
                      disabled={category.product_count > 0}
                      className={category.product_count > 0 ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              }
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {categories.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          <div className="h-12 w-12 mx-auto mb-4 opacity-20">
            <Package className="h-full w-full" />
          </div>
          <p>No categories found</p>
          <p className="text-sm">Create your first category to get started</p>
        </div>
      )}
    </div>
  )
}