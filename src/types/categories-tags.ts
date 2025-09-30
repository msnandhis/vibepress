export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  color?: string;
  icon?: string;
  image?: string;
  postCount: number;
  order: number;
  isFeatured: boolean;
  seo?: CategorySEO;
  createdAt: string;
  updatedAt: string;
}

export interface CategorySEO {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  postCount: number;
  isFeatured: boolean;
  seo?: TagSEO;
  createdAt: string;
  updatedAt: string;
}

export interface TagSEO {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
}

export interface CategoryFilters {
  search?: string;
  parentId?: string;
  featured?: boolean;
  sortBy?: 'name' | 'postCount' | 'order' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface TagFilters {
  search?: string;
  featured?: boolean;
  sortBy?: 'name' | 'postCount' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CategoryStats {
  totalCategories: number;
  topLevelCategories: number;
  featuredCategories: number;
  totalPostsInCategories: number;
  topCategories: Array<{
    category: Category;
    postCount: number;
  }>;
}

export interface TagStats {
  totalTags: number;
  featuredTags: number;
  totalPostsInTags: number;
  topTags: Array<{
    tag: Tag;
    postCount: number;
  }>;
  popularTags: Array<{
    tag: Tag;
    postCount: number;
  }>;
}

export interface CategoryCreate {
  name: string;
  description?: string;
  parentId?: string;
  color?: string;
  icon?: string;
  image?: string;
  isFeatured?: boolean;
  seo?: Partial<CategorySEO>;
}

export interface CategoryUpdate {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string;
  color?: string;
  icon?: string;
  image?: string;
  isFeatured?: boolean;
  order?: number;
  seo?: Partial<CategorySEO>;
}

export interface TagCreate {
  name: string;
  description?: string;
  color?: string;
  isFeatured?: boolean;
  seo?: Partial<TagSEO>;
}

export interface TagUpdate {
  name?: string;
  slug?: string;
  description?: string;
  color?: string;
  isFeatured?: boolean;
  seo?: Partial<TagSEO>;
}

export interface CategoryListResponse {
  categories: Category[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: CategoryFilters;
}

export interface TagListResponse {
  tags: Tag[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: TagFilters;
}

export interface CategoryHierarchy {
  categories: Category[];
  tree: Category[];
}

export interface TaxonomyUsage {
  categories: Array<{
    id: string;
    name: string;
    postCount: number;
  }>;
  tags: Array<{
    id: string;
    name: string;
    postCount: number;
  }>;
}

// Utility functions
export function generateCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function generateTagSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function validateCategoryName(name: string): { isValid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Category name is required' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Category name must be at least 2 characters long' };
  }

  if (name.trim().length > 50) {
    return { isValid: false, error: 'Category name must be less than 50 characters' };
  }

  return { isValid: true };
}

export function validateTagName(name: string): { isValid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Tag name is required' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Tag name must be at least 2 characters long' };
  }

  if (name.trim().length > 30) {
    return { isValid: false, error: 'Tag name must be less than 30 characters' };
  }

  return { isValid: true };
}

export function getDefaultCategoryColor(): string {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function getDefaultTagColor(): string {
  const colors = [
    '#64748b', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#f59e0b',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}