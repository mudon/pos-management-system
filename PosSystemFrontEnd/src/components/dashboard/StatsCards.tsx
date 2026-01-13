import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, Package, DollarSign, ShoppingBag, Activity } from 'lucide-react';

const stats = [
  {
    title: 'Today Sales',
    value: '$1,234.56',
    change: '+12.5%',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-600',
  },
  {
    title: 'Transactions',
    value: '45',
    change: '+8.2%',
    icon: ShoppingBag,
    color: 'from-blue-500 to-cyan-600',
  },
  {
    title: 'Avg. Transaction',
    value: '$27.43',
    change: '+5.3%',
    icon: TrendingUp,
    color: 'from-purple-500 to-pink-600',
  },
  {
    title: 'Low Stock Items',
    value: '3',
    change: '-2.1%',
    icon: Package,
    color: 'from-orange-500 to-red-600',
  },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className="border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow duration-300"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                  {stat.value}
                </h3>
                <div className="flex items-center gap-1 mt-2">
                  <span className={`text-sm font-medium ${
                    stat.change.startsWith('+') 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500">from yesterday</span>
                </div>
              </div>
              <div className={`h-12 w-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}