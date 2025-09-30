"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  User,
  Tag,
  Image as ImageIcon,
  FileText,
  Download,
  Upload
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyPosts } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { postsService } from "@/lib/posts-service";
import { Post, PostFilters, PostStatus, PostCategory } from "@/types/posts";

export default function AdminPostsPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategoryForBulk, setSelectedCategoryForBulk] = useState<string>('');

  // Filters
  const [filters, setFilters] = useState<PostFilters>({
    status: 'all',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const itemsPerPage = 10;
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const fetchPosts = useCallback(async () => {
    if (loading) return; // Prevent multiple concurrent calls

    setLoading(true);
    setError(null);
    try {
      const [response, categoriesData] = await Promise.all([
        postsService.getPosts(filters, currentPage, itemsPerPage),
        postsService.getCategories()
      ]);
      setPosts(response.posts);
      setTotalPages(response.pagination.totalPages);
      setTotalPosts(response.pagination.total);
      setCategories(categoriesData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch posts";
      setError(message);
      console.error('Error fetching posts:', err);
      // Only show toast error if it's a new error
      if (message !== error) {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, itemsPerPage, loading, error]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      await postsService.deletePost(id);
      setPosts(prevPosts => prevPosts.filter((p) => p.id !== id));
      toast.success("Post deleted successfully");
      setSelectedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (err) {
      toast.error("Error deleting post");
    }
  };

  const handleBulkAction = async (action: 'publish' | 'unpublish' | 'archive' | 'delete' | 'assign_category') => {
    if (selectedPosts.size === 0) {
      toast.error("No posts selected");
      return;
    }

    const selectedArray = Array.from(selectedPosts);

    try {
      switch (action) {
        case 'publish':
          await postsService.bulkUpdatePosts(selectedArray, { status: 'published' });
          toast.success(`${selectedArray.length} posts published`);
          break;
        case 'unpublish':
          await postsService.bulkUpdatePosts(selectedArray, { status: 'draft' });
          toast.success(`${selectedArray.length} posts unpublished`);
          break;
        case 'archive':
          await postsService.bulkUpdatePosts(selectedArray, { status: 'archived' });
          toast.success(`${selectedArray.length} posts archived`);
          break;
        case 'assign_category':
          setShowCategoryModal(true);
          return;
        case 'delete':
          if (!confirm(`Are you sure you want to delete ${selectedArray.length} posts?`)) return;
          await postsService.bulkDeletePosts(selectedArray);
          toast.success(`${selectedArray.length} posts deleted`);
          break;
      }

      setSelectedPosts(new Set());
      fetchPosts();
    } catch (err) {
      toast.error(`Error performing bulk ${action}`);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPosts(new Set(posts.map(p => p.id)));
    } else {
      setSelectedPosts(new Set());
    }
  };

  const handleSelectPost = (postId: string, checked: boolean) => {
    setSelectedPosts(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(postId);
      } else {
        newSet.delete(postId);
      }
      return newSet;
    });
  };

  const handleBulkAssignCategory = async (categoryId: string | null) => {
    const selectedArray = Array.from(selectedPosts);
    try {
      await postsService.bulkUpdatePosts(selectedArray, { categoryId: categoryId || undefined });
      toast.success(`${selectedArray.length} posts updated`);
      setShowCategoryModal(false);
      setSelectedCategoryForBulk('');
      setSelectedPosts(new Set());
      fetchPosts();
    } catch (err) {
      toast.error("Error assigning category");
    }
  };

  const exportPosts = () => {
    const dataStr = JSON.stringify(posts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `posts_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast.success('Posts exported successfully');
  };

  useEffect(() => {
    if (!isSessionPending && !session?.user) {
      router.push("/sign-in");
      return;
    }
    if (session?.user) {
      fetchPosts();
    }
  }, [session, isSessionPending, router, fetchPosts]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  if (isSessionPending) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Posts</h1>
          <p className="text-muted-foreground">Manage your blog posts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => router.push("/admin/posts/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold">{totalPosts}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold text-green-600">
                  {posts.filter(p => p.status === 'published').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {posts.filter(p => p.status === 'draft').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">
                  {posts.reduce((sum, p) => sum + p.viewCount, 0)}
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Actions
            </CardTitle>
            <div className="flex items-center gap-2">
              {selectedPosts.size > 0 && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Bulk Actions ({selectedPosts.size})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleBulkAction('publish')}>
                        Publish
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction('unpublish')}>
                        Unpublish
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction('archive')}>
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction('assign_category')}>
                        Assign Category
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleBulkAction('delete')}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
              <Button variant="outline" size="sm" onClick={exportPosts}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={filters.search || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters(prev => ({ ...prev, search: value }));
                  if (searchTimeoutRef.current) {
                    clearTimeout(searchTimeoutRef.current);
                  }
                  searchTimeoutRef.current = setTimeout(() => {
                    setCurrentPage(1);
                    fetchPosts();
                  }, 300);
                }}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.status || 'all'}
              onValueChange={(value: PostStatus | 'all') =>
                setFilters(prev => ({ ...prev, status: value === 'all' ? undefined : value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.sortBy || 'createdAt'}
              onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value as any }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="updatedAt">Date Updated</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="viewCount">Views</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.sortOrder || 'desc'}
              onValueChange={(value) => setFilters(prev => ({ ...prev, sortOrder: value as 'asc' | 'desc' }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error display */}
      {error && (
        <div className="rounded-md border border-destructive bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Posts Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedPosts.size === posts.length && posts.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-16">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeleton rows={5} columns={8} />
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedPosts.has(post.id)}
                      onCheckedChange={(checked) => handleSelectPost(post.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium max-w-md">
                    <div className="space-y-1">
                      <div className="font-medium flex items-center gap-2">
                        {post.isSticky && <div className="w-2 h-2 bg-blue-500 rounded-full" title="Sticky Post" />}
                        {post.isFeatured && <div className="w-2 h-2 bg-orange-500 rounded-full" title="Featured Post" />}
                        {post.title}
                      </div>
                      {post.excerpt && (
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {post.excerpt}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Tag className="h-3 w-3" />
                        {post.tags.length > 0 ? (
                          post.tags.slice(0, 2).map(tag => (
                            <span key={tag.id} className="px-1 py-0.5 bg-muted rounded">
                              {tag.name}
                            </span>
                          ))
                        ) : (
                          <span>No tags</span>
                        )}
                        {post.tags.length > 2 && (
                          <span>+{post.tags.length - 2} more</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={post.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {post.author?.name || "Unknown"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {post.category ? (
                      <Badge
                        variant="outline"
                        style={{ backgroundColor: post.category.color + '20' }}
                      >
                        {post.category.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">Uncategorized</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      {post.viewCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/posts/${post.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/blog/${post.slug}`} target="_blank">
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(post.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <EmptyPosts onCreate={() => router.push("/admin/posts/new")} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalPosts)} of {totalPosts} posts
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNum)}
                      isActive={currentPage === pageNum}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Category Assignment Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Assign Category to {selectedPosts.size} Posts</h3>
            <div className="space-y-4">
              <Select value={selectedCategoryForBulk} onValueChange={setSelectedCategoryForBulk}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Remove Category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCategoryModal(false)}>
                  Cancel
                </Button>
                <Button variant="outline" onClick={() => handleBulkAssignCategory(null)}>
                  Remove Category
                </Button>
                <Button onClick={() => handleBulkAssignCategory(selectedCategoryForBulk || null)}>
                  Assign Category
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}