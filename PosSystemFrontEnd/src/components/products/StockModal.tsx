import React, { useState } from 'react'
import type { Product } from '@/types/product'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Package, TrendingUp, TrendingDown } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface StockModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product
  onUpdateStock: (id: number, stock: number, reason?: string) => Promise<void>
  isLoading: boolean
}

export function StockModal({
  isOpen,
  onClose,
  product,
  onUpdateStock,
  isLoading,
}: StockModalProps) {
  const { toast } = useToast()
  const [stock, setStock] = useState(product.currentStock || 0)
  const [reason, setReason] = useState('')
  const [adjustmentType, setAdjustmentType] = useState<'set' | 'add' | 'subtract'>('set')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    let finalStock = stock
    if (adjustmentType === 'add') {
      finalStock = (product.currentStock || 0) + stock
    } else if (adjustmentType === 'subtract') {
      finalStock = (product.currentStock || 0) - stock
    }

    if (finalStock < 0) {
      toast({
        title: 'Invalid stock',
        description: 'Stock cannot be negative',
        type: 'error'
      })
      return
    }

    try {
      await onUpdateStock(product.id, finalStock, reason || undefined)
      onClose()
      setStock(0)
      setReason('')
    } catch (error) {
      // Error handled by parent
    }
  }

  const currentStock = product.currentStock || 0
  const difference = adjustmentType === 'set' 
    ? stock - currentStock
    : adjustmentType === 'add' 
      ? stock 
      : -stock

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Update Stock: {product.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-600" />
                <span className="font-medium">Current Stock</span>
              </div>
              <span className="text-2xl font-bold">{currentStock}</span>
            </div>
            <div className="text-sm text-gray-600">
              Barcode: <code className="ml-2 bg-gray-200 px-2 py-1 rounded">{product.barcode}</code>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Adjustment Type</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={adjustmentType === 'set' ? 'default' : 'outline'}
                onClick={() => setAdjustmentType('set')}
                className="flex-col h-auto py-3"
              >
                <Package className="h-4 w-4 mb-1" />
                <span className="text-xs">Set Exact</span>
              </Button>
              <Button
                type="button"
                variant={adjustmentType === 'add' ? 'default' : 'outline'}
                onClick={() => setAdjustmentType('add')}
                className="flex-col h-auto py-3"
              >
                <TrendingUp className="h-4 w-4 mb-1" />
                <span className="text-xs">Add Stock</span>
              </Button>
              <Button
                type="button"
                variant={adjustmentType === 'subtract' ? 'default' : 'outline'}
                onClick={() => setAdjustmentType('subtract')}
                className="flex-col h-auto py-3"
              >
                <TrendingDown className="h-4 w-4 mb-1" />
                <span className="text-xs">Subtract Stock</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">
              {adjustmentType === 'set' ? 'New Stock Quantity' :
               adjustmentType === 'add' ? 'Quantity to Add' :
               'Quantity to Subtract'}
            </Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(parseInt(e.target.value) || 0)}
              disabled={isLoading}
              placeholder="Enter quantity"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="e.g., New shipment, Sales, Damaged goods, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isLoading}
              rows={2}
            />
          </div>

          {stock > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Current Stock:</span>
                <span className="font-medium">{currentStock}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">Adjustment:</span>
                <span className={`font-medium ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {difference >= 0 ? '+' : ''}{difference}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1 font-bold">
                <span>New Stock:</span>
                <span className={`${adjustmentType === 'set' ? 'text-blue-600' : difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {adjustmentType === 'set' ? stock : currentStock + difference}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || stock < 0}
              className="bg-gradient-to-r from-green-500 to-emerald-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                'Update Stock'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}