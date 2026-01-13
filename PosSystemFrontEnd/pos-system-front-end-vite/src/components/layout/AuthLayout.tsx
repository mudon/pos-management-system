import React from 'react'
import { Link } from '@tanstack/react-router'
import { Store, Zap, Github, Twitter } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Brand/Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="flex-1 flex flex-col justify-between p-12 text-white">
          <div>
            <Link to="/" className="flex items-center gap-3 text-2xl font-bold">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Store className="h-6 w-6" />
              </div>
              RetailPro
            </Link>
            <div className="mt-20 max-w-lg">
              <h2 className="text-5xl font-bold mb-6">
                Revolutionize Your Retail Business
              </h2>
              <p className="text-xl opacity-90">
                All-in-one POS system with inventory management, analytics, and seamless customer experience.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {['Real-time Analytics', 'Inventory Tracking', 'Customer Management'].map((feature, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4" />
                    <span className="font-semibold">{feature}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:opacity-80 transition-opacity">
                <Github className="h-6 w-6" />
              </a>
              <a href="#" className="hover:opacity-80 transition-opacity">
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-lg">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Store className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                RetailPro
              </span>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}