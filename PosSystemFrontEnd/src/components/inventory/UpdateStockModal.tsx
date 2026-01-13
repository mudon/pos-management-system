import React, { useState } from 'react'
import type { InventoryItem, UpdateStockDto } from '@/types/inventory'
import { inventoryService } from '@/services/inventory.service'
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
import { Loader2, Package } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface UpdateStockModalProps {
  isOpen: boolean
  onClose: () => void
  item: InventoryItem
  onUpdateStock: (item: InventoryItem) => Promise<void>
  isLoading: boolean
}

export function UpdateStockModal({
  isOpen,
  onClose,
  item,
  onUpdateStock,
}: UpdateStockModalProps) {
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(item.quantity)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (quantity < 0) {
      toast({
        title: 'Invalid quantity',
        description: 'Quantity cannot be negative',
        type: 'error'
      })
      return
    }

    if (quantity === item.quantity) {
      toast({
        title: 'No changes',
        description: 'Quantity is the same as current stock',
        type: 'warning'
      })
      return
    }

    setIsSubmitting(true)
    try {
      const updateData: UpdateStockDto = { quantity }
      const updatedItem = await inventoryService.updateStock(item.productId, updateData)
      await onUpdateStock(updatedItem)
      
      setQuantity(item.quantity)
      onClose()
    } catch (error: any) {
      toast({
        title: 'Failed to update stock',
        description: error.message,
        type: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const difference = quantity - item.quantity

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Set Stock Quantity: {item.productName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-600" />
                <span className="font-medium">Current Stock</span>
              </div>
              <span className="text-2xl font-bold">{item.quantity}</span>
            </div>
            <div className="text-sm text-gray-600">
              Barcode: <code className="ml-2 bg-gray-200 px-2 py-1 rounded">{item.barcode || 'N/A'}</code>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">New Stock Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              disabled={isSubmitting}
              placeholder="Enter new quantity"
            />
          </div>

          {quantity !== item.quantity && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Current Stock:</span>
                <span className="font-medium">{item.quantity}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">Difference:</span>
                <span className={`font-medium ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {difference >= 0 ? '+' : ''}{difference}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1 font-bold">
                <span>New Stock:</span>
                <span className={`${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {quantity}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || quantity < 0 || quantity === item.quantity}
              className="bg-gradient-to-r from-blue-500 to-purple-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                'Set Stock Quantity'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}