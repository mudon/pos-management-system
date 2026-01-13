import { useState, useEffect } from 'react'
import type { InventoryItem } from '@/types/inventory'
import { inventoryService } from '@/services/inventory.service'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Filter, RefreshCw, AlertTriangle, Package, Barcode } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { InventoryTable } from './InventoryTable'
import { AdjustStockModal } from './AdjustStockModal'
import { UpdateStockModal } from './UpdateStockModal'
import { CheckStockModal } from './CheckStockModal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import helper from '@/lib/helpers'

export function InventoryView() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'low' | 'out' | 'inactive'>('all')
  const [barcodeInput, setBarcodeInput] = useState('')
  
  // Modal states
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  // Load inventory
  const loadInventory = async () => {
    setIsLoading(true)
    try {
      const inventoryData = await inventoryService.getAllInventory()
      setInventory(inventoryData)
    } catch (error: any) {
      toast({
        title: 'Failed to load inventory',
        description: error.message,
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadInventory()
  }, [])

  // Apply filters
  useEffect(() => {
    let result = inventory
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(item =>
        item.productName?.toLowerCase().includes(term) ||
        item.barcode?.includes(term) ||
        item.categoryName?.toLowerCase().includes(term)
      )
    }
    
    // Apply type filter
    if (filterType === 'low') {
      result = result.filter(item => 
        item.minStock !== undefined && item.quantity <= item.minStock
      )
    } else if (filterType === 'out') {
      result = result.filter(item => item.quantity === 0)
    } else if (filterType === 'inactive') {
      result = result.filter(item => item.isActive === false)
    }
    
    setFilteredInventory(result)
  }, [inventory, searchTerm, filterType])

  // Search by barcode
  const handleBarcodeSearch = async () => {
    if (!barcodeInput.trim()) {
      toast({
        title: 'Enter barcode',
        description: 'Please enter a barcode to search',
        type: 'warning'
      })
      return
    }

    try {
      const item = await inventoryService.getInventoryByBarcode(barcodeInput)
      setSelectedItem(item)
      setBarcodeInput('')
      
      toast({
        title: 'Item found',
        description: `${item.productName} - Stock: ${item.quantity}`,
        type: 'success'
      })
    } catch (error: any) {
      toast({
        title: 'Item not found',
        description: `No inventory found with barcode: ${barcodeInput}`,
        type: 'error'
      })
    }
  }

  const handleAdjustStock = (item: InventoryItem) => {
    setSelectedItem(item)
    setIsAdjustModalOpen(true)
  }

  const handleUpdateStock = (item: InventoryItem) => {
    setSelectedItem(item)
    setIsUpdateModalOpen(true)
  }

  const handleCheckStock = (item: InventoryItem) => {
    setSelectedItem(item)
    setIsCheckModalOpen(true)
  }

  const handleUpdateStockComplete = async (item: InventoryItem) => {
    try {
      // Refresh the inventory list
      await loadInventory()
      
      toast({
        title: 'Stock updated',
        description: `${item.productName} stock has been updated`,
        type: 'success'
      })
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message,
        type: 'error'
      })
    }
  }

  const handleAdjustStockComplete = async (item: InventoryItem) => {
    try {
      // Refresh the inventory list
      await loadInventory()
      
      toast({
        title: 'Stock adjusted',
        description: `${item.productName} stock has been adjusted`,
        type: 'success'
      })
    } catch (error: any) {
      toast({
        title: 'Adjustment failed',
        description: error.message,
        type: 'error'
      })
    }
  }

  const isPermit = helper.hasPermission( user?.role.toLowerCase() as 'admin' | 'cashier' );

  const getLowStockCount = () => {
    return inventory.filter(item => 
      item.minStock !== undefined && item.quantity <= item.minStock
    ).length
  }

  const getOutOfStockCount = () => {
    return inventory.filter(item => item.quantity === 0).length
  }

  const getTotalStockValue = () => {
    return inventory.reduce((total, item) => {
      return total + (item.quantity * (item.price || 0))
    }, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Inventory Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor and manage product stock levels
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={loadInventory}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Barcode Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBarcodeSearch()}
                placeholder="Enter barcode to search inventory..."
                className="pl-10"
              />
            </div>
            <Button
              onClick={handleBarcodeSearch}
              disabled={!barcodeInput.trim()}
              variant="outline"
            >
              <Search className="h-4 w-4 mr-2" />
              Search Barcode
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
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
                <SelectItem value="inactive">Inactive Items</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-500">
              Showing {filteredInventory.length} of {inventory.length} items
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Inventory</CardTitle>
            {getLowStockCount() > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {getLowStockCount()} items low on stock
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="mt-2 text-gray-600">Loading inventory...</p>
            </div>
          ) : inventory.length === 0 ? (
            <div className="py-12 text-center">
              <div className="h-16 w-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No inventory found
              </h3>
              <p className="text-gray-600 mb-6">
                Inventory will appear after products are created
              </p>
            </div>
          ) : (
            <InventoryTable
              items={filteredInventory}
              onAdjustStock={handleAdjustStock}
              onUpdateStock={handleUpdateStock}
              onCheckStock={handleCheckStock}
              isPermit={isPermit}
            />
          )}
        </CardContent>
      </Card>

      {/* Adjust Stock Modal */}
      {selectedItem && (
        <AdjustStockModal
          isOpen={isAdjustModalOpen}
          onClose={() => setIsAdjustModalOpen(false)}
          item={selectedItem}
          onAdjustStock={handleAdjustStockComplete}
          isLoading={false}
        />
      )}

      {/* Update Stock Modal */}
      {selectedItem && (
        <UpdateStockModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          item={selectedItem}
          onUpdateStock={handleUpdateStockComplete}
          isLoading={false}
        />
      )}

      {/* Check Stock Modal */}
      {selectedItem && (
        <CheckStockModal
          isOpen={isCheckModalOpen}
          onClose={() => setIsCheckModalOpen(false)}
          item={selectedItem}
          onCheckStock={inventoryService.checkStockAvailability}
          isLoading={false}
        />
      )}
    </div>
  )
}