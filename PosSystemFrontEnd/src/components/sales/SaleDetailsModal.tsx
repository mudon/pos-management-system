import type { SaleWithItems } from '@/types/sales'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Receipt, User, Calendar, CreditCard, DollarSign, Package, Printer } from 'lucide-react'

interface SaleDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  sale: SaleWithItems
}

export function SaleDetailsModal({
  isOpen,
  onClose,
  sale,
}: SaleDetailsModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'Cash':
        return <DollarSign className="h-4 w-4" />
      case 'Card':
        return <CreditCard className="h-4 w-4" />
      default:
        return <Receipt className="h-4 w-4" />
    }
  }

  const handlePrint = () => {
    const printContent = document.getElementById('receipt-content')
    if (printContent) {
      const originalContents = document.body.innerHTML
      document.body.innerHTML = printContent.innerHTML
      window.print()
      document.body.innerHTML = originalContents
      window.location.reload()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Sale Details: #{sale.id}
          </DialogTitle>
        </DialogHeader>

        <div id="receipt-content" className="space-y-6">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Sales Receipt</h3>
                <div className="text-sm text-gray-600">Transaction #{sale.id}</div>
              </div>
              <Badge className="text-lg px-4 py-1">
                ${sale.totalAmount.toFixed(2)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-gray-500">Cashier</div>
                  <div className="font-medium">{sale.userName || `User #${sale.userId}`}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-gray-500">Date & Time</div>
                  <div className="font-medium">{formatDate(sale.createdAt)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getPaymentIcon(sale.paymentMethod)}
                <div>
                  <div className="text-gray-500">Payment Method</div>
                  <div className="font-medium">{sale.paymentMethod}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-gray-500">Total Items</div>
                  <div className="font-medium">{sale.items.length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h4 className="font-semibold">Items Purchased</h4>
            </div>
            <div className="divide-y">
              {sale.items.map((item, index) => (
                <div key={item.id} className="px-4 py-3 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          #{item.productId}
                        </Badge>
                        <span>Barcode: {item.barcode}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${(item.quantity * item.priceAtSale).toFixed(2)}</div>
                      <div className="text-sm text-gray-600">
                        {item.quantity} × ${item.priceAtSale.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">
                ${sale.items.reduce((sum, item) => sum + (item.quantity * item.priceAtSale), 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-3">
              <span>Total Amount</span>
              <span className="text-green-600">${sale.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t text-center">
            <p className="text-sm text-gray-500">
              Thank you for your business! 🛒
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Receipt ID: {sale.id} | Transaction completed successfully
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex-1"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Receipt
          </Button>
          <Button
            onClick={onClose}
            className="flex-1"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}