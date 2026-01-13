import React, { useState, useEffect } from 'react'
import { reportsService } from '@/services/reports.service'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  RefreshCw, 
  TrendingUp, 
  Package, 
  DollarSign, 
  BarChart3, 
  AlertTriangle,
  Calendar,
  Download,
  Printer,
  Filter,
  Search,
  FileText,
  Layers,
  CreditCard,
  CheckCircle,
  XCircle,
  Eye,
  TrendingDown,
  Activity
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { DateRangePicker } from './DateRangePicker'
import { SalesReportChart } from './SalesReportChart'
import { DateTime } from "luxon"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'

const timeZone = "Asia/Singapore"

export function ReportsView() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('sales')
  const [dateRange, setDateRange] = useState({
    endDate: DateTime.now().setZone(timeZone).endOf('day').toUTC().toISO() || '',
    startDate: DateTime.now().setZone(timeZone).minus({ days: 30 }).startOf('day').toUTC().toISO() || ''
  })
  
  // Sales data states
  const [dailySales, setDailySales] = useState<any[]>([])
  const [salesSummary, setSalesSummary] = useState<{ totalAmount: number, totalCount: number } | null>(null)
  
  // Inventory data states
  const [inventoryItems, setInventoryItems] = useState<any[]>([])
  const [lowStockItems, setLowStockItems] = useState<any[]>([])
  const [inventorySearch, setInventorySearch] = useState({
    category: '',
    minStock: '',
    maxStock: ''
  })
  
  // Payment data states
  const [paymentTotal, setPaymentTotal] = useState<number>(0)
  const [paymentHistory, setPaymentHistory] = useState<any[]>([])
  const [paymentMethodsData, setPaymentMethodsData] = useState<any[]>([]) // For visualization
  
  // Sales search filters
  const [salesFilters, setSalesFilters] = useState({
    paymentMethod: '',
    category: '',
    minAmount: '',
    maxAmount: ''
  })

  // Helper function to format date for display (removes time part)
  const formatDateForDisplay = (isoDate: string) => {
    return DateTime.fromISO(isoDate).toFormat('yyyy-MM-dd')
  }

  // Helper function to get display date range
  const getDisplayDateRange = () => {
    const startDisplay = formatDateForDisplay(dateRange.startDate)
    const endDisplay = formatDateForDisplay(dateRange.endDate)
    return { startDisplay, endDisplay }
  }

  // Mock payment methods data for visualization
  const mockPaymentMethods = [
    { method: 'Cash', amount: 2450.50, count: 125, percentage: 45 },
    { method: 'Card', amount: 1890.25, count: 85, percentage: 35 },
    { method: 'Mobile', amount: 980.75, count: 32, percentage: 15 },
    { method: 'Online', amount: 450.40, count: 18, percentage: 5 }
  ]

  // Load initial reports
  const loadInitialReports = async () => {
    setIsLoading(true)
    try {
      const [dailyData, summaryData, paymentsData, lowStockData] = await Promise.all([
        reportsService.getSalesByDateRange({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }),
        reportsService.getTotalSalesAmount(),
        reportsService.getPaymentSummary(),
        reportsService.getLowStockItems()
      ])
      
      setDailySales(dailyData || [])
      setSalesSummary(summaryData)
      setPaymentTotal(paymentsData?.totalAmount || 0)
      setLowStockItems(lowStockItems || [])
      
      // Use mock data for payment methods visualization
      const mockDataWithTotal = mockPaymentMethods.map(item => ({
        ...item,
        amount: (paymentsData?.totalAmount || 0) * (item.percentage / 100)
      }))
      setPaymentMethodsData(mockDataWithTotal)
      
      // Load full inventory for inventory tab
      try {
        const inventoryData = await reportsService.getAllInventory()
        setInventoryItems(inventoryData || [])
      } catch (error) {
        console.log('Inventory data not available')
      }
      
      // Load payment history
      await loadPaymentHistory()
      
    } catch (error: any) {
      toast({
        title: 'Failed to load reports',
        description: error.message,
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load payment history
  const loadPaymentHistory = async () => {
    try {
      const paymentHistoryData = await reportsService.getPaymentsByDateRange({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      })
      setPaymentHistory(paymentHistoryData || [])
    } catch (error) {
      console.log('Payment history not available')
    }
  }

  useEffect(() => {
    loadInitialReports()
  }, [])

  const handleDateRangeChange = async (start: string, end: string) => {
    // Convert the date strings from yyyy-MM-dd to full ISO format with Singapore timezone
    const startDateISO = DateTime.fromISO(start, { zone: timeZone })
      .startOf('day')
      .toUTC()
      .toISO();
    
    const endDateISO = DateTime.fromISO(end, { zone: timeZone })
      .endOf('day')
      .toUTC()
      .toISO();
    
    setDateRange({ 
      startDate: startDateISO || start, 
      endDate: endDateISO || end 
    })
  }

  const handleApplyFilters = async () => {
    setIsLoading(true)
    try {
      // Load sales data for new date range
      const salesData = await reportsService.getSalesByDateRange({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      })
      setDailySales(salesData || [])
      
      // Load payment history for new date range
      await loadPaymentHistory()
      
      // Reload payment summary
      const paymentsData = await reportsService.getPaymentSummary()
      setPaymentTotal(paymentsData?.totalAmount || 0)
      
      const { startDisplay, endDisplay } = getDisplayDateRange()
      
      toast({
        title: 'Filters Applied',
        description: `Showing data from ${startDisplay} to ${endDisplay}`,
        type: 'success'
      })
    } catch (error: any) {
      toast({
        title: 'Failed to apply filters',
        description: error.message,
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle sales search
  const handleSalesSearch = async () => {
    setIsLoading(true)
    try {
      const searchFilters: any = {}
      if (salesFilters.paymentMethod) searchFilters.paymentMethod = salesFilters.paymentMethod
      if (salesFilters.category) searchFilters.category = salesFilters.category
      if (salesFilters.minAmount) searchFilters.minAmount = parseFloat(salesFilters.minAmount)
      if (salesFilters.maxAmount) searchFilters.maxAmount = parseFloat(salesFilters.maxAmount)
      
      const searchResults = await reportsService.searchSales(searchFilters)
      toast({
        title: 'Sales Search',
        description: `Found ${searchResults?.length || 0} sales matching your criteria`,
        type: 'info'
      })
    } catch (error: any) {
      toast({
        title: 'Search failed',
        description: error.message,
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle inventory search
  const handleInventorySearch = async () => {
    setIsLoading(true)
    try {
      const searchFilters: any = {}
      if (inventorySearch.category) searchFilters.category = inventorySearch.category
      if (inventorySearch.minStock) searchFilters.minStock = parseInt(inventorySearch.minStock)
      if (inventorySearch.maxStock) searchFilters.maxStock = parseInt(inventorySearch.maxStock)
      
      const searchResults = await reportsService.searchInventory(searchFilters)
      setInventoryItems(searchResults || [])
    } catch (error: any) {
      toast({
        title: 'Search failed',
        description: error.message,
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate sales metrics
  const calculateSalesMetrics = () => {
    const totalRevenue = dailySales.reduce((sum, item) => sum + (item.totalAmount || 0), 0)
    const totalTransactions = dailySales.reduce((sum, item) => sum + (item.saleCount || 0), 0)
    const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0
    
    return {
      totalRevenue,
      totalTransactions,
      avgTransaction
    }
  }

  const salesMetrics = calculateSalesMetrics()
  const { startDisplay, endDisplay } = getDisplayDateRange()

  // Payment Methods Chart Component
  const PaymentMethodsChart = ({ data }: { data: any[] }) => {
    if (!data || data.length === 0) {
      return (
        <div className="h-[300px] flex items-center justify-center border rounded-lg">
          <div className="text-center">
            <p className="text-gray-500">No payment data available</p>
          </div>
        </div>
      )
    }

    const totalAmount = data.reduce((sum, item) => sum + (item.amount || 0), 0)

    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground">Total Payments</p>
          <p className="text-3xl font-bold text-green-600">${totalAmount.toFixed(2)}</p>
        </div>
        
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    item.method === 'Cash' ? 'bg-green-100' :
                    item.method === 'Card' ? 'bg-blue-100' :
                    item.method === 'Mobile' ? 'bg-purple-100' : 'bg-orange-100'
                  }`}>
                    <CreditCard className={`h-4 w-4 ${
                      item.method === 'Cash' ? 'text-green-600' :
                      item.method === 'Card' ? 'text-blue-600' :
                      item.method === 'Mobile' ? 'text-purple-600' : 'text-orange-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium">{item.method}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.count} transactions
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">${item.amount.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.percentage}%
                  </p>
                </div>
              </div>
              <Progress value={item.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Reports</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive analysis and insights across all business areas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={loadInitialReports}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh All
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Report Period</span>
            </div>
            <div className="flex-1 max-w-2xl">
              <DateRangePicker
                startDate={formatDateForDisplay(dateRange.startDate)}
                endDate={formatDateForDisplay(dateRange.endDate)}
                onChange={handleDateRangeChange}
              />
            </div>
            <Button
              onClick={handleApplyFilters}
              disabled={isLoading}
              className="md:w-auto w-full"
            >
              Apply Date Range
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold mt-2">
                  ${salesMetrics.totalRevenue.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {salesMetrics.totalTransactions} transactions
                </p>
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
                <p className="text-sm text-muted-foreground">Avg. Transaction</p>
                <p className="text-2xl font-bold mt-2">
                  ${salesMetrics.avgTransaction.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Average per sale
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Payments</p>
                <p className="text-2xl font-bold mt-2">
                  ${paymentTotal.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Processed payments
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold mt-2">
                  {lowStockItems.length}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Require attention
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Sales Reports
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Inventory Reports
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Reports
          </TabsTrigger>
        </TabsList>

        {/* Sales Reports Tab */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid gap-6">
            {/* Sales Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Daily Sales Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-2">
                    Showing sales performance broken down by day
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Amount per Day</p>
                      <p className="text-lg font-semibold">
                        ${salesMetrics.totalRevenue.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Number of Sales per Day (Avg)</p>
                      <p className="text-lg font-semibold">
                        {dailySales.length > 0 ? (salesMetrics.totalTransactions / dailySales.length).toFixed(1) : 0}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Average Sale Amount per Day</p>
                      <p className="text-lg font-semibold">
                        ${salesMetrics.avgTransaction.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                <SalesReportChart data={dailySales.map(item => ({
                  date: item.date,
                  totalAmount: item.totalAmount,
                  transactionCount: item.saleCount
                }))} />
              </CardContent>
            </Card>

            {/* Sales Search Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Advanced Sales Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <Select
                        value={salesFilters.paymentMethod}
                        onValueChange={(value) => setSalesFilters({...salesFilters, paymentMethod: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="mobile">Mobile</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={salesFilters.category}
                        onValueChange={(value) => setSalesFilters({...salesFilters, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beverages">Beverages</SelectItem>
                          <SelectItem value="snacks">Snacks</SelectItem>
                          <SelectItem value="dairy">Dairy</SelectItem>
                          <SelectItem value="bakery">Bakery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minAmount">Min Amount ($)</Label>
                      <Input
                        type="number"
                        value={salesFilters.minAmount}
                        onChange={(e) => setSalesFilters({...salesFilters, minAmount: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxAmount">Max Amount ($)</Label>
                      <Input
                        type="number"
                        value={salesFilters.maxAmount}
                        onChange={(e) => setSalesFilters({...salesFilters, maxAmount: e.target.value})}
                        placeholder="1000.00"
                      />
                    </div>
                  </div>
                  <Button onClick={handleSalesSearch} disabled={isLoading}>
                    <Search className="h-4 w-4 mr-2" />
                    Search Sales
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Daily Sales Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Daily Sales Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Date</th>
                        <th className="text-left py-3 px-4 font-semibold">Total Amount</th>
                        <th className="text-left py-3 px-4 font-semibold">Sales Count</th>
                        <th className="text-left py-3 px-4 font-semibold">Average Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailySales.slice(0, 10).map((item, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            {DateTime.fromISO(item.date).toFormat('MMM dd, yyyy')}
                          </td>
                          <td className="py-3 px-4 font-semibold">
                            ${(item.totalAmount || 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">
                              {item.saleCount || 0}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            ${((item.totalAmount || 0) / (item.saleCount || 1)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Inventory Reports Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <div className="grid gap-6">
            {/* Low Stock Alert */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Low Stock Alert
                  </CardTitle>
                  <Badge variant={lowStockItems.length > 0 ? "destructive" : "secondary"}>
                    {lowStockItems.length} items need reordering
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lowStockItems.length > 0 ? (
                    lowStockItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            item.stock <= 5 ? 'bg-red-100' : 'bg-orange-100'
                          }`}>
                            <Package className={`h-5 w-5 ${
                              item.stock <= 5 ? 'text-red-600' : 'text-orange-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-semibold">{item.name || item.productName}</p>
                            <p className="text-sm text-muted-foreground">{item.category || 'Uncategorized'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            item.stock <= 5 ? 'text-red-600' : 'text-orange-600'
                          }`}>
                            {item.stock || 0}
                          </div>
                          <p className="text-sm text-muted-foreground">units remaining</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">All items are well stocked</h3>
                      <p className="text-muted-foreground">No low stock items found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Full Inventory View */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Complete Inventory Listing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Product</th>
                        <th className="text-left py-3 px-4 font-semibold">Category</th>
                        <th className="text-left py-3 px-4 font-semibold">Stock</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryItems.slice(0, 15).map((item, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{item.name || item.productName}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{item.category || 'Uncategorized'}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{item.stock || 0}</span>
                              <span className="text-sm text-muted-foreground">units</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                (item.stock || 0) <= 5 ? "destructive" :
                                (item.stock || 0) <= 10 ? "secondary" : "default"
                              }
                            >
                              {(item.stock || 0) <= 5 ? 'Critical' :
                               (item.stock || 0) <= 10 ? 'Low' : 'Good'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Inventory Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Inventory Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="invCategory">Category</Label>
                      <Select
                        value={inventorySearch.category}
                        onValueChange={(value) => setInventorySearch({...inventorySearch, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beverages">Beverages</SelectItem>
                          <SelectItem value="snacks">Snacks</SelectItem>
                          <SelectItem value="dairy">Dairy</SelectItem>
                          <SelectItem value="bakery">Bakery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minStock">Min Stock</Label>
                      <Input
                        type="number"
                        value={inventorySearch.minStock}
                        onChange={(e) => setInventorySearch({...inventorySearch, minStock: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxStock">Max Stock</Label>
                      <Input
                        type="number"
                        value={inventorySearch.maxStock}
                        onChange={(e) => setInventorySearch({...inventorySearch, maxStock: e.target.value})}
                        placeholder="1000"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleInventorySearch} disabled={isLoading}>
                      <Search className="h-4 w-4 mr-2" />
                      Search Inventory
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setInventorySearch({ category: '', minStock: '', maxStock: '' })
                        loadInitialReports()
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payment Reports Tab */}
        <TabsContent value="payments" className="space-y-6">
          <div className="grid gap-6">
            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-8 text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4">
                    <DollarSign className="h-12 w-12 text-white" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Total Payments Received</p>
                  <p className="text-4xl font-bold text-green-600">
                    ${paymentTotal.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    For period: {startDisplay} to {endDisplay}
                  </p>
                </div>
                
                <PaymentMethodsChart data={paymentMethodsData} />
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Payment History by Date Range
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadPaymentHistory}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh History
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Date & Time</th>
                        <th className="text-left py-3 px-4 font-semibold">Transaction ID</th>
                        <th className="text-left py-3 px-4 font-semibold">Method</th>
                        <th className="text-left py-3 px-4 font-semibold">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.slice(0, 10).map((payment, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            {payment.paidAt ? DateTime.fromISO(payment.paidAt).toFormat('MMM dd, yyyy HH:mm') : 'N/A'}
                          </td>
                          <td className="py-3 px-4 font-mono text-sm">
                            {payment.transactionId || 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{payment.method || 'Unknown'}</Badge>
                          </td>
                          <td className="py-3 px-4 font-semibold">
                            ${(payment.amount || 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="secondary">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          </td>
                        </tr>
                      ))}
                      {paymentHistory.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">
                            No payment history found for the selected period
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground border-t pt-4">
        <p>Report generated on {DateTime.now().setZone(timeZone).toFormat('MMMM dd, yyyy HH:mm:ss')}</p>
        <p className="mt-1">User: {user?.username || 'System'} • Period: {startDisplay} to {endDisplay}</p>
      </div>
    </div>
  )
}