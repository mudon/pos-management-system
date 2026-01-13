import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { Category, CreateCategoryDto } from '@/types/category'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, Check, X } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

const categorySchema = z.object({
  name: z.string()
    .min(2, 'Category name must be at least 2 characters')
    .max(50, 'Category name must be less than 50 characters'),
  description: z.string().max(200, 'Description must be less than 200 characters').optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color code').optional(),
  icon: z.string().max(2, 'Icon must be a single emoji').optional(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

const colorOptions = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Gray', value: '#6B7280' },
]

const iconOptions = ['📦', '🥤', '🍿', '🥛', '🍞', '🍎', '🥦', '🧊', '🍫', '☕']

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category: Category | null
  onSubmit: (data: CreateCategoryDto) => Promise<void>
  isLoading: boolean
  onCheckName: (name: string) => Promise<boolean>
}

export function CategoryModal({
  isOpen,
  onClose,
  category,
  onSubmit,
  isLoading,
  onCheckName,
}: CategoryModalProps) {
  const { toast } = useToast()
  const [nameExists, setNameExists] = React.useState(false)
  const [checkingName, setCheckingName] = React.useState(false)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#3B82F6',
      icon: '📦',
    },
  })

  const nameValue = form.watch('name')

  // Check name availability
  useEffect(() => {
    const checkName = async () => {
      if (nameValue && nameValue.length >= 2 && nameValue !== category?.name) {
        setCheckingName(true)
        try {
          const exists = await onCheckName(nameValue)
          setNameExists(exists)
        } catch (error) {
          console.error('Error checking name:', error)
        } finally {
          setCheckingName(false)
        }
      } else {
        setNameExists(false)
      }
    }

    const timeoutId = setTimeout(checkName, 500)
    return () => clearTimeout(timeoutId)
  }, [nameValue, category?.name, onCheckName])

  // Reset form when modal opens/closes or category changes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: category?.name || '',
        description: category?.description || '',
        color: category?.color || '#3B82F6',
        icon: category?.icon || '📦',
      })
      setNameExists(false)
    }
  }, [isOpen, category, form])

  const handleSubmit = async (values: CategoryFormValues) => {
    if (nameExists && values.name !== category?.name) {
      toast({
        title: 'Category name exists',
        description: 'Please choose a different category name',
        type: 'error'
      })
      return
    }

    try {
      await onSubmit(values)
      form.reset()
      onClose()
    } catch (error) {
      // Error handled by parent
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Edit Category' : 'Create New Category'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="e.g., Beverages, Snacks"
                        className="pr-10"
                        disabled={isLoading}
                        {...field}
                      />
                      {field.value && field.value.length >= 2 && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {checkingName ? (
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                          ) : nameExists ? (
                            <X className="h-4 w-4 text-red-500" />
                          ) : (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                  {nameValue && nameValue.length >= 2 && !checkingName && (
                    <p className={`text-xs ${nameExists ? 'text-red-600' : 'text-green-600'}`}>
                      {nameExists ? 'Category name already exists' : 'Category name is available'}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe this category..."
                      className="resize-none"
                      rows={3}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label>Color</Label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => form.setValue('color', color.value)}
                      className={`h-8 rounded-lg border-2 transition-all ${
                        form.watch('color') === color.value
                          ? 'border-gray-900 scale-110'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="#000000"
                          className="font-mono"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-3">
                <Label>Icon</Label>
                <div className="grid grid-cols-5 gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => form.setValue('icon', icon)}
                      className={`h-8 text-lg rounded-lg border-2 transition-all ${
                        form.watch('icon') === icon
                          ? 'border-gray-900 bg-gray-100 scale-110'
                          : 'border-transparent hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Emoji"
                          maxLength={2}
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {category && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">
                    {new Date(category.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">
                    {new Date(category.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600">Products in Category:</span>
                  <span className="font-medium">{category.product_count}</span>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || nameExists}
                className="bg-gradient-to-r from-blue-500 to-purple-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {category ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  category ? 'Update Category' : 'Create Category'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}