using PosSystem.Application.DTOs.Categories;
using PosSystem.Application.Interfaces;
using PosSystem.Domain.Entities;

namespace PosSystem.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;

    public CategoryService(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync()
    {
        var categories = await _categoryRepository.GetAllAsync();
        
        return categories.Select(c => new CategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            CreatedAt = c.CreatedAt,
        });
    }

    public async Task<CategoryDto?> GetCategoryByIdAsync(int id)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        
        if (category == null)
            return null;

        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            CreatedAt = category.CreatedAt,
        };
    }

    public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto dto)
    {
        // Check if category already exists
        var existingCategory = await _categoryRepository.GetByNameAsync(dto.Name);
        if (existingCategory != null)
            throw new InvalidOperationException($"Category with name '{dto.Name}' already exists.");

        var category = new Category
        {
            Name = dto.Name,
            CreatedAt = DateTime.UtcNow
        };

        var createdCategory = await _categoryRepository.AddAsync(category);
        
        return new CategoryDto
        {
            Id = createdCategory.Id,
            Name = createdCategory.Name,
            CreatedAt = createdCategory.CreatedAt,
        };
    }

    public async Task<CategoryDto?> UpdateCategoryAsync(int id, UpdateCategoryDto dto)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        if (category == null)
            return null;

        // Check if new name already exists (excluding current category)
        var existingCategory = await _categoryRepository.GetByNameAsync(dto.Name);
        if (existingCategory != null && existingCategory.Id != id)
            throw new InvalidOperationException($"Category with name '{dto.Name}' already exists.");

        category.Name = dto.Name;
        await _categoryRepository.UpdateAsync(category);
        
        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            CreatedAt = category.CreatedAt,
        };
    }

    public async Task<bool> DeleteCategoryAsync(int id)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        if (category == null)
            return false;

        await _categoryRepository.DeleteAsync(category);
        return true;
    }

    public async Task<bool> CategoryExistsAsync(string name)
    {
        var category = await _categoryRepository.GetByNameAsync(name);
        return category != null;
    }

    public async Task<bool> CategoryExistsAsync(int id)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        return category != null;
    }
}