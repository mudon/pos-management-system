import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { Product, CreateProductDto } from '@/types/product'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Check, X, Barcode, Package } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/hooks/useAuth'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const productSchema = z.object({
  barcode: z.string()
    .min(3, 'Barcode must be at least 3 characters')
    .max(32, 'Barcode must be less than 32 characters'),
  name: z.string()
    .min(2, 'Product name must be at least 2 characters')
    .max(100, 'Product name must be less than 100 characters'),
  categoryId: z.number().nullable(),
  price: z.number()
    .min(0.01, 'Price must be greater than 0')
    .max(999999.99, 'Price is too high'),
  taxRate: z.number()
    .min(0, 'Tax rate must be at least 0')
    .max(100, 'Tax rate must be at most 100')
    .default(0),
  initialStock: z.number()
    .min(0, 'Stock must be at least 0')
    .default(0),
  isActive: z.boolean().default(true),
})

type ProductFormValues = z.input<typeof productSchema>

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  onSubmit: (data: CreateProductDto) => Promise<Product | undefined>
  isLoading: boolean
  onCheckBarcode: (barcode: string) => Promise<boolean>
}

// Mock categories for development - in real app, fetch from API
const mockCategories = [
  { id: 1, name: 'Beverages' },
  { id: 2, name: 'Snacks' },
  { id: 3, name: 'Dairy' },
  { id: 4, name: 'Bakery' },
]

export function ProductModal({
  isOpen,
  onClose,
  product,
  onSubmit,
  isLoading,
  onCheckBarcode,
}: ProductModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [barcodeExists, setBarcodeExists] = useState(false)
  const [checkingBarcode, setCheckingBarcode] = useState(false)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      barcode: '',
      name: '',
      categoryId: null,
      price: 0,
      taxRate: 0,
      initialStock: 0,
      isActive: true,
    },
  })

  const barcodeValue = form.watch('barcode')
  const isAdmin = user?.role.toLowerCase() === 'admin'

  // Check barcode availability
  useEffect(() => {
    const checkBarcode = async () => {
      if (barcodeValue && barcodeValue.length >= 3 && barcodeValue !== product?.barcode) {
        setCheckingBarcode(true)
        try {
          const exists = await onCheckBarcode(barcodeValue)
          setBarcodeExists(exists)
        } catch (error) {
          console.error('Error checking barcode:', error)
        } finally {
          setCheckingBarcode(false)
        }
      } else {
        setBarcodeExists(false)
      }
    }

    const timeoutId = setTimeout(checkBarcode, 500)
    return () => clearTimeout(timeoutId)
  }, [barcodeValue, product?.barcode, onCheckBarcode])

  // Reset form when modal opens/closes or product changes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        barcode: product?.barcode || '',
        name: product?.name || '',
        categoryId: product?.categoryId || null,
        price: product?.price || 0,
        taxRate: product?.taxRate || 0,
        initialStock: product?.initialStock || 0,
        isActive: product?.isActive ?? true,
      })
      setBarcodeExists(false)
    }
  }, [isOpen, product, form])

  const handleSubmit = async (values: ProductFormValues) => {
    if (barcodeExists && values.barcode !== product?.barcode) {
      toast({
        title: 'Barcode exists',
        description: 'This barcode is already in use',
        type: 'error'
      })
      return
    }

    try {
      await onSubmit(values as CreateProductDto)
      form.reset()
      onClose()
    } catch (error) {
      // Error handled by parent
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Edit Product' : 'Create New Product'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Barcode className="h-4 w-4" />
                    Barcode
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="e.g., 1234567890123"
                        className="pr-10 font-mono"
                        disabled={isLoading}
                        {...field}
                      />
                      {field.value && field.value.length >= 3 && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {checkingBarcode ? (
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                          ) : barcodeExists ? (
                            <X className="h-4 w-4 text-red-500" />
                          ) : (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                  {barcodeValue && barcodeValue.length >= 3 && !checkingBarcode && (
                    <p className={`text-xs ${barcodeExists ? 'text-red-600' : 'text-green-600'}`}>
                      {barcodeExists ? 'Barcode already exists' : 'Barcode is available'}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Product Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Coca Cola 330ml"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        disabled={isLoading}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taxRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        placeholder="0"
                        disabled={isLoading}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={field.value?.toString() || ''}
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Uncategorized</SelectItem>
                        {mockCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="initialStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Stock</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        disabled={isLoading}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {product && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600">Current Stock:</span>
                  <span className="font-medium">{product.currentStock || 0}</span>
                </div>
                {product.updatedAt && (
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium">
                      {new Date(product.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
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
                disabled={isLoading || barcodeExists}
                className="bg-gradient-to-r from-blue-500 to-purple-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {product ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  product ? 'Update Product' : 'Create Product'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}