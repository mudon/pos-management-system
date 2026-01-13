export interface Category {
  id: number
  name: string
  description: string | null
  color: string
  icon: string
  product_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateCategoryDto {
  name: string
  description?: string
  color?: string
  icon?: string
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {
  is_active?: boolean
}

export interface CategoryStats {
  total_categories: number
  active_categories: number
  total_products: number
}