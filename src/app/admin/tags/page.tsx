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
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { categoriesTagsService } from '@/lib/categories-tags-service';
import { Tag } from '@/types/categories-tags';
import {
  Plus,
  Edit,
  Trash2,
  Hash,
  Search,
  Download,
  Star,
  Grid,
  List
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function TagsPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagStats, setTagStats] = useState<any>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'regular'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'postCount' | 'createdAt' | 'updatedAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    if (!isSessionPending && !session?.user) {
      router.push("/sign-in");
      return;
    }
    if (session?.user) {
      loadData();
    }
  }, [session, isSessionPending, router, page, featuredFilter, sortBy, sortOrder]);

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

      const [tagsResponse, stats] = await Promise.all([
        categoriesTagsService.getTags({
          search: searchTerm,
          featured: featuredFilter === 'all' ? undefined : featuredFilter === 'featured',
          sortBy,
          sortOrder,
        }, page, 20),
        categoriesTagsService.getTagStats(),
      ]);

      setTags(tagsResponse.tags);
      setPagination(tagsResponse.pagination);
      setTagStats(stats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTags(tags.map(t => t.id));
    } else {
      setSelectedTags([]);
    }
  };

  const handleSelectTag = (tagId: string, checked: boolean) => {
    if (checked) {
      setSelectedTags(prev => [...prev, tagId]);
    } else {
      setSelectedTags(prev => prev.filter(id => id !== tagId));
    }
  };

  const handleBulkAction = async (action: 'delete' | 'featured' | 'regular') => {
    if (selectedTags.length === 0) return;

    if (action === 'delete') {
      if (!confirm(`Are you sure you want to delete ${selectedTags.length} tag(s)?`)) {
        return;
      }
    }

    try {
      switch (action) {
        case 'delete':
          await categoriesTagsService.bulkDeleteTags(selectedTags);
          break;
        case 'featured':
          await categoriesTagsService.bulkUpdateTags(selectedTags, { isFeatured: true });
          break;
        case 'regular':
          await categoriesTagsService.bulkUpdateTags(selectedTags, { isFeatured: false });
          break;
      }

      setSelectedTags([]);
      loadData();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to perform action');
    }
  };

  const handleExport = () => {
    const data = tags.map(tag => ({
      name: tag.name,
      slug: tag.slug,
      description: tag.description || '',
      'post count': tag.postCount,
      featured: tag.isFeatured ? 'Yes' : 'No',
      color: tag.color || '',
      created: format(new Date(tag.createdAt), 'MMM d, yyyy'),
      updated: format(new Date(tag.updatedAt), 'MMM d, yyyy'),
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tags-export.csv';
    a.click();
    URL.revokeObjectURL(url);
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
          <h1 className="text-3xl font-bold text-foreground">Tags</h1>
          <p className="text-muted-foreground">Manage your content tags</p>
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
          <Button onClick={() => {/* Navigate to new tag */}}>
            <Plus className="h-4 w-4 mr-2" />
            New Tag
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tags</p>
                <p className="text-2xl font-bold">{tagStats?.totalTags || 0}</p>
              </div>
              <Hash className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Featured</p>
                <p className="text-2xl font-bold">{tagStats?.featuredTags || 0}</p>
              </div>
              <Star className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Posts with Tags</p>
                <p className="text-2xl font-bold">{tagStats?.totalPostsInTags || 0}</p>
              </div>
              <Hash className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Tag</p>
                <p className="text-lg font-bold truncate">
                  {tagStats?.topTags?.[0]?.tag?.name || 'None'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tagStats?.topTags?.[0]?.postCount || 0} posts
                </p>
              </div>
              <Star className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tags</CardTitle>
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
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
              <Input
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
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
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="postCount">Post Count</SelectItem>
                  <SelectItem value="createdAt">Created</SelectItem>
                  <SelectItem value="updatedAt">Updated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {selectedTags.length > 0 && (
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm">
                {selectedTags.length} tag(s) selected
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
                  onClick={() => setSelectedTags([])}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {tags.length === 0 ? (
            <EmptyState
              icon={<Hash className="h-12 w-12" />}
              title="No tags found"
              description={
                searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Get started by creating your first tag'
              }
              action={
                !searchTerm && (
                  <Button onClick={() => {/* Navigate to new tag */}}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Tag
                  </Button>
                )
              }
            />
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {tags.map((tag) => (
                    <Card key={tag.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedTags.includes(tag.id)}
                              onCheckedChange={(checked) => handleSelectTag(tag.id, checked as boolean)}
                            />
                            {tag.color && (
                              <div
                                className="w-4 h-4 rounded-full flex-shrink-0"
                                style={{ backgroundColor: tag.color }}
                              />
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {tag.isFeatured && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {/* Navigate to edit */}}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <h3 className="font-semibold mb-1">{tag.name}</h3>
                        <code className="text-xs bg-muted px-2 py-1 rounded mb-2 inline-block">
                          {tag.slug}
                        </code>
                        {tag.description && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {tag.description}
                          </p>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {tag.postCount} posts
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedTags.length === tags.length && tags.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Posts</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tags.map((tag) => (
                      <TableRow key={tag.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedTags.includes(tag.id)}
                            onCheckedChange={(checked) => handleSelectTag(tag.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {tag.color && (
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: tag.color }}
                              />
                            )}
                            <span className="font-medium">{tag.name}</span>
                            {tag.isFeatured && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {tag.slug}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground max-w-xs truncate">
                            {tag.description || '—'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {tag.postCount} posts
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(tag.updatedAt), 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {/* Navigate to edit */}}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} tags
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