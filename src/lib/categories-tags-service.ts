import {
  Category,
  Tag,
  CategoryFilters,
  TagFilters,
  CategoryCreate,
  CategoryUpdate,
  TagCreate,
  TagUpdate,
  CategoryListResponse,
  TagListResponse,
  CategoryStats,
  TagStats,
  CategoryHierarchy,
  TaxonomyUsage,
  generateCategorySlug,
  generateTagSlug,
  validateCategoryName,
  validateTagName,
  getDefaultCategoryColor,
  getDefaultTagColor
} from '@/types/categories-tags';
import { indexedDB } from './storage';
import { generateSlug } from './slug-utils';

class CategoriesTagsService {
  private readonly categoriesStoreName = 'categories';
  private readonly tagsStoreName = 'tags';

  // Category Management
  async getCategories(filters: CategoryFilters = {}, page = 1, limit = 20): Promise<CategoryListResponse> {
    try {
      const allCategories = await indexedDB.getAll(this.categoriesStoreName) as Category[];

      let filteredCategories = allCategories;

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredCategories = filteredCategories.filter(cat =>
          cat.name.toLowerCase().includes(searchLower) ||
          cat.description?.toLowerCase().includes(searchLower)
        );
      }

      if (filters.parentId !== undefined) {
        filteredCategories = filteredCategories.filter(cat => cat.parentId === filters.parentId);
      }

      if (filters.featured !== undefined) {
        filteredCategories = filteredCategories.filter(cat => cat.isFeatured === filters.featured);
      }

      const sortBy = filters.sortBy || 'order';
      const sortOrder = filters.sortOrder || 'asc';

      filteredCategories.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });

      const total = filteredCategories.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

      const enrichedCategories = await Promise.all(
        paginatedCategories.map(async (category) => {
          const parent = category.parentId ?
            await indexedDB.get(this.categoriesStoreName, category.parentId) : null;
          const children = await this.getDirectChildren(category.id);

          return {
            ...category,
            parent,
            children,
          };
        })
      );

      return {
        categories: enrichedCategories,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        filters,
      };
    } catch (error) {
      console.error('Error getting categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  async getCategory(id: string): Promise<Category | null> {
    try {
      const category = await indexedDB.get(this.categoriesStoreName, id) as Category;
      if (!category) return null;

      const parent = category.parentId ?
        await indexedDB.get(this.categoriesStoreName, category.parentId) : null;
      const children = await this.getDirectChildren(category.id);

      return {
        ...category,
        parent,
        children,
      };
    } catch (error) {
      console.error('Error getting category:', error);
      throw new Error('Failed to fetch category');
    }
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const allCategories = await indexedDB.getAll(this.categoriesStoreName) as Category[];
      const category = allCategories.find(cat => cat.slug === slug);

      if (!category) return null;

      const parent = category.parentId ?
        await indexedDB.get(this.categoriesStoreName, category.parentId) : null;
      const children = await this.getDirectChildren(category.id);

      return {
        ...category,
        parent,
        children,
      };
    } catch (error) {
      console.error('Error getting category by slug:', error);
      throw new Error('Failed to fetch category');
    }
  }

  async createCategory(categoryData: CategoryCreate): Promise<Category> {
    try {
      const validation = validateCategoryName(categoryData.name);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const existingCategory = await this.getCategoryBySlug(generateCategorySlug(categoryData.name));
      if (existingCategory) {
        throw new Error('A category with this name already exists');
      }

      const id = `category_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      const siblingCategories = await this.getCategories({ parentId: categoryData.parentId });
      const maxOrder = Math.max(...siblingCategories.categories.map(c => c.order), 0);

      const category: Category = {
        id,
        name: categoryData.name,
        slug: generateCategorySlug(categoryData.name),
        description: categoryData.description,
        parentId: categoryData.parentId,
        color: categoryData.color || getDefaultCategoryColor(),
        icon: categoryData.icon,
        image: categoryData.image,
        postCount: 0,
        order: maxOrder + 1,
        isFeatured: categoryData.isFeatured || false,
        seo: categoryData.seo,
        createdAt: now,
        updatedAt: now,
      };

      await indexedDB.set(this.categoriesStoreName, category);
      return category;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  async updateCategory(id: string, updates: CategoryUpdate): Promise<Category> {
    try {
      const existingCategory = await this.getCategory(id);
      if (!existingCategory) {
        throw new Error('Category not found');
      }

      if (updates.name && updates.name !== existingCategory.name) {
        const validation = validateCategoryName(updates.name);
        if (!validation.isValid) {
          throw new Error(validation.error);
        }

        const newSlug = generateCategorySlug(updates.name);
        const existingWithSlug = await this.getCategoryBySlug(newSlug);
        if (existingWithSlug && existingWithSlug.id !== id) {
          throw new Error('A category with this name already exists');
        }

        updates.slug = newSlug;
      }

      const updatedCategory: Category = {
        ...existingCategory,
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      };

      await indexedDB.set(this.categoriesStoreName, updatedCategory);
      return updatedCategory;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      const category = await this.getCategory(id);
      if (!category) {
        throw new Error('Category not found');
      }

      const children = await this.getCategories({ parentId: id });
      if (children.pagination.total > 0) {
        throw new Error('Cannot delete category that has subcategories');
      }

      await indexedDB.remove(this.categoriesStoreName, id);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  async getCategoryHierarchy(): Promise<CategoryHierarchy> {
    try {
      const allCategories = await indexedDB.getAll(this.categoriesStoreName) as Category[];
      const topLevelCategories = allCategories.filter(cat => !cat.parentId);

      const buildHierarchy = (categories: Category[], parentId?: string): Category[] => {
        return categories
          .filter(cat => cat.parentId === parentId)
          .sort((a, b) => a.order - b.order)
          .map(cat => ({
            ...cat,
            children: buildHierarchy(categories, cat.id),
          }));
      };

      return {
        categories: allCategories,
        tree: buildHierarchy(topLevelCategories),
      };
    } catch (error) {
      console.error('Error getting category hierarchy:', error);
      throw new Error('Failed to fetch category hierarchy');
    }
  }

  // Tag Management
  async getTags(filters: TagFilters = {}, page = 1, limit = 20): Promise<TagListResponse> {
    try {
      const allTags = await indexedDB.getAll(this.tagsStoreName) as Tag[];

      let filteredTags = allTags;

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredTags = filteredTags.filter(tag =>
          tag.name.toLowerCase().includes(searchLower) ||
          tag.description?.toLowerCase().includes(searchLower)
        );
      }

      if (filters.featured !== undefined) {
        filteredTags = filteredTags.filter(tag => tag.isFeatured === filters.featured);
      }

      const sortBy = filters.sortBy || 'name';
      const sortOrder = filters.sortOrder || 'asc';

      filteredTags.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });

      const total = filteredTags.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedTags = filteredTags.slice(startIndex, endIndex);

      return {
        tags: paginatedTags,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        filters,
      };
    } catch (error) {
      console.error('Error getting tags:', error);
      throw new Error('Failed to fetch tags');
    }
  }

  async getTag(id: string): Promise<Tag | null> {
    try {
      const tag = await indexedDB.get(this.tagsStoreName, id) as Tag;
      return tag || null;
    } catch (error) {
      console.error('Error getting tag:', error);
      throw new Error('Failed to fetch tag');
    }
  }

  async getTagBySlug(slug: string): Promise<Tag | null> {
    try {
      const allTags = await indexedDB.getAll(this.tagsStoreName) as Tag[];
      const tag = allTags.find(t => t.slug === slug);
      return tag || null;
    } catch (error) {
      console.error('Error getting tag by slug:', error);
      throw new Error('Failed to fetch tag');
    }
  }

  async createTag(tagData: TagCreate): Promise<Tag> {
    try {
      const validation = validateTagName(tagData.name);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const existingTag = await this.getTagBySlug(generateTagSlug(tagData.name));
      if (existingTag) {
        throw new Error('A tag with this name already exists');
      }

      const id = `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      const tag: Tag = {
        id,
        name: tagData.name,
        slug: generateTagSlug(tagData.name),
        description: tagData.description,
        color: tagData.color || getDefaultTagColor(),
        postCount: 0,
        isFeatured: tagData.isFeatured || false,
        seo: tagData.seo,
        createdAt: now,
        updatedAt: now,
      };

      await indexedDB.set(this.tagsStoreName, tag);
      return tag;
    } catch (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
  }

  async updateTag(id: string, updates: TagUpdate): Promise<Tag> {
    try {
      const existingTag = await this.getTag(id);
      if (!existingTag) {
        throw new Error('Tag not found');
      }

      if (updates.name && updates.name !== existingTag.name) {
        const validation = validateTagName(updates.name);
        if (!validation.isValid) {
          throw new Error(validation.error);
        }

        const newSlug = generateTagSlug(updates.name);
        const existingWithSlug = await this.getTagBySlug(newSlug);
        if (existingWithSlug && existingWithSlug.id !== id) {
          throw new Error('A tag with this name already exists');
        }

        updates.slug = newSlug;
      }

      const updatedTag: Tag = {
        ...existingTag,
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      };

      await indexedDB.set(this.tagsStoreName, updatedTag);
      return updatedTag;
    } catch (error) {
      console.error('Error updating tag:', error);
      throw error;
    }
  }

  async deleteTag(id: string): Promise<void> {
    try {
      const tag = await this.getTag(id);
      if (!tag) {
        throw new Error('Tag not found');
      }

      await indexedDB.remove(this.tagsStoreName, id);
    } catch (error) {
      console.error('Error deleting tag:', error);
      throw error;
    }
  }

  // Statistics
  async getCategoryStats(): Promise<CategoryStats> {
    try {
      const allCategories = await indexedDB.getAll(this.categoriesStoreName) as Category[];
      const allPosts = await indexedDB.getAll('posts') as any[];

      const stats: CategoryStats = {
        totalCategories: allCategories.length,
        topLevelCategories: allCategories.filter(cat => !cat.parentId).length,
        featuredCategories: allCategories.filter(cat => cat.isFeatured).length,
        totalPostsInCategories: allPosts.filter(post => post.categories && post.categories.length > 0).length,
        topCategories: [],
      };

      const categoryPostCounts = allCategories.map(category => ({
        category,
        postCount: allPosts.filter(post =>
          post.categories && post.categories.includes(category.id)
        ).length,
      })).sort((a, b) => b.postCount - a.postCount).slice(0, 10);

      stats.topCategories = categoryPostCounts;

      return stats;
    } catch (error) {
      console.error('Error getting category stats:', error);
      throw new Error('Failed to fetch category statistics');
    }
  }

  async getTagStats(): Promise<TagStats> {
    try {
      const allTags = await indexedDB.getAll(this.tagsStoreName) as Tag[];
      const allPosts = await indexedDB.getAll('posts') as any[];

      const stats: TagStats = {
        totalTags: allTags.length,
        featuredTags: allTags.filter(tag => tag.isFeatured).length,
        totalPostsInTags: allPosts.filter(post => post.tags && post.tags.length > 0).length,
        topTags: [],
        popularTags: [],
      };

      const tagPostCounts = allTags.map(tag => ({
        tag,
        postCount: allPosts.filter(post =>
          post.tags && post.tags.includes(tag.id)
        ).length,
      })).sort((a, b) => b.postCount - a.postCount).slice(0, 10);

      stats.topTags = tagPostCounts;
      stats.popularTags = tagPostCounts.slice(0, 5);

      return stats;
    } catch (error) {
      console.error('Error getting tag stats:', error);
      throw new Error('Failed to fetch tag statistics');
    }
  }

  async getTaxonomyUsage(): Promise<TaxonomyUsage> {
    try {
      const [categories, tags, allPosts] = await Promise.all([
        indexedDB.getAll(this.categoriesStoreName) as Promise<Category[]>,
        indexedDB.getAll(this.tagsStoreName) as Promise<Tag[]>,
        indexedDB.getAll('posts') as Promise<any[]>,
      ]);

      const categoryUsage = categories.map(category => ({
        id: category.id,
        name: category.name,
        postCount: allPosts.filter(post =>
          post.categories && post.categories.includes(category.id)
        ).length,
      })).filter(c => c.postCount > 0).sort((a, b) => b.postCount - a.postCount);

      const tagUsage = tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        postCount: allPosts.filter(post =>
          post.tags && post.tags.includes(tag.id)
        ).length,
      })).filter(t => t.postCount > 0).sort((a, b) => b.postCount - a.postCount);

      return {
        categories: categoryUsage,
        tags: tagUsage,
      };
    } catch (error) {
      console.error('Error getting taxonomy usage:', error);
      throw new Error('Failed to fetch taxonomy usage');
    }
  }

  // Bulk Operations
  async bulkUpdateCategories(ids: string[], updates: Partial<CategoryUpdate>): Promise<void> {
    try {
      await Promise.all(
        ids.map(id => this.updateCategory(id, updates))
      );
    } catch (error) {
      console.error('Error in bulk category update:', error);
      throw new Error('Failed to bulk update categories');
    }
  }

  async bulkDeleteCategories(ids: string[]): Promise<void> {
    try {
      await Promise.all(
        ids.map(id => this.deleteCategory(id))
      );
    } catch (error) {
      console.error('Error in bulk category delete:', error);
      throw new Error('Failed to bulk delete categories');
    }
  }

  async bulkUpdateTags(ids: string[], updates: Partial<TagUpdate>): Promise<void> {
    try {
      await Promise.all(
        ids.map(id => this.updateTag(id, updates))
      );
    } catch (error) {
      console.error('Error in bulk tag update:', error);
      throw new Error('Failed to bulk update tags');
    }
  }

  async bulkDeleteTags(ids: string[]): Promise<void> {
    try {
      await Promise.all(
        ids.map(id => this.deleteTag(id))
      );
    } catch (error) {
      console.error('Error in bulk tag delete:', error);
      throw new Error('Failed to bulk delete tags');
    }
  }

  // Helper Methods
  private async getDirectChildren(parentId: string): Promise<Category[]> {
    try {
      const allCategories = await indexedDB.getAll(this.categoriesStoreName) as Category[];
      return allCategories.filter(cat => cat.parentId === parentId).sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error('Error getting direct children:', error);
      return [];
    }
  }

  async reorderCategories(categoryOrders: { id: string; order: number }[]): Promise<void> {
    try {
      for (const { id, order } of categoryOrders) {
        const category = await this.getCategory(id);
        if (category) {
          await this.updateCategory(id, { order });
        }
      }
    } catch (error) {
      console.error('Error reordering categories:', error);
      throw new Error('Failed to reorder categories');
    }
  }

  async mergeCategories(sourceId: string, targetId: string): Promise<void> {
    try {
      const sourceCategory = await this.getCategory(sourceId);
      const targetCategory = await this.getCategory(targetId);

      if (!sourceCategory || !targetCategory) {
        throw new Error('Source or target category not found');
      }

      const allPosts = await indexedDB.getAll('posts') as any[];

      for (const post of allPosts) {
        if (post.categories && post.categories.includes(sourceId)) {
          post.categories = post.categories.filter((id: string) => id !== sourceId);
          if (!post.categories.includes(targetId)) {
            post.categories.push(targetId);
          }
          await indexedDB.set('posts', post);
        }
      }

      await this.deleteCategory(sourceId);
    } catch (error) {
      console.error('Error merging categories:', error);
      throw new Error('Failed to merge categories');
    }
  }
}

export const categoriesTagsService = new CategoriesTagsService();