import { DashboardLayout } from '@/components/layout/DashboardLayout'
import POSDashboard from '@/components/pos/POSDashboard'

export function DashboardPage() {
  return (
      <DashboardLayout activeView="pos">
        <POSDashboard />
      </DashboardLayout>
  )
}