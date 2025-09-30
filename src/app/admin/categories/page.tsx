'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { StatusBadge } from '@/components/ui/status-badge';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { categoriesTagsService } from '@/lib/categories-tags-service';
import { Category, CategoryFilters } from '@/types/categories-tags';
import {
  Plus,
  Edit,
  Trash2,
  FolderOpen,
  FolderTree,
  Search,
  Filter,
  Download,
  ChevronRight,
  MoreVertical,
  Grid,
  List,
  Star,
  Hash
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function CategoriesPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryStats, setCategoryStats] = useState<any>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [parentFilter, setParentFilter] = useState<string>('all');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'regular'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'postCount' | 'order' | 'createdAt' | 'updatedAt'>('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [availableParents, setAvailableParents] = useState<Category[]>([]);

  useEffect(() => {
    if (!isSessionPending && !session?.user) {
      router.push("/sign-in");
      return;
    }
    if (session?.user) {
      loadData();
    }
  }, [session, isSessionPending, router, page, parentFilter, featuredFilter, sortBy, sortOrder]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      if (session?.user) {
        loadData();
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, session]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [categoriesResponse, stats, allCategories] = await Promise.all([
        categoriesTagsService.getCategories({
          search: searchTerm,
          parentId: parentFilter === 'all' ? undefined : parentFilter === 'none' ? undefined : parentFilter,
          featured: featuredFilter === 'all' ? undefined : featuredFilter === 'featured',
          sortBy,
          sortOrder,
        }, page, 20),
        categoriesTagsService.getCategoryStats(),
        categoriesTagsService.getCategories({}),
      ]);

      setCategories(categoriesResponse.categories);
      setPagination(categoriesResponse.pagination);
      setCategoryStats(stats);
      setAvailableParents(allCategories.categories);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCategories(categories.map(c => c.id));
    } else {
      setSelectedCategories([]);
    }
  };

  const handleSelectCategory = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryId]);
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    }
  };

  const handleBulkAction = async (action: 'delete' | 'featured' | 'regular') => {
    if (selectedCategories.length === 0) return;

    if (action === 'delete') {
      if (!confirm(`Are you sure you want to delete ${selectedCategories.length} category(ies)?`)) {
        return;
      }
    }

    try {
      switch (action) {
        case 'delete':
          await categoriesTagsService.bulkDeleteCategories(selectedCategories);
          break;
        case 'featured':
          await categoriesTagsService.bulkUpdateCategories(selectedCategories, { isFeatured: true });
          break;
        case 'regular':
          await categoriesTagsService.bulkUpdateCategories(selectedCategories, { isFeatured: false });
          break;
      }

      setSelectedCategories([]);
      loadData();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to perform action');
    }
  };

  const handleExport = () => {
    const data = categories.map(category => ({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parent: category.parent?.name || 'None',
      'post count': category.postCount,
      order: category.order,
      featured: category.isFeatured ? 'Yes' : 'No',
      created: format(new Date(category.createdAt), 'MMM d, yyyy'),
      updated: format(new Date(category.updatedAt), 'MMM d, yyyy'),
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'categories-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderCategoryHierarchy = (category: Category, level = 0) => {
    const indent = level * 20;
    return (
      <TableRow key={category.id}>
        <TableCell>
          <Checkbox
            checked={selectedCategories.includes(category.id)}
            onCheckedChange={(checked) => handleSelectCategory(category.id, checked as boolean)}
          />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2" style={{ paddingLeft: `${indent}px` }}>
            {level > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
            <span className="font-medium">{category.name}</span>
            {category.isFeatured && (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            )}
            {category.color && (
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: category.color }}
              />
            )}
          </div>
        </TableCell>
        <TableCell>
          <code className="text-sm bg-muted px-2 py-1 rounded">
            {category.slug}
          </code>
        </TableCell>
        <TableCell>
          <div className="text-sm text-muted-foreground">
            {category.parent?.name || '—'}
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="secondary" className="text-xs">
            {category.postCount} posts
          </Badge>
        </TableCell>
        <TableCell>
          <div className="text-sm text-muted-foreground">
            {format(new Date(category.updatedAt), 'MMM d, yyyy')}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`/categories/${category.slug}`, '_blank')}
            >
              <FolderOpen className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {/* Navigate to edit */}}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  const renderHierarchyView = (categories: Category[], level = 0) => {
    return categories.map(category => (
      <div key={category.id}>
        {renderCategoryHierarchy(category, level)}
        {category.children && category.children.length > 0 && (
          renderHierarchyView(category.children, level + 1)
        )}
      </div>
    ));
  };

  if (isSessionPending) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!session?.user) {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <LoadingSkeleton className="h-8 w-48" />
          <LoadingSkeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <LoadingSkeleton key={i} className="h-32" />
          ))}
        </div>
        <LoadingSkeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground">Manage your content categories</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => {/* Navigate to new category */}}>
            <Plus className="h-4 w-4 mr-2" />
            New Category
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Categories</p>
                <p className="text-2xl font-bold">{categoryStats?.totalCategories || 0}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Level</p>
                <p className="text-2xl font-bold">{categoryStats?.topLevelCategories || 0}</p>
              </div>
              <FolderTree className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Featured</p>
                <p className="text-2xl font-bold">{categoryStats?.featuredCategories || 0}</p>
              </div>
              <Star className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Posts in Categories</p>
                <p className="text-2xl font-bold">{categoryStats?.totalPostsInCategories || 0}</p>
              </div>
              <Hash className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Categories</CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'tree' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('tree')}
                >
                  <FolderTree className="h-4 w-4" />
                </Button>
              </div>
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={parentFilter} onValueChange={setParentFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Parents</SelectItem>
                  <SelectItem value="none">No Parent</SelectItem>
                  {availableParents.map(parent => (
                    <SelectItem key={parent.id} value={parent.id}>
                      {parent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={featuredFilter} onValueChange={(value: typeof featuredFilter) => setFeaturedFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="order">Order</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="postCount">Post Count</SelectItem>
                  <SelectItem value="createdAt">Created</SelectItem>
                  <SelectItem value="updatedAt">Updated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {selectedCategories.length > 0 && (
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm">
                {selectedCategories.length} category(ies) selected
              </CardDescription>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('featured')}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Mark Featured
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('regular')}
                >
                  Remove Featured
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategories([])}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <EmptyState
              icon={<FolderOpen className="h-12 w-12" />}
              title="No categories found"
              description={
                searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Get started by creating your first category'
              }
              action={
                !searchTerm && (
                  <Button onClick={() => {/* Navigate to new category */}}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Category
                  </Button>
                )
              }
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedCategories.length === categories.length && categories.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Posts</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewMode === 'tree' ? (
                    renderHierarchyView(categories)
                  ) : (
                    categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={(checked) => handleSelectCategory(category.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{category.name}</span>
                            {category.isFeatured && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                            {category.color && (
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {category.slug}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {category.parent?.name || '—'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {category.postCount} posts
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(category.updatedAt), 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`/categories/${category.slug}`, '_blank')}
                            >
                              <FolderOpen className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {/* Navigate to edit */}}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} categories
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, page - 2)) + i;
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}