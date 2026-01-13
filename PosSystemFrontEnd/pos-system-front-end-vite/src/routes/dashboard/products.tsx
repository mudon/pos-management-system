import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProductsView } from '@/components/products/ProductsView'

export function ProductsPage() {
  return (
    <DashboardLayout activeView="products">
      <ProductsView />
    </DashboardLayout>
  )
}