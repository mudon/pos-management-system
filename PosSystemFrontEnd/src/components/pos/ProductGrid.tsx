import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Zap } from 'lucide-react';
import type { Product } from '@/types';
import { cn } from '@/lib/utils';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export default function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  const categories = ['All', 'Beverages', 'Snacks', 'Dairy', 'Bakery'];

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant="outline"
            className="rounded-full"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <Card 
            key={product.id} 
            className="group overflow-hidden border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="relative">
              {/* Product Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                <Package className="h-16 w-16 text-gray-400" />
              </div>
              
              {/* Stock Badge */}
              <Badge 
                className={cn(
                  "absolute top-3 right-3",
                  product.stock > 30 
                    ? "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30" 
                    : product.stock > 10 
                    ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30"
                    : "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30"
                )}
              >
                {product.stock} left
              </Badge>

              {/* Quick Add Button */}
              <Button
                onClick={() => onAddToCart(product)}
                className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                size="sm"
              >
                <Zap size={16} />
              </Button>
            </div>

            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{product.category}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ${product.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">Tax: {product.tax_rate}%</p>
                  </div>
                  
                  <Button
                    onClick={() => onAddToCart(product)}
                    variant="outline"
                    size="sm"
                    className="border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}