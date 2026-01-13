import React from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { CategoriesView } from '@/components/categories/CategoriesView'

export function CategoriesPage() {
  return (
    <DashboardLayout activeView="categories">
      <CategoriesView />
    </DashboardLayout>
  )
}