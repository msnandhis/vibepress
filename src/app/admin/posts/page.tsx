"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Eye, Search } from "lucide-react";
import { toast } from "sonner";

type Post = {
  id: number;
  title: string;
  slug: string;
  status: string;
  authorName?: string;
  categories?: { id: number; name: string; color?: string }[];
  tags?: { id: number; name: string }[];
  featuredMediaId?: number;
  viewCount?: number;
  excerpt?: string;
  createdAt: string;
};

const statusBadges: Record<string, string> = {
  draft: "bg-yellow-100 text-yellow-800",
  published: "bg-green-100 text-green-800",
  archived: "bg-gray-100 text-gray-800",
};

export default function AdminPostsPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: itemsPerPage.toString(),
        offset: ((currentPage - 1) * itemsPerPage).toString(),
        ...(searchTerm && { q: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        sort: "createdAt",
        order: "desc",
      });
      const token = localStorage.getItem("bearer_token");
      const res = await fetch(`/api/posts?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch posts");
      }
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch posts";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPosts(prevPosts => prevPosts.filter((p) => p.id !== id));
        toast.success("Post deleted successfully");
      } else {
        toast.error("Failed to delete post");
      }
    } catch (err) {
      toast.error("Error deleting post");
    }
  };

  useEffect(() => {
    if (!isSessionPending && !session?.user) {
      router.push("/sign-in");
      return;
    }
    if (session?.user) {
      fetchPosts();
    }
  }, [session, isSessionPending, router]);

  if (isSessionPending) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!session?.user) {
    return null;
  }

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Posts</h1>
          <p className="text-muted-foreground">Manage your blog posts</p>
        </div>
        <Button onClick={() => router.push("/admin/posts/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-input rounded-md px-3 py-2"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <Button
          variant="outline"
          onClick={() => {
            setSearchTerm("");
            setStatusFilter("all");
            setCurrentPage(1);
          }}
        >
          Clear Filters
        </Button>
      </div>
      {error && (
        <div className="rounded-md border border-destructive bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>Featured Image</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  Loading posts...
                </TableCell>
              </TableRow>
            ) : paginatedPosts && paginatedPosts.length > 0 ? (
              paginatedPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium max-w-md">
                    <div className="space-y-1">
                      <div className="font-medium">{post.title}</div>
                      {post.excerpt && (
                        <div className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-primary hover:underline">
                      {post.slug}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusBadges[post.status] || "bg-muted text-muted-foreground"}>
                      {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{post.authorName || "Unknown"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {(post.categories || []).map((cat) => (
                        <Badge
                          key={cat.id}
                          variant="outline"
                          className="text-xs"
                          style={{ backgroundColor: cat.color || undefined }}
                        >
                          {cat.name}
                        </Badge>
                      ))}
                      {(post.tags || []).slice(0, 3).map((tag) => (
                        <Badge key={tag.id} variant="secondary" className="text-xs">
                          {tag.name}
                        </Badge>
                      ))}
                      {post.tags && post.tags.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{post.tags.length - 3} more</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {post.featuredMediaId ? (
                      <div className="w-12 h-12 bg-muted rounded overflow-hidden">
                        <img
                          src={`/api/media/${post.featuredMediaId}`}
                          alt="Featured"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    ) : (
                      "None"
                    )}
                  </TableCell>
                  <TableCell>{post.viewCount || 0}</TableCell>
                  <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="flex space-x-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/posts/${post.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/blog/${post.slug}`, "_blank")}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  No posts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {filteredPosts.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}