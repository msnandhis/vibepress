"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { postsService } from "@/lib/posts-service";
import { Post } from "@/types/posts";
import {
  ArrowLeft,
  Edit,
  Eye,
  Calendar,
  User,
  Tag,
  Image as ImageIcon,
  Share2,
  ThumbsUp,
  MessageCircle,
  MoreHorizontal,
  Trash2,
  Copy,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function ViewPostPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const postData = await postsService.getPost(postId);
      if (postData) {
        setPost(postData);
      } else {
        setError("Post not found");
      }
    } catch (err) {
      console.error("Error loading post:", err);
      setError("Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!post || !confirm("Are you sure you want to delete this post?")) return;

    try {
      await postsService.deletePost(post.id);
      toast.success("Post deleted successfully");
      router.push("/admin/posts");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const copyLink = () => {
    const url = `${window.location.origin}/blog/${post?.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const renderContent = (content: any) => {
    if (!content || !content.content) return null;

    const renderNode = (node: any): string => {
      switch (node.type) {
        case "paragraph":
          return `<p class="mb-4">${node.content?.map(renderNode).join("") || ""}</p>`;
        case "heading":
          const level = node.attrs?.level || 1;
          return `<h${level} class="text-${level === 1 ? "3xl" : level === 2 ? "2xl" : "xl"} font-bold mb-4">${node.content?.map(renderNode).join("") || ""}</h${level}>`;
        case "text":
          let text = node.text || "";
          if (node.marks) {
            node.marks.forEach((mark: any) => {
              switch (mark.type) {
                case "bold":
                  text = `<strong>${text}</strong>`;
                  break;
                case "italic":
                  text = `<em>${text}</em>`;
                  break;
                case "code":
                  text = `<code class="bg-muted px-1 py-0.5 rounded">${text}</code>`;
                  break;
                case "link":
                  text = `<a href="${mark.attrs?.href}" class="text-primary hover:underline" target="_blank">${text}</a>`;
                  break;
              }
            });
          }
          return text;
        case "bulletList":
          return `<ul class="list-disc list-inside mb-4 space-y-1">${node.content?.map(renderNode).join("") || ""}</ul>`;
        case "orderedList":
          return `<ol class="list-decimal list-inside mb-4 space-y-1">${node.content?.map(renderNode).join("") || ""}</ol>`;
        case "listItem":
          return `<li>${node.content?.map(renderNode).join("") || ""}</li>`;
        case "blockquote":
          return `<blockquote class="border-l-4 border-primary pl-4 italic mb-4">${node.content?.map(renderNode).join("") || ""}</blockquote>`;
        case "codeBlock":
          return `<pre class="bg-muted p-4 rounded-lg overflow-x-auto mb-4"><code>${node.content?.map(renderNode).join("") || ""}</code></pre>`;
        case "image":
          return `<img src="${node.attrs?.src}" alt="${node.attrs?.alt || ""}" class="max-w-full h-auto rounded-lg my-4" />`;
        case "horizontalRule":
          return `<hr class="my-8 border-t border-border" />`;
        default:
          return node.content?.map(renderNode).join("") || "";
      }
    };

    return content.content.map(renderNode).join("");
  };

  if (isSessionPending || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <LoadingSkeleton className="h-8 w-64" />
          <div className="flex gap-2">
            <LoadingSkeleton className="h-10 w-24" />
            <LoadingSkeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <LoadingSkeleton className="h-12 w-full" />
            <LoadingSkeleton className="h-96 w-full" />
          </div>
          <div className="space-y-4">
            <LoadingSkeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    router.push("/sign-in");
    return null;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => router.push("/admin/posts")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Posts
        </Button>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/posts")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Posts
          </Button>
          <div>
            <h1 className="text-2xl font-bold">View Post</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={post.status} />
              <span className="text-sm text-muted-foreground">
                Last updated: {format(new Date(post.updatedAt), 'MMM d, yyyy HH:mm')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            View Live
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/posts/${post.id}/edit`)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={copyLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Post Header */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {post.isSticky && (
                    <Badge variant="secondary" className="gap-1">
                      📌 Sticky
                    </Badge>
                  )}
                  {post.isFeatured && (
                    <Badge variant="secondary" className="gap-1">
                      ⭐ Featured
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl font-bold leading-tight">{post.title}</h1>

                {post.excerpt && (
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {post.excerpt}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{post.author?.name || "Unknown Author"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{post.viewCount} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{post.likeCount} likes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.commentCount} comments</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          {post.featuredMedia && (
            <Card>
              <CardContent className="p-0">
                <img
                  src={post.featuredMedia.url}
                  alt={post.featuredMedia.altText || post.title}
                  className="w-full h-auto rounded-lg"
                />
                {post.featuredMedia.caption && (
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground italic">
                      {post.featuredMedia.caption}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Post Content */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
              />
            </CardContent>
          </Card>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Post Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Post Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <StatusBadge status={post.status} />
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Category</span>
                  {post.category ? (
                    <Badge variant="outline" style={{ backgroundColor: post.category.color + '20' }}>
                      {post.category.name}
                    </Badge>
                  ) : (
                    <span className="text-sm">Uncategorized</span>
                  )}
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Template</span>
                  <span className="text-sm">{post.template || "Default"}</span>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm">{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Updated</span>
                  <span className="text-sm">{format(new Date(post.updatedAt), 'MMM d, yyyy')}</span>
                </div>

                {post.publishedAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Published</span>
                    <span className="text-sm">{format(new Date(post.publishedAt), 'MMM d, yyyy')}</span>
                  </div>
                )}

                {post.scheduledAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Scheduled</span>
                    <span className="text-sm">{format(new Date(post.scheduledAt), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Author */}
          {post.author && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Author</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback>
                      {post.author.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{post.author.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {post.author.email}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEO Information */}
          {post.seo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {post.seo.metaTitle && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Meta Title</Label>
                    <p className="text-sm">{post.seo.metaTitle}</p>
                  </div>
                )}

                {post.seo.metaDescription && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Meta Description</Label>
                    <p className="text-sm">{post.seo.metaDescription}</p>
                  </div>
                )}

                {post.seo.focusKeyword && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Focus Keyword</Label>
                    <p className="text-sm">{post.seo.focusKeyword}</p>
                  </div>
                )}

                {(post.seo.noIndex || post.seo.noFollow) && (
                  <div className="flex gap-2">
                    {post.seo.noIndex && (
                      <Badge variant="secondary" className="text-xs">No Index</Badge>
                    )}
                    {post.seo.noFollow && (
                      <Badge variant="secondary" className="text-xs">No Follow</Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Revisions */}
          {post.revisions && post.revisions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Revisions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {post.revisions.slice(-3).reverse().map((revision) => (
                    <div key={revision.id} className="text-sm">
                      <div className="font-medium">{revision.title}</div>
                      <div className="text-muted-foreground">
                        {format(new Date(revision.createdAt), 'MMM d, HH:mm')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}