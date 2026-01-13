import { useState } from 'react'
import {
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Box,
  Layers,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Link, useRouterState } from '@tanstack/react-router'

const menuItems = [
  { id: 'pos', icon: ShoppingCart, label: 'Point of Sale', badge: 3, path: '/dashboard/pos' },
  { id: 'categories', icon: Layers, label: 'Categories', path: '/dashboard/categories' },
  { id: 'products', icon: Package, label: 'Products', path: '/dashboard/products' },
  { id: 'inventory', icon: Box, label: 'Inventory', badge: 5, path: '/dashboard/inventory' },
  { id: 'sales', icon: DollarSign, label: 'Sales', badge: 5, path: '/dashboard/sales' },
  { id: 'reports', icon: BarChart3, label: 'Analytics', path: '/dashboard/reports' },
  { id: 'settings', icon: Settings, label: 'Settings', path: '/dashboard/settings' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  // 👇 get current URL from TanStack Router
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <div
      className={cn(
        'fixed left-0 top-0 h-screen bg-gradient-to-b from-gray-900 to-black border-r border-gray-800 transition-all duration-300 z-50',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">RetailPro</h1>
                <p className="text-xs text-gray-400">POS v2.0</p>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto">
              <Zap className="h-5 w-5 text-white" />
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </Button>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-blue-500/20">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>

          {!collapsed && (
            <div className="flex-1">
              <h3 className="font-semibold text-white">Store Admin</h3>
              <p className="text-xs text-gray-400">Premium Account</p>
            </div>
          )}

          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-400 border-green-500/20"
          >
            {!collapsed && 'Online'}
          </Badge>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.path)

          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group',
                isActive
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              )}
            >
              <div className="relative">
                <item.icon size={20} />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
                )}
              </div>

              {!collapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className="bg-red-500/10 text-red-400"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <HelpCircle size={20} />
            {!collapsed && <span className="ml-3">Help & Support</span>}
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut size={20} />
            {!collapsed && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </div>
    </div>
  )
}
