import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Printer,
  X,
  CheckCircle,
  CreditCard,
  DollarSign,
} from 'lucide-react';
import type { Receipt } from '@/types';

interface ReceiptModalProps {
  receipt: Receipt;
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
}

export default function ReceiptModal({
  receipt,
  isOpen,
  onClose,
  onPrint,
}: ReceiptModalProps) {
  const handlePrint = () => {
    onPrint();
    // In a real app, you might want to delay closing
    setTimeout(() => onClose(), 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Payment Successful!
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {/* Receipt Header */}
          <div className="text-center mb-6">
            <div className="inline-block p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TRANSACTION COMPLETE
            </h3>
            <p className="text-gray-500 mt-1">Thank you for your purchase</p>
            
            <div className="mt-4 space-y-1">
              <Badge variant="outline" className="bg-gray-100">
                #{receipt.id}
              </Badge>
              <p className="text-sm text-gray-500">{receipt.date}</p>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3 mb-6">
            {receipt.items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {item.product.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {item.quantity} × ${item.product.price.toFixed(2)}
                  </div>
                </div>
                <div className="font-bold text-gray-900 dark:text-white">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
              <span className="font-medium">${receipt.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Tax</span>
              <span className="font-medium">${receipt.tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span className="text-gray-900 dark:text-white">Total</span>
              <span className="text-green-600 dark:text-green-400">
                ${receipt.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {receipt.paymentMethod === 'Cash' ? (
                  <DollarSign className="h-5 w-5 text-green-600" />
                ) : (
                  <CreditCard className="h-5 w-5 text-blue-600" />
                )}
                <div>
                  <div className="font-medium">Payment Method</div>
                  <div className="text-sm text-gray-500">
                    {receipt.paymentMethod}
                  </div>
                </div>
              </div>
              <Badge
                variant="outline"
                className={
                  receipt.paymentMethod === 'Cash'
                    ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'
                    : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
                }
              >
                Paid
              </Badge>
            </div>
          </div>

          {/* Thank You Message */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500">
              Thank you for shopping with us! 🛒
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Receipt has been saved to your account
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            onClick={handlePrint}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Receipt
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}