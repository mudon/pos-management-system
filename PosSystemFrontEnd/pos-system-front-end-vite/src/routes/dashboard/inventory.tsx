import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { InventoryView } from '@/components/inventory/InventoryView'

export function InventoryPage() {
  return (
    <DashboardLayout activeView="inventory">
      <InventoryView />
    </DashboardLayout>
  )
}