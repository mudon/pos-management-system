import React, { useState } from 'react'
import type { InventoryItem, AdjustStockDto } from '@/types/inventory'
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
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Plus, Minus, Package } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface AdjustStockModalProps {
  isOpen: boolean
  onClose: () => void
  item: InventoryItem
  onAdjustStock: (item: InventoryItem) => Promise<void>
  isLoading: boolean
}

export function AdjustStockModal({
  isOpen,
  onClose,
  item,
  onAdjustStock,
}: AdjustStockModalProps) {
  const { toast } = useToast()
  const [adjustment, setAdjustment] = useState(0)
  const [reason, setReason] = useState('')
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (adjustment <= 0) {
      toast({
        title: 'Invalid adjustment',
        description: 'Adjustment must be greater than 0',
        type: 'error'
      })
      return
    }

    const finalAdjustment = adjustmentType === 'add' ? adjustment : -adjustment
    const newQuantity = item.quantity + finalAdjustment

    if (newQuantity < 0) {
      toast({
        title: 'Invalid adjustment',
        description: 'Cannot remove more stock than available',
        type: 'error'
      })
      return
    }

    setIsSubmitting(true)
    try {
      const adjustData: AdjustStockDto = {
        adjustment: finalAdjustment,
        reason: reason || undefined
      }
      
      const updatedItem = await inventoryService.adjustStock(item.productId, adjustData)
      await onAdjustStock(updatedItem)
      
      setAdjustment(0)
      setReason('')
      onClose()
    } catch (error: any) {
      toast({
        title: 'Failed to adjust stock',
        description: error.message,
        type: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Adjust Stock: {item.productName}
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

          <div className="space-y-3">
            <Label>Adjustment Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={adjustmentType === 'add' ? 'default' : 'outline'}
                onClick={() => setAdjustmentType('add')}
                className="flex-col h-auto py-3"
              >
                <Plus className="h-4 w-4 mb-1" />
                <span className="text-xs">Add Stock</span>
              </Button>
              <Button
                type="button"
                variant={adjustmentType === 'remove' ? 'default' : 'outline'}
                onClick={() => setAdjustmentType('remove')}
                className="flex-col h-auto py-3"
              >
                <Minus className="h-4 w-4 mb-1" />
                <span className="text-xs">Remove Stock</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjustment">
              {adjustmentType === 'add' ? 'Quantity to Add' : 'Quantity to Remove'}
            </Label>
            <Input
              id="adjustment"
              type="number"
              min="1"
              value={adjustment}
              onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)}
              disabled={isSubmitting}
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
              disabled={isSubmitting}
              rows={2}
            />
          </div>

          {adjustment > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Current Stock:</span>
                <span className="font-medium">{item.quantity}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">Adjustment:</span>
                <span className={`font-medium ${adjustmentType === 'add' ? 'text-green-600' : 'text-red-600'}`}>
                  {adjustmentType === 'add' ? '+' : '-'}{adjustment}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1 font-bold">
                <span>New Stock:</span>
                <span className={`${adjustmentType === 'add' ? 'text-green-600' : 'text-red-600'}`}>
                  {adjustmentType === 'add' ? item.quantity + adjustment : item.quantity - adjustment}
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
              disabled={isSubmitting || adjustment <= 0}
              className={adjustmentType === 'add' 
                ? "bg-gradient-to-r from-green-500 to-emerald-600" 
                : "bg-gradient-to-r from-orange-500 to-red-600"
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adjusting...
                </>
              ) : (
                `${adjustmentType === 'add' ? 'Add' : 'Remove'} Stock`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}