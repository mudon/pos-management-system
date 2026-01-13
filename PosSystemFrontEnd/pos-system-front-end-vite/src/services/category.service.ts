import { api } from './api'
import type { Category, CreateCategoryDto, UpdateCategoryDto, CategoryStats } from '@/types/category'

class CategoryService {
  async getAllCategories(): Promise<Category[]> {
    try {
      const { data } = await api.get<Category[]>('/categories')
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async getCategoryById(id: number): Promise<Category> {
    try {
      const { data } = await api.get<Category>(`/categories/${id}`)
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async createCategory(categoryData: CreateCategoryDto): Promise<Category> {
    try {
      const { data } = await api.post<Category>('/categories', categoryData)
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async updateCategory(id: number, categoryData: UpdateCategoryDto): Promise<Category> {
    try {
      const { data } = await api.put<Category>(`/categories/${id}`, categoryData)
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async deleteCategory(id: number): Promise<void> {
    try {
      await api.delete(`/categories/${id}`)
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async checkCategoryExists(name: string): Promise<boolean> {
    try {
      const { data } = await api.get<{ exists: boolean }>(`/categories/exists/${encodeURIComponent(name)}`)
      return data.exists
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async getCategoryStats(): Promise<CategoryStats> {
    try {
      const { data } = await api.get<CategoryStats>('/categories/stats')
      return data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data?.message || error.response.statusText
      return new Error(message)
    } else if (error.request) {
      return new Error('Network error. Please check your connection.')
    } else {
      return new Error('An unexpected error occurred.')
    }
  }
}

export const categoryService = new CategoryService()