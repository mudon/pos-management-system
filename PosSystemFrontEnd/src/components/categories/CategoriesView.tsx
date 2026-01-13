import React, { useState, useEffect } from 'react'
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types/category'
import { categoryService } from '@/services/category.service'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Search, Filter, RefreshCw } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { CategoryTable } from './CategoryTable'
import { CategoryModal } from './CategoryModal'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import helper from '@/lib/helpers'


export function CategoriesView() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  
  // Delete confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null)

  // Load categories
  const loadCategories = async () => {
    setIsLoading(true)
    try {
      const categoriesData = await categoryService.getAllCategories()
      setCategories(categoriesData)
    } catch (error: any) {
      toast({
        title: 'Failed to load categories',
        description: error.message,
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  // Apply filters
  useEffect(() => {
    let result = categories
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(category =>
        category.name.toLowerCase().includes(term) ||
        category.description?.toLowerCase().includes(term)
      )
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(category =>
        statusFilter === 'active' ? category.is_active : !category.is_active
      )
    }
    
    setFilteredCategories(result)
  }, [categories, searchTerm, statusFilter])

  const handleCreateCategory = async (data: CreateCategoryDto) => {
    try {
      const newCategory = await categoryService.createCategory(data)
      setCategories(prev => [...prev, newCategory])
      toast({
        title: 'Category created',
        description: `${newCategory.name} has been created successfully`,
        type: 'success'
      })
    } catch (error: any) {
      toast({
        title: 'Failed to create category',
        description: error.message,
        type: 'error'
      })
      throw error
    }
  }

  const handleUpdateCategory = async (data: CreateCategoryDto) => {
    if (!selectedCategory) return
    
    try {
      const updateData: UpdateCategoryDto = {
        ...data,
        is_active: selectedCategory.is_active,
      }
      
      const updatedCategory = await categoryService.updateCategory(selectedCategory.id, updateData)
      setCategories(prev => prev.map(c => 
        c.id === selectedCategory.id ? updatedCategory : c
      ))
      toast({
        title: 'Category updated',
        description: `${updatedCategory.name} has been updated successfully`,
        type: 'success'
      })
    } catch (error: any) {
      toast({
        title: 'Failed to update category',
        description: error.message,
        type: 'error'
      })
      throw error
    }
  }

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return
    
    try {
      await categoryService.deleteCategory(categoryToDelete)
      setCategories(prev => prev.filter(c => c.id !== categoryToDelete))
      toast({
        title: 'Category deleted',
        description: 'Category has been deleted successfully',
        type: 'success'
      })
    } catch (error: any) {
      toast({
        title: 'Failed to delete category',
        description: error.message,
        type: 'error'
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setCategoryToDelete(null)
    }
  }

  const handleCheckName = async (name: string): Promise<boolean> => {
    try {
      return await categoryService.checkCategoryExists(name)
    } catch (error) {
      return false
    }
  }

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (id: number) => {
    const category = categories.find(c => c.id === id)
    if (category?.product_count! > 0) {
      toast({
        title: 'Cannot delete category',
        description: 'This category contains products. Please move or delete the products first.',
        type: 'error'
      })
      return
    }
    setCategoryToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleViewProducts = (category: Category) => {
    toast({
      title: 'View Products',
      description: `Showing products in ${category.name}`,
      type: 'info'
    })
    // In a real app, you would navigate to products page with category filter
  }

  const handleStatusToggle = async (category: Category) => {
    try {
      const updatedCategory = await categoryService.updateCategory(category.id, {
        is_active: !category.is_active
      })
      setCategories(prev => prev.map(c => 
        c.id === category.id ? updatedCategory : c
      ))
      toast({
        title: 'Status updated',
        description: `${category.name} is now ${updatedCategory.is_active ? 'active' : 'inactive'}`,
        type: 'success'
      })
    } catch (error: any) {
      toast({
        title: 'Failed to update status',
        description: error.message,
        type: 'error'
      })
    }
  }

  const isPermit = helper.hasPermission( user?.role.toLowerCase() as 'admin' | 'cashier' );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Category Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Organize your products into categories for better management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={loadCategories}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {isPermit && (
            <Button
              onClick={() => {
                setSelectedCategory(null)
                setIsModalOpen(true)
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-500">
              Showing {filteredCategories.length} of {categories.length} categories
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="mt-2 text-gray-600">Loading categories...</p>
            </div>
          ) : (
            <CategoryTable
              categories={filteredCategories}
              onEdit={handleEditCategory}
              onDelete={handleDeleteClick}
              onViewProducts={handleViewProducts}
              isPermit={isPermit}
            />
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
        onSubmit={selectedCategory ? handleUpdateCategory : handleCreateCategory}
        isLoading={false}
        onCheckName={handleCheckName}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}