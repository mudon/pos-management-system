import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Camera, Zap, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  placeholder?: string;
}

export default function BarcodeScanner({ onScan, placeholder }: BarcodeScannerProps) {
  const [input, setInput] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const handleSubmit = () => {
    if (input.trim()) {
      onScan(input);
      setInput('');
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder={placeholder || "Scan barcode or search..."}
            className="pl-10 pr-4 py-6 text-lg border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <Dialog open={showScanner} onOpenChange={setShowScanner}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-14 w-14 border-gray-300 dark:border-gray-700"
            >
              <Camera className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <div className="p-6 text-center">
              <Camera className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Barcode Scanner</h3>
              <p className="text-gray-500 mb-6">
                Point your camera at a barcode to scan
              </p>
              {/* Scanner simulation */}
              <div className="w-64 h-48 mx-auto border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">Camera Preview</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          onClick={handleSubmit}
          size="lg"
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Zap className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>
    </div>
  );
}