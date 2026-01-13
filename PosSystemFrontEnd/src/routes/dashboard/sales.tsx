import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { SalesView } from '@/components/sales/SalesView'

export function SalesPage() {
  return (
    <DashboardLayout activeView="sales">
      <SalesView />
    </DashboardLayout>
  )
}