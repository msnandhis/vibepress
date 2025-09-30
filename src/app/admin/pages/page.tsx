'use client';

import { useState, useEffect } from 'react';
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
import { pagesService } from '@/lib/pages-service';
import { Page, PageStatus } from '@/types/pages';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Download,
  FileText,
  Calendar,
  LayoutTemplate,
  ChevronRight,
  MoreVertical,
  Grid,
  List
} from 'lucide-react';
import { format } from 'date-fns';

export default function PagesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<Page[]>([]);
  const [pageStats, setPageStats] = useState<any>(null);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PageStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'order' | 'title' | 'createdAt' | 'updatedAt'>('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [page, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      loadData();
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [pagesResponse, stats] = await Promise.all([
        pagesService.getPages({
          status: statusFilter,
          search: searchTerm,
          sortBy,
          sortOrder,
        }, page, 20),
        pagesService.getPageStats()
      ]);

      setPages(pagesResponse.pages);
      setPagination(pagesResponse.pagination);
      setPageStats(stats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPages(pages.map(p => p.id));
    } else {
      setSelectedPages([]);
    }
  };

  const handleSelectPage = (pageId: string, checked: boolean) => {
    if (checked) {
      setSelectedPages(prev => [...prev, pageId]);
    } else {
      setSelectedPages(prev => prev.filter(id => id !== pageId));
    }
  };

  const handleBulkAction = async (action: 'publish' | 'draft' | 'archive' | 'delete') => {
    if (selectedPages.length === 0) return;

    if (action === 'delete') {
      if (!confirm(`Are you sure you want to delete ${selectedPages.length} page(s)?`)) {
        return;
      }
    }

    try {
      switch (action) {
        case 'publish':
          await pagesService.bulkUpdatePages(selectedPages, { status: 'published' });
          break;
        case 'draft':
          await pagesService.bulkUpdatePages(selectedPages, { status: 'draft' });
          break;
        case 'archive':
          await pagesService.bulkUpdatePages(selectedPages, { status: 'archived' });
          break;
        case 'delete':
          await pagesService.bulkDeletePages(selectedPages);
          break;
      }

      setSelectedPages([]);
      loadData();
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const handleExport = () => {
    const data = pages.map(page => ({
      title: page.title,
      slug: page.slug,
      status: page.status,
      author: page.author?.name,
      template: page.template,
      'show in menu': page.showInMenu,
      created: format(new Date(page.createdAt), 'MMM d, yyyy'),
      updated: format(new Date(page.updatedAt), 'MMM d, yyyy'),
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pages-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pages</h1>
          <p className="text-muted-foreground">Manage your static pages</p>
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
          <Button onClick={() => router.push('/admin/pages/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Page
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pages</p>
                <p className="text-2xl font-bold">{pageStats?.totalPages || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">{pageStats?.publishedPages || 0}</p>
              </div>
              <StatusBadge status="published" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold">{pageStats?.draftPages || 0}</p>
              </div>
              <StatusBadge status="draft" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Menu</p>
                <p className="text-2xl font-bold">{pageStats?.totalPagesInMenu || 0}</p>
              </div>
              <LayoutTemplate className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pages</CardTitle>
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
                placeholder="Search pages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={statusFilter} onValueChange={(value: PageStatus | 'all') => setStatusFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="order">Order</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="createdAt">Created</SelectItem>
                  <SelectItem value="updatedAt">Updated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {selectedPages.length > 0 && (
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm">
                {selectedPages.length} page(s) selected
              </CardDescription>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('publish')}
                >
                  Publish
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('draft')}
                >
                  Draft
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('archive')}
                >
                  Archive
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                >
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPages([])}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {pages.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No pages found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first page'}
              </p>
              {!searchTerm && (
                <Button onClick={() => router.push('/admin/pages/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Page
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedPages.length === pages.length && pages.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedPages.includes(page.id)}
                          onCheckedChange={(checked) => handleSelectPage(page.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{page.title}</span>
                          {page.parent && (
                            <Badge variant="outline" className="text-xs">
                              Child
                            </Badge>
                          )}
                          {page.showInMenu && (
                            <Badge variant="secondary" className="text-xs">
                              Menu
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {page.slug}
                        </code>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={page.status} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {page.template || 'default'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(page.updatedAt), 'MMM d, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/pages/${page.slug}`, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/pages/${page.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} pages
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