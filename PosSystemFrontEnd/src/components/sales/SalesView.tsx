import { useState, useEffect } from 'react'
import type { Sale, SaleWithItems, SaleTotalSummary } from '@/types/sales'
import { salesService } from '@/services/sales.service'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Filter, RefreshCw, Receipt, Plus, Calendar, DollarSign } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { SalesTable } from './SalesTable'
import { SaleDetailsModal } from './SaleDetailsModal'
import { CreateSaleModal } from './CreateSaleModal'
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
import { Badge } from '@/components/ui/badge'

export function SalesView() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [sales, setSales] = useState<Sale[]>([])
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'Cash' | 'Card' | 'Other'>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [summary, setSummary] = useState<SaleTotalSummary | null>(null)
  
  // Modal states
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<SaleWithItems | null>(null)
  
  // Delete confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [saleToDelete, setSaleToDelete] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load sales and summary
  const loadSales = async () => {
    setIsLoading(true)
    try {
      const [salesData, summaryData] = await Promise.all([
        salesService.getAllSales(),
        salesService.getTotalSalesAmount()
      ])
      setSales(salesData)
      setSummary(summaryData)
    } catch (error: any) {
      toast({
        title: 'Failed to load sales',
        description: error.message,
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSales()
  }, [])

  // Apply filters
  useEffect(() => {
    let result = sales
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(sale =>
        sale.id.toString().includes(term) ||
        sale.userName?.toLowerCase().includes(term) ||
        sale.paymentMethod.toLowerCase().includes(term)
      )
    }
    
    // Apply payment filter
    if (paymentFilter !== 'all') {
      result = result.filter(sale => sale.paymentMethod === paymentFilter)
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      result = result.filter(sale => {
        const saleDate = new Date(sale.createdAt)
        if (dateFilter === 'today') {
          return saleDate.toDateString() === now.toDateString()
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return saleDate >= weekAgo
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          return saleDate >= monthAgo
        }
        return true
      })
    }
    
    setFilteredSales(result)
  }, [sales, searchTerm, paymentFilter, dateFilter])

  const handleViewDetails = async (sale: Sale) => {
    try {
      const saleWithItems = await salesService.getSaleWithItems(sale.id)
      setSelectedSale(saleWithItems)
      setIsDetailsModalOpen(true)
    } catch (error: any) {
      toast({
        title: 'Failed to load sale details',
        description: error.message,
        type: 'error'
      })
    }
  }

  const handleCreateSale = async (saleData: any) => {
    setIsSubmitting(true)
    try {
      const newSale = await salesService.createSaleWithPayment(saleData)
      setSales(prev => [newSale, ...prev])
      toast({
        title: 'Sale created',
        description: `Sale #${newSale.id} has been created successfully`,
        type: 'success'
      })
      setIsCreateModalOpen(false)
    } catch (error: any) {
      toast({
        title: 'Failed to create sale',
        description: error.message,
        type: 'error'
      })
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteSale = async () => {
    if (!saleToDelete) return
    
    try {
      await salesService.deleteSale(saleToDelete)
      setSales(prev => prev.filter(s => s.id !== saleToDelete))
      toast({
        title: 'Sale deleted',
        description: 'Sale has been deleted successfully',
        type: 'success'
      })
    } catch (error: any) {
      toast({
        title: 'Failed to delete sale',
        description: error.message,
        type: 'error'
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setSaleToDelete(null)
    }
  }

  const handleDeleteClick = (id: number) => {
    setSaleToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const getDateFilterText = () => {
    switch (dateFilter) {
      case 'today': return 'Today'
      case 'week': return 'This Week'
      case 'month': return 'This Month'
      default: return 'All Time'
    }
  }

  const isAdmin = user?.role.toLowerCase() === 'admin'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Sales Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage sales transactions and receipts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={loadSales}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Sale
          </Button>
        </div>
      </div>

      {/* Sales Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Sales</p>
                  <h3 className="text-2xl font-bold mt-2">{summary.totalCount}</h3>
                  <p className="text-sm text-gray-500 mt-2">All transactions</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <h3 className="text-2xl font-bold mt-2">
                    ${summary.totalAmount ? summary.totalAmount.toFixed(2) : 0}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2">Gross amount</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Average Sale</p>
                  <h3 className="text-2xl font-bold mt-2">
                    ${summary.averageAmount ? summary.averageAmount.toFixed(2) : 0}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2">Per transaction</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Showing</p>
                  <h3 className="text-2xl font-bold mt-2">{filteredSales.length}</h3>
                  <p className="text-sm text-gray-500 mt-2">Sales ({getDateFilterText()})</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Filter className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search sales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={paymentFilter} onValueChange={(value: any) => setPaymentFilter(value)}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Payment Method" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <SelectValue placeholder="Date Range" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-500 flex items-center justify-center">
              <Badge variant="outline" className="text-xs">
                {filteredSales.length} sales found
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="mt-2 text-gray-600">Loading sales...</p>
            </div>
          ) : sales.length === 0 ? (
            <div className="py-12 text-center">
              <div className="h-16 w-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Receipt className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No sales found
              </h3>
              <p className="text-gray-600 mb-6">
                Start by creating your first sale transaction
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Sale
              </Button>
            </div>
          ) : (
            <SalesTable
              sales={filteredSales}
              onViewDetails={handleViewDetails}
              onDelete={handleDeleteClick}
              isAdmin={isAdmin}
            />
          )}
        </CardContent>
      </Card>

      {/* Sale Details Modal */}
      {selectedSale && (
        <SaleDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          sale={selectedSale}
        />
      )}

      {/* Create Sale Modal */}
      <CreateSaleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSale}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the sale
              record and all associated items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSale}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Sale
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}