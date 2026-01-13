import { useState } from 'react'
import type { InventoryItem } from '@/types/inventory'
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
import { Loader2, Package, CheckCircle, XCircle } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface CheckStockModalProps {
  isOpen: boolean
  onClose: () => void
  item: InventoryItem
  onCheckStock: (productId: number, requiredQuantity: number) => Promise<{ available: boolean, currentStock: number }>
  isLoading: boolean
}

export function CheckStockModal({
  isOpen,
  onClose,
  item,
  onCheckStock,
}: CheckStockModalProps) {
  const { toast } = useToast()
  const [requiredQuantity, setRequiredQuantity] = useState(1)
  const [isChecking, setIsChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<{ available: boolean, currentStock: number } | null>(null)

  const handleCheck = async () => {
    if (requiredQuantity <= 0) {
      toast({
        title: 'Invalid quantity',
        description: 'Required quantity must be greater than 0',
        type: 'error'
      })
      return
    }

    setIsChecking(true)
    try {
      const result = await onCheckStock(item.productId, requiredQuantity)
      setCheckResult(result)
    } catch (error: any) {
      toast({
        title: 'Failed to check stock',
        description: error.message,
        type: 'error'
      })
    } finally {
      setIsChecking(false)
    }
  }

  const handleReset = () => {
    setCheckResult(null)
    setRequiredQuantity(1)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Check Stock Availability: {item.productName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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
            <Label htmlFor="requiredQuantity">Required Quantity</Label>
            <Input
              id="requiredQuantity"
              type="number"
              min="1"
              value={requiredQuantity}
              onChange={(e) => {
                setRequiredQuantity(parseInt(e.target.value) || 1)
                setCheckResult(null)
              }}
              disabled={isChecking}
              placeholder="Enter required quantity"
            />
          </div>

          {checkResult && (
            <div className={`p-4 rounded-lg ${checkResult.available ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center gap-3 mb-2">
                {checkResult.available ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-bold ${checkResult.available ? 'text-green-700' : 'text-red-700'}`}>
                  {checkResult.available ? 'Stock Available' : 'Insufficient Stock'}
                </span>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Stock:</span>
                  <span className="font-medium">{checkResult.currentStock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Required Quantity:</span>
                  <span className="font-medium">{requiredQuantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Difference:</span>
                  <span className={`font-medium ${checkResult.available ? 'text-green-600' : 'text-red-600'}`}>
                    {checkResult.currentStock - requiredQuantity}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isChecking}
            >
              Reset
            </Button>
            <Button
              type="button"
              onClick={handleCheck}
              disabled={isChecking || requiredQuantity <= 0}
              className="bg-gradient-to-r from-blue-500 to-purple-600"
            >
              {isChecking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Checking...
                </>
              ) : (
                'Check Availability'
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}