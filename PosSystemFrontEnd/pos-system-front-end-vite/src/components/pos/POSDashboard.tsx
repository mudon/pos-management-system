import React, { useState, useRef, useEffect } from 'react'
import { ShoppingCart, Package, Search, Plus, Minus, Trash2, CreditCard, DollarSign, Printer, X, Zap, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast-hook'
import { posService } from '@/services/pos.service'
import type { Product, CartItem, Receipt, Category, DashboardStats } from '@/types/pos'

export default function POSDashboard() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [barcodeInput, setBarcodeInput] = useState('')
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastReceipt, setLastReceipt] = useState<Receipt | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    todaySales: 0,
    transactionsToday: 0,
    lowStockItems: 0,
    totalAmount: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const barcodeRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Fetch data on mount
  useEffect(() => {
    fetchData()
    barcodeRef.current?.focus()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [productsData, categoriesData, statsData] = await Promise.all([
        posService.getProducts(),
        posService.getCategories(),
        posService.getDashboardStats()
      ])
      setProducts(productsData)
      setCategories(categoriesData)
      setDashboardStats(statsData)
    } catch (error) {
      toast({
        title: 'Error loading data',
        description: 'Failed to fetch products and categories',
        type: 'error'
      })
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.includes(searchTerm)
    const matchesCategory = selectedCategory === 'All' || 
                          categories.find(cat => cat.id === product.categoryId)?.name === selectedCategory
    return matchesSearch && matchesCategory && product.isActive
  })

  // Add product to cart
  const addToCart = async (product: Product) => {
    // Check stock availability
    try {
      const stockCheck = await posService.checkStock(product.id, 1)
      if (!stockCheck.available) {
        toast({
          title: 'Out of stock',
          description: `${product.name} has insufficient stock (${stockCheck.currentStock} available)`,
          type: 'error'
        })
        return
      }
    } catch (error) {
      console.error('Error checking stock:', error)
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
    setBarcodeInput('')
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to cart`,
      type: 'success'
    })
    barcodeRef.current?.focus()
  }

  // Handle barcode scan
  const handleBarcodeSubmit = async () => {
    if (!barcodeInput.trim()) return

    try {
      const product = await posService.getProductByBarcode(barcodeInput)
      if (product) {
        addToCart(product)
      } else {
        toast({
          title: 'Product not found',
          description: `No product found with barcode: ${barcodeInput}`,
          type: 'error'
        })
        setBarcodeInput('')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to scan barcode',
        type: 'error'
      })
      setBarcodeInput('')
    }
  }

  // Handle barcode key press
  const handleBarcodeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBarcodeSubmit()
    }
  }

  // Update quantity
  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev =>
      prev
        .map(item =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter(item => item.quantity > 0)
    )
  }

  // Remove item
  const removeItem = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId))
    toast({
      title: 'Item removed',
      description: 'Item has been removed from cart',
      type: 'warning'
    })
  }

  // Clear cart
  const clearCart = () => {
    setCart([])
    toast({
      title: 'Cart cleared',
      description: 'All items have been removed from cart',
      type: 'info'
    })
  }

  // Calculate totals
  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  }

  const calculateTotal = () => {
    return calculateSubtotal() 
  }

  // Generate transaction ID
  const generateTransactionId = () => {
    return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Process payment
  const processPayment = async (method: string) => {
    try {
      const transactionId = generateTransactionId()
      const total = calculateTotal()

      console.log("result", total);

      
      // Create sale with payment data matching server format
      const paymentData = {
        paymentMethod: method,
        paymentAmount: total,
        transactionId: transactionId,
        notes: `POS transaction ${new Date().toLocaleString()}`,
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          priceAtSale: item.product.price
        }))
      }

      const result: any = await posService.createSaleWithPayment(paymentData)
      
      // Update stock for each product
      for (const item of cart) {
        await posService.updateStock(item.product.id, { adjust: -item.quantity })
      }
      
      // Create receipt
      const receipt: Receipt = {
        id: result.saleId,
        date: new Date().toLocaleString(),
        items: [...cart],
        paymentMethod: method,
        subtotal: calculateSubtotal(),
        tax: 0,
        total: total,
        transactionId: transactionId
      }

      setLastReceipt(receipt)
      setShowReceipt(true)
      setCart([])
      console.log("111111111111111???????");
      
      // Refresh dashboard stats
      const stats = await posService.getDashboardStats()
      setDashboardStats(stats)
      console.log("222222222222222222222222???????");
      
      toast({
        title: 'Payment successful',
        description: `$${total.toFixed(2)} processed via ${method}`,
        type: 'success'
      })
    } catch (error) {
      console.error('Payment error:', error)
      toast({
        title: 'Payment failed',
        description: 'Failed to process payment. Please try again.',
        type: 'error'
      })
    }
  }

  // Print receipt
  const printReceipt = () => {
    const printContent = document.getElementById('receipt-content')
    if (printContent) {
      const originalContents = document.body.innerHTML
      document.body.innerHTML = printContent.innerHTML
      window.print()
      document.body.innerHTML = originalContents
      window.location.reload()
    }
  }

  const subtotal = calculateSubtotal()
  const tax = 0
  const total = calculateTotal()

  const categoryNames = ['All', ...categories.map(cat => cat.name)]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading POS system...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today's Sales</p>
                <p className="text-2xl font-bold">${dashboardStats.todaySales.toFixed(2)}</p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Transactions</p>
                <p className="text-2xl font-bold">{dashboardStats.transactionsToday}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cart Items</p>
                <p className="text-2xl font-bold">{cart.length}</p>
              </div>
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Low Stock</p>
                <p className="text-2xl font-bold">{dashboardStats.lowStockItems}</p>
              </div>
              <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main POS Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Barcode Scanner & Search */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      ref={barcodeRef}
                      type="text"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      onKeyDown={handleBarcodeKeyPress}
                      placeholder="Scan barcode or search products..."
                      className="pl-10 h-12 text-lg"
                    />
                  </div>
                  <Button
                    onClick={handleBarcodeSubmit}
                    className="h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Search products by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon">
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                  {categoryNames.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map(product => {
                  const categoryName = categories.find(cat => cat.id === product.categoryId)?.name || 'Uncategorized'
                  return (
                    <Card
                      key={product.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => addToCart(product)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                              <p className="text-sm text-gray-500">{categoryName}</p>
                            </div>
                            <Badge
                              variant={product.stock > 30 ? "default" : product.stock > 10 ? "secondary" : "destructive"}
                              className="bg-opacity-20"
                            >
                              {product.stock} left
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-blue-600">
                                ${product.price.toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500">Tax: {product.taxRate}%</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                addToCart(product)
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shopping Cart */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Shopping Cart
                  <Badge variant="secondary">{cart.length} items</Badge>
                </CardTitle>
                {cart.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-600"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Your cart is empty</p>
                    <p className="text-sm">Add products to get started</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.product.name}</h4>
                        <p className="text-sm text-gray-500">
                          ${item.product.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="h-8 w-8"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-bold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="h-8 w-8"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.product.id)}
                          className="h-8 w-8 text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Totals */}
              {cart.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-semibold">${tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-blue-600">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payment Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <Button
                      onClick={() => processPayment('Cash')}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Cash
                    </Button>
                    <Button
                      onClick={() => processPayment('Card')}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Card
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Receipt Modal */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Receipt</DialogTitle>
          </DialogHeader>
          
          {lastReceipt && (
            <div id="receipt-content" className="p-6 space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
                  <Printer className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold">RECEIPT</h3>
                <p className="text-gray-500">#{lastReceipt.id}</p>
                <p className="text-sm text-gray-500">{lastReceipt.date}</p>
                {lastReceipt.transactionId && (
                  <p className="text-xs text-gray-500 mt-1">Transaction: {lastReceipt.transactionId}</p>
                )}
              </div>

              <div className="space-y-3">
                {lastReceipt.items.map(item => (
                  <div key={item.product.id} className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} × ${item.product.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-bold">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${lastReceipt.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${lastReceipt.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">${lastReceipt.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Payment Method</span>
                  <span>{lastReceipt.paymentMethod}</span>
                </div>
              </div>

              <div className="pt-4 border-t text-center">
                <p className="text-sm text-gray-500">Thank you for your purchase!</p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={printReceipt}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowReceipt(false)}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}