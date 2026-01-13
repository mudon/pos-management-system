import { useState, useEffect } from 'react'
import type { Product, CreateProductDto } from '@/types/product'
import { productService } from '@/services/product.service'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Search, Filter, RefreshCw, Barcode, Package } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { ProductTable } from './ProductTable'
import { ProductModal } from './ProductModal'
import { StockModal } from './StockModal'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import helper from '@/lib/helpers'

export function ProductsView() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [barcodeInput, setBarcodeInput] = useState('')
  
  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isStockModalOpen, setIsStockModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  
  // Delete confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load products
  const loadProducts = async () => {
    setIsLoading(true)
    try {
      const productsData = await productService.getAllProducts()
      setProducts(productsData)
    } catch (error: any) {
      toast({
        title: 'Failed to load products',
        description: error.message,
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  // Apply filters
  useEffect(() => {
    let result = products
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.barcode.includes(term) ||
        product.categoryName?.toLowerCase().includes(term)
      )
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(product =>
        statusFilter === 'active' ? product.isActive : !product.isActive
      )
    }
    
    setFilteredProducts(result)
  }, [products, searchTerm, statusFilter])

  // Scan barcode
  const handleScanBarcode = async () => {
    if (!barcodeInput.trim()) {
      toast({
        title: 'Enter barcode',
        description: 'Please enter a barcode to scan',
        type: 'warning'
      })
      return
    }

    try {
      const product = await productService.scanBarcode({ barcode: barcodeInput })
      setSelectedProduct(product)
      setIsProductModalOpen(true)
      setBarcodeInput('')
    } catch (error: any) {
      toast({
        title: 'Product not found',
        description: `No product found with barcode: ${barcodeInput}`,
        type: 'error'
      })
    }
  }

  const handleCreateProduct = async (data: CreateProductDto) => {
    setIsSubmitting(true)
    try {
      const newProduct = await productService.createProduct(data)
      setProducts(prev => [...prev, newProduct])
      toast({
        title: 'Product created',
        description: `${newProduct.name} has been created successfully`,
        type: 'success'
      })
      return newProduct
    } catch (error: any) {
      toast({
        title: 'Failed to create product',
        description: error.message,
        type: 'error'
      })
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateProduct = async (data: CreateProductDto) => {
    if (!selectedProduct) return
    
    setIsSubmitting(true)
    try {
      const updatedProduct = await productService.updateProduct(selectedProduct.id, data)
      setProducts(prev => prev.map(p => 
        p.id === selectedProduct.id ? updatedProduct : p
      ))
      toast({
        title: 'Product updated',
        description: `${updatedProduct.name} has been updated successfully`,
        type: 'success'
      })
      return updatedProduct
    } catch (error: any) {
      toast({
        title: 'Failed to update product',
        description: error.message,
        type: 'error'
      })
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!productToDelete) return
    
    try {
      await productService.deleteProduct(productToDelete)
      setProducts(prev => prev.filter(p => p.id !== productToDelete))
      toast({
        title: 'Product deleted',
        description: 'Product has been deleted successfully',
        type: 'success'
      })
    } catch (error: any) {
      toast({
        title: 'Failed to delete product',
        description: error.message,
        type: 'error'
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  const handleToggleStatus = async (id: number) => {
    try {
      const updatedProduct = await productService.toggleProductStatus(id)
      setProducts(prev => prev.map(p => 
        p.id === id ? updatedProduct : p
      ))
      toast({
        title: 'Status updated',
        description: `${updatedProduct.name} is now ${updatedProduct.isActive ? 'active' : 'inactive'}`,
        type: 'success'
      })
    } catch (error: any) {
      toast({
        title: 'Failed to update status',
        description: error.message,
        type: 'error'
      })
    }
  }

  const handleUpdateStock = async (id: number, stock: number, reason?: string) => {
    try {
      const updatedProduct = await productService.updateStock(id, { stock, reason })
      setProducts(prev => prev.map(p => 
        p.id === id ? updatedProduct : p
      ))
      toast({
        title: 'Stock updated',
        description: `Stock for ${updatedProduct.name} updated to ${stock}`,
        type: 'success'
      })
    } catch (error: any) {
      toast({
        title: 'Failed to update stock',
        description: error.message,
        type: 'error'
      })
      throw error
    }
  }

  const handleCheckBarcode = async (barcode: string): Promise<boolean> => {
    try {
      return await productService.checkBarcodeExists(barcode)
    } catch (error) {
      return false
    }
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsProductModalOpen(true)
  }

  const handleDeleteClick = (id: number) => {
    setProductToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleStockClick = (product: Product) => {
    setSelectedProduct(product)
    setIsStockModalOpen(true)
  }

  const isAdmin = user?.role.toLowerCase() === 'admin'
  const isPermit = helper.hasPermission( user?.role.toLowerCase() as 'admin' | 'cashier' );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Product Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your products, stock, and pricing
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={loadProducts}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {
            isAdmin && 
            <Button
              onClick={() => {
                setSelectedProduct(null)
                setIsProductModalOpen(true)
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          }
        </div>
      </div>

      {/* Barcode Scanner */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScanBarcode()}
                placeholder="Scan barcode or enter barcode number..."
                className="pl-10"
              />
            </div>
            <Button
              onClick={handleScanBarcode}
              disabled={!barcodeInput.trim()}
              variant="outline"
            >
              <Search className="h-4 w-4 mr-2" />
              Scan Barcode
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-500">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="mt-2 text-gray-600">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center">
              <div className="h-16 w-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first product
              </p>
              <Button
                onClick={() => setIsProductModalOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Product
              </Button>
            </div>
          ) : (
            <ProductTable
              products={filteredProducts}
              onEdit={handleEditProduct}
              onDelete={handleDeleteClick}
              onToggleStatus={handleToggleStatus}
              onUpdateStock={handleStockClick}
              isAdmin={isAdmin}
            />
          )}
        </CardContent>
      </Card>

      {/* Product Create/Edit Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={selectedProduct}
        onSubmit={selectedProduct ? handleUpdateProduct : handleCreateProduct}
        isLoading={isSubmitting}
        onCheckBarcode={handleCheckBarcode}
      />

      {/* Stock Update Modal */}
      {selectedProduct && (
        <StockModal
          isOpen={isStockModalOpen}
          onClose={() => setIsStockModalOpen(false)}
          product={selectedProduct}
          onUpdateStock={handleUpdateStock}
          isLoading={isSubmitting}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}