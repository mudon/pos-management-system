import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeView: string;
  stats?: any;
}

export function DashboardLayout({ children, activeView, stats }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="flex">
        <Sidebar />
        <div className={cn(
          "flex-1 flex flex-col",
          "ml-16 lg:ml-64 transition-all duration-300"
        )}>
          <Header activeView={activeView} stats={stats} />
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}