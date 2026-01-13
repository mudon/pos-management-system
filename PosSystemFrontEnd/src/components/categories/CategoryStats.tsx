import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Package, Layers, Tag, TrendingUp } from 'lucide-react'
import type { CategoryStats as CategoryStatsType } from '@/types/category'

interface CategoryStatsProps {
  stats: CategoryStatsType
}

export function CategoryStats({ stats }: CategoryStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Categories</p>
              <h3 className="text-2xl font-bold mt-2">{stats.total_categories}</h3>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">All categories</span>
              </div>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Layers className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Categories</p>
              <h3 className="text-2xl font-bold mt-2">{stats.active_categories}</h3>
              <p className="text-sm text-gray-500 mt-2">
                {Math.round((stats.active_categories / stats.total_categories) * 100)}% active
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Tag className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <h3 className="text-2xl font-bold mt-2">{stats.total_products}</h3>
              <p className="text-sm text-gray-500 mt-2">
                Across all categories
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}