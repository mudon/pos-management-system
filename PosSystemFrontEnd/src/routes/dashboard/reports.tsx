import React from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ReportsView } from '@/components/reports/ReportsView'

export function ReportsPage() {
  return (
    <DashboardLayout activeView="reports">
      <ReportsView />
    </DashboardLayout>
  )
}