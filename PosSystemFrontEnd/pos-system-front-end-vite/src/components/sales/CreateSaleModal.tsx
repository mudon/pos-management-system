import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { CreateSaleWithPaymentDto, CreateSaleItemDto } from '@/types/sales'
import { useAuth } from '@/hooks/useAuth'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, Minus, Trash2, Package, DollarSign, CreditCard } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { productService } from '@/services/product.service'
import type { Product } from '@/types/product'
import { Badge } from '@/components/ui/badge'

const saleItemSchema = z.object({
  productId: z.number().min(1, 'Product ID is required'),
  barcode: z.string().min(1, 'Barcode is required'),
  productName: z.string().min(1, 'Product name is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  priceAtSale: z.number().min(0.01, 'Price must be greater than 0'),
})

const createSaleSchema = z.object({
  userId: z.number(),
  paymentMethod: z.enum(['Cash', 'Card', 'Other']),
  items: z.array(saleItemSchema).min(1, 'At least one item is required'),
})

type CreateSaleFormValues = z.infer<typeof createSaleSchema>

interface CreateSaleModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateSaleWithPaymentDto) => Promise<void>
  isLoading: boolean
}

export function CreateSaleModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CreateSaleModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [barcodeInput, setBarcodeInput] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const form = useForm<CreateSaleFormValues>({
    resolver: zodResolver(createSaleSchema),
    defaultValues: {
      userId: user?.id || 0,
      paymentMethod: 'Cash',
      items: [],
    },
  })

  const items = form.watch('items')
  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.priceAtSale), 0)

  const handleBarcodeScan = async () => {
    if (!barcodeInput.trim()) {
      toast({
        title: 'Enter barcode',
        description: 'Please enter a barcode to scan',
        type: 'warning'
      })
      return
    }

    try {
      const product = await productService.getProductByBarcode(barcodeInput)
      setSelectedProduct(product)
      setBarcodeInput('')
      
      // Add to items
      const existingItemIndex = items.findIndex(item => item.productId === product.id)
      if (existingItemIndex >= 0) {
        // Update quantity if product already exists
        const updatedItems = [...items]
        updatedItems[existingItemIndex].quantity += 1
        form.setValue('items', updatedItems)
      } else {
        // Add new item
        const newItem: CreateSaleItemDto = {
          productId: product.id,
          barcode: product.barcode,
          productName: product.name,
          quantity: 1,
          priceAtSale: product.price,
        }
        form.setValue('items', [...items, newItem])
      }
    } catch (error: any) {
      toast({
        title: 'Product not found',
        description: `No product found with barcode: ${barcodeInput}`,
        type: 'error'
      })
    }
  }

  const handleUpdateQuantity = (index: number, delta: number) => {
    const updatedItems = [...items]
    const newQuantity = updatedItems[index].quantity + delta
    if (newQuantity >= 1) {
      updatedItems[index].quantity = newQuantity
      form.setValue('items', updatedItems)
    }
  }

  const handleRemoveItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index)
    form.setValue('items', updatedItems)
  }

  const handleSubmit = async (values: CreateSaleFormValues) => {
    try {
      await onSubmit(values as CreateSaleWithPaymentDto)
      form.reset()
      setSelectedProduct(null)
    } catch (error) {
      // Error handled by parent
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Sale
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Barcode Scanner */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-3">Scan Products</h4>
              <div className="flex gap-3">
                <Input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBarcodeScan()}
                  placeholder="Scan barcode or enter barcode number..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleBarcodeScan}
                  disabled={!barcodeInput.trim()}
                  variant="outline"
                >
                  Scan
                </Button>
              </div>
              {selectedProduct && (
                <div className="mt-3 p-2 bg-green-50 rounded flex items-center gap-3">
                  <Package className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <div className="font-medium">{selectedProduct.name}</div>
                    <div className="text-sm text-gray-600">
                      Barcode: {selectedProduct.barcode} | Price: ${selectedProduct.price.toFixed(2)}
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    Scanned
                  </Badge>
                </div>
              )}
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <h4 className="font-semibold">Sale Items ({items.length})</h4>
              {items.length === 0 ? (
                <div className="text-center py-6 text-gray-500 border-2 border-dashed rounded-lg">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No items added yet</p>
                  <p className="text-sm">Scan products to add them to the sale</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {items.map((item, index) => (
                    <div key={index} className="p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-sm text-gray-600">
                            Barcode: {item.barcode} | ${item.priceAtSale.toFixed(2)} each
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 bg-white border rounded-lg">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUpdateQuantity(index, -1)}
                              className="h-7 w-7"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-bold">{item.quantity}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUpdateQuantity(index, 1)}
                              className="h-7 w-7"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="font-bold min-w-20 text-right">
                            ${(item.quantity * item.priceAtSale).toFixed(2)}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(index)}
                            className="h-7 w-7 text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={field.value === 'Cash' ? 'default' : 'outline'}
                      onClick={() => field.onChange('Cash')}
                      className="flex-col h-auto py-3"
                    >
                      <DollarSign className="h-4 w-4 mb-1" />
                      <span className="text-xs">Cash</span>
                    </Button>
                    <Button
                      type="button"
                      variant={field.value === 'Card' ? 'default' : 'outline'}
                      onClick={() => field.onChange('Card')}
                      className="flex-col h-auto py-3"
                    >
                      <CreditCard className="h-4 w-4 mb-1" />
                      <span className="text-xs">Card</span>
                    </Button>
                    <Button
                      type="button"
                      variant={field.value === 'Other' ? 'default' : 'outline'}
                      onClick={() => field.onChange('Other')}
                      className="flex-col h-auto py-3"
                    >
                      <span className="text-xs">Other</span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Summary */}
            {items.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-600">Total Items</div>
                    <div className="text-2xl font-bold">{items.length}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Quantity</div>
                    <div className="text-2xl font-bold">
                      {items.reduce((sum, item) => sum + item.quantity, 0)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Total Amount</div>
                    <div className="text-3xl font-bold text-green-600">
                      ${totalAmount.toFixed(2)}
                    </div>
                  </div>
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
                disabled={isLoading || items.length === 0}
                className="bg-gradient-to-r from-green-500 to-emerald-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  `Complete Sale ($${totalAmount.toFixed(2)})`
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}